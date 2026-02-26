import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AuthTokens } from 'apps/auth/src/token-key/token-key.service';
import { AUTH_MESSAGE_PATTERNS } from 'libs/constant/message-pattern-auth.constant';
import { NAME_SERVICE_TCP } from 'libs/constant/port-tcp.constant';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthOauthService {
  private readonly logger = new Logger(AuthOauthService.name);

  constructor(
    @Inject(NAME_SERVICE_TCP.AUTH_SERVICE)
    private readonly authClient: ClientProxy,
  ) {}

  async generateTokensForUser(user: {
    id: number;
    username: string;
    email: string;
    role?: string;
  }): Promise<AuthTokens> {
    this.logger.log(`Generating OAuth tokens for user: ${user.username}`);

    return await firstValueFrom<AuthTokens>(
      this.authClient.send(AUTH_MESSAGE_PATTERNS.CREATE_USER_AUTH_TOKEN, {
        userId: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      }),
    );
  }
}
