import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { SetupService } from './setup.service';

/** Blocks access to setup endpoints once installation is complete. */
@Injectable()
export class SetupNotCompleteGuard implements CanActivate {
  constructor(private setupService: SetupService) {}

  canActivate(_ctx: ExecutionContext): boolean {
    if (this.setupService.isComplete()) {
      throw new ForbiddenException('Setup already completed');
    }
    return true;
  }
}
