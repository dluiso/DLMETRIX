import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host:   this.config.get('mail.host', 'smtp.gmail.com'),
      port:   this.config.get<number>('mail.port', 587),
      secure: this.config.get<boolean>('mail.secure', false),
      auth: {
        user: this.config.get('mail.user', ''),
        pass: this.config.get('mail.pass', ''),
      },
    });
  }

  async sendEmailVerification(to: string, name: string, verifyUrl: string) {
    const from = this.config.get('mail.from', 'noreply@dlmetrix.com');

    try {
      await this.transporter.sendMail({
        from: `"DLMETRIX" <${from}>`,
        to,
        subject: 'Verify your DLMETRIX email',
        html: `
<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;background:#f8fafc;padding:40px 0;margin:0">
  <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:16px;padding:40px;border:1px solid #e2e8f0">
    <div style="text-align:center;margin-bottom:32px">
      <h2 style="color:#2563eb;margin:0;font-size:24px">DLMETRIX</h2>
    </div>
    <h3 style="margin:0 0 8px;color:#0f172a">Welcome, ${name}!</h3>
    <p style="color:#64748b;margin:0 0 24px">
      Thank you for registering. Please verify your email address to unlock all features.
    </p>
    <a href="${verifyUrl}" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;margin-bottom:24px">
      Verify Email
    </a>
    <p style="color:#94a3b8;font-size:13px;margin:0">
      This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.
    </p>
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0">
    <p style="color:#cbd5e1;font-size:12px;text-align:center;margin:0">
      © ${new Date().getFullYear()} DLMETRIX. All rights reserved.
    </p>
  </div>
</body>
</html>`,
      });
    } catch (err) {
      this.logger.error(`Failed to send verification email to ${to}`, err);
    }
  }

  async sendPasswordReset(to: string, name: string, resetUrl: string) {
    const from = this.config.get('mail.from', 'noreply@dlmetrix.com');

    try {
      await this.transporter.sendMail({
        from: `"DLMETRIX" <${from}>`,
        to,
        subject: 'Reset your DLMETRIX password',
        html: `
<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;background:#f8fafc;padding:40px 0;margin:0">
  <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:16px;padding:40px;border:1px solid #e2e8f0">
    <div style="text-align:center;margin-bottom:32px">
      <h2 style="color:#2563eb;margin:0;font-size:24px">DLMETRIX</h2>
    </div>
    <h3 style="margin:0 0 8px;color:#0f172a">Reset your password</h3>
    <p style="color:#64748b;margin:0 0 24px">
      Hi ${name}, we received a request to reset your password. Click the button below to choose a new one.
    </p>
    <a href="${resetUrl}" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;margin-bottom:24px">
      Reset Password
    </a>
    <p style="color:#94a3b8;font-size:13px;margin:0">
      This link expires in 15 minutes. If you didn't request a password reset, you can safely ignore this email.
    </p>
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0">
    <p style="color:#cbd5e1;font-size:12px;text-align:center;margin:0">
      © ${new Date().getFullYear()} DLMETRIX. All rights reserved.
    </p>
  </div>
</body>
</html>`,
      });
    } catch (err) {
      this.logger.error(`Failed to send password reset email to ${to}`, err);
      // Don't throw — avoids email enumeration timing attacks
    }
  }
}
