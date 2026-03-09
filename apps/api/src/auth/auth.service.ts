import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
    private jwtService: JwtService,
    private config: ConfigService,
    private mail: MailService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (user.status === 'SUSPENDED')
      throw new UnauthorizedException('Account suspended');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const { passwordHash, ...result } = user;
    return result;
  }

  async login(user: any) {
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    // Store refresh token
    await this.prisma.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return { user: this.sanitizeUser(user), ...tokens };
  }

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        passwordHash,
        locale: dto.locale || 'en',
        role: 'PRO',
        status: 'ACTIVE',
      },
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    await this.prisma.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // Send verification email (non-blocking)
    this.sendVerificationEmail(user.id, user.email, user.name).catch(() => {});

    return { user: this.sanitizeUser(user), ...tokens };
  }

  async sendVerificationEmail(userId: string, email: string, name: string) {
    const secret = this.config.get('jwt.secret') + userId;
    const token = await this.jwtService.signAsync(
      { sub: userId, type: 'email-verify' },
      { secret, expiresIn: '24h' },
    );
    const frontendUrl = this.config.get('frontendUrl', 'http://localhost:3000');
    const verifyUrl = `${frontendUrl}/verify-email?token=${token}`;
    await this.mail.sendEmailVerification(email, name, verifyUrl);
  }

  async verifyEmail(token: string) {
    let payload: any;
    try {
      payload = this.jwtService.decode(token);
    } catch {
      throw new BadRequestException('Invalid verification token');
    }

    if (!payload?.sub || payload.type !== 'email-verify') {
      throw new BadRequestException('Invalid verification token');
    }

    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) throw new BadRequestException('User not found');
    if (user.emailVerified) return { message: 'Email already verified' };

    const secret = this.config.get('jwt.secret') + user.id;
    try {
      await this.jwtService.verifyAsync(token, { secret });
    } catch {
      throw new BadRequestException('Verification link has expired. Please request a new one.');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true },
    });

    return { message: 'Email verified successfully' };
  }

  async resendVerification(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');
    if (user.emailVerified) return { message: 'Email already verified' };
    await this.sendVerificationEmail(user.id, user.email, user.name);
    return { message: 'Verification email sent' };
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const storedToken = await this.prisma.refreshToken.findFirst({
      where: { token: refreshToken, userId },
      include: { user: true },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Rotate token
    await this.prisma.refreshToken.delete({ where: { id: storedToken.id } });

    const tokens = await this.generateTokens(userId, storedToken.user.email, storedToken.user.role);

    await this.prisma.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return tokens;
  }

  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      await this.prisma.refreshToken.deleteMany({
        where: { userId, token: refreshToken },
      });
    } else {
      // Logout from all devices
      await this.prisma.refreshToken.deleteMany({ where: { userId } });
    }
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: { include: { plan: true } },
      },
    });
    if (!user) throw new UnauthorizedException();
    const { passwordHash, ...rest } = user;
    return rest;
  }

  // ── Password Reset ────────────────────────────────────────────────────────

  async forgotPassword(email: string) {
    // Always return success to prevent email enumeration
    const user = await this.usersService.findByEmail(email);
    if (!user) return { message: 'If that email exists, a reset link has been sent.' };

    // Sign a short-lived token; secret includes password hash so it auto-invalidates after use
    const secret = this.config.get('jwt.secret') + user.passwordHash.slice(-16);
    const token = await this.jwtService.signAsync(
      { sub: user.id, type: 'password-reset' },
      { secret, expiresIn: '15m' },
    );

    const frontendUrl = this.config.get('frontendUrl', 'http://localhost:3000');
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

    await this.mail.sendPasswordReset(user.email, user.name, resetUrl);

    return { message: 'If that email exists, a reset link has been sent.' };
  }

  async resetPassword(token: string, newPassword: string) {
    // First decode without verification to get the user id
    let payload: any;
    try {
      payload = this.jwtService.decode(token);
    } catch {
      throw new BadRequestException('Invalid reset token');
    }

    if (!payload?.sub || payload.type !== 'password-reset') {
      throw new BadRequestException('Invalid reset token');
    }

    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) throw new BadRequestException('Invalid reset token');

    // Verify with secret that includes current password hash (invalidates after use)
    const secret = this.config.get('jwt.secret') + user.passwordHash.slice(-16);
    try {
      await this.jwtService.verifyAsync(token, { secret });
    } catch {
      throw new BadRequestException('Reset link has expired or already been used');
    }

    if (newPassword.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters');
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    // Invalidate all refresh tokens
    await this.prisma.refreshToken.deleteMany({ where: { userId: user.id } });

    return { message: 'Password reset successfully' };
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.config.get('jwt.secret'),
        expiresIn: this.config.get('jwt.expiresIn', '15m'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.config.get('jwt.refreshSecret'),
        expiresIn: this.config.get('jwt.refreshExpiresIn', '7d'),
      }),
    ]);

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes in seconds
    };
  }

  private sanitizeUser(user: any) {
    const { passwordHash, ...rest } = user;
    return rest;
  }
}
