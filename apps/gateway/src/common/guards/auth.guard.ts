import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ClientProxy } from '@nestjs/microservices';
import { TokenPayload } from 'apps/auth/src/token-key/token-key.service';
import { Request } from 'express';
import { AUTH_MESSAGE_PATTERNS } from 'libs/constant/message-pattern-auth.constant';
import { NAME_SERVICE_TCP } from 'libs/constant/port-tcp.constant';
import { firstValueFrom, timeout } from 'rxjs';

interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(
    @Inject(NAME_SERVICE_TCP.AUTH_SERVICE)
    private readonly authClient: ClientProxy,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const role = this.reflector.get<string[]>('roles', context.getHandler());
    this.logger.log('role', role);

    const token = this.extractTokenFromHeader(request);

    if (!token) {
      this.logger.error('No token provided');
      throw new UnauthorizedException('Unauthorized');
    }

    try {
      const payload = await firstValueFrom<TokenPayload>(
        this.authClient
          .send<TokenPayload>(AUTH_MESSAGE_PATTERNS.VALIDATE_ACCESS_TOKEN, {
            token,
          })
          .pipe(timeout(5000)),
      );

      // Attach user payload to request for use in controllers
      request.user = payload;
      return true;
    } catch (error) {
      this.logger.error('Token validation failed', error);
      throw new UnauthorizedException('Unauthorized');
    }
  }

  private extractTokenFromHeader(
    request: AuthenticatedRequest,
  ): string | undefined {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return undefined;
    }
    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}
