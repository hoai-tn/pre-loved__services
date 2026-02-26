import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-facebook';
import { ClientProxy } from '@nestjs/microservices';
import { USER_MESSAGE_PATTERN } from 'libs/constant/message-pattern.constant';
import { NAME_SERVICE_TCP } from 'libs/constant/port-tcp.constant';
import { firstValueFrom, timeout } from 'rxjs';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  private readonly logger = new Logger(FacebookStrategy.name);

  constructor(
    configService: ConfigService,
    @Inject(NAME_SERVICE_TCP.USER_SERVICE)
    private readonly userClient: ClientProxy,
  ) {
    super({
      clientID: configService.get<string>('FACEBOOK_APP_ID')!,
      clientSecret: configService.get<string>('FACEBOOK_APP_SECRET')!,
      callbackURL: configService.get<string>('FACEBOOK_CALLBACK_URL')!,
      scope: 'email',
      profileFields: ['id', 'emails', 'name', 'photos'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: (error: any, user?: any) => void,
  ) {
    try {
      const { id, emails, name, photos } = profile;

      const user = await firstValueFrom(
        this.userClient
          .send(
            { cmd: USER_MESSAGE_PATTERN.FIND_OR_CREATE_OAUTH_USER },
            {
              provider: 'facebook',
              providerId: id,
              email: emails?.[0]?.value,
              name: name
                ? `${name.givenName || ''} ${name.familyName || ''}`.trim()
                : undefined,
              avatar: photos?.[0]?.value,
            },
          )
          .pipe(timeout(10000)),
      );

      done(null, user);
    } catch (error) {
      this.logger.error('Facebook OAuth validation failed', error);
      done(error, null);
    }
  }
}
