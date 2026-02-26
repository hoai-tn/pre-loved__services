import { Inject, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { ClientProxy } from '@nestjs/microservices';
import { USER_MESSAGE_PATTERN } from 'libs/constant/message-pattern.constant';
import { NAME_SERVICE_TCP } from 'libs/constant/port-tcp.constant';
import { firstValueFrom, timeout } from 'rxjs';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  private readonly logger = new Logger(LocalStrategy.name);

  constructor(
    @Inject(NAME_SERVICE_TCP.USER_SERVICE)
    private readonly userClient: ClientProxy,
  ) {
    super({
      usernameField: 'username',
      passwordField: 'password',
    });
  }

  async validate(username: string, password: string) {
    try {
      const user = await firstValueFrom(
        this.userClient
          .send({ cmd: USER_MESSAGE_PATTERN.LOGIN_USER }, { username, password })
          .pipe(timeout(10000)),
      );

      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      return user;
    } catch (error) {
      this.logger.error('Local strategy validation failed', error);
      throw new UnauthorizedException('Invalid credentials');
    }
  }
}
