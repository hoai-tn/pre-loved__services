import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ClientProxy } from '@nestjs/microservices';
import { USER_MESSAGE_PATTERN } from 'libs/constant/message-pattern.constant';
import { NAME_SERVICE_TCP } from 'libs/constant/port-tcp.constant';
import { firstValueFrom, timeout } from 'rxjs';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private readonly logger = new Logger(GoogleStrategy.name);

  constructor(
    configService: ConfigService,
    @Inject(NAME_SERVICE_TCP.USER_SERVICE)
    private readonly userClient: ClientProxy,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID')!,
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET')!,
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL')!,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ) {
    try {
      const { id, emails, displayName, photos } = profile;

      const user = await firstValueFrom(
        this.userClient
          .send(
            { cmd: USER_MESSAGE_PATTERN.FIND_OR_CREATE_OAUTH_USER },
            {
              provider: 'google',
              providerId: id,
              email: emails?.[0]?.value,
              name: displayName,
              avatar: photos?.[0]?.value,
            },
          )
          .pipe(timeout(10000)),
      );

      done(null, user);
    } catch (error) {
      this.logger.error('Google OAuth validation failed', error);
      done(error, undefined);
    }
  }
}
