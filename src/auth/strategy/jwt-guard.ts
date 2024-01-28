import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor() {
    super({
      passReqToCallback: true,
    });
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context);
  }

  handleRequest(err, user) {
    if (err) {
      throw new UnauthorizedException('Authentication failed');
    }

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }
}
