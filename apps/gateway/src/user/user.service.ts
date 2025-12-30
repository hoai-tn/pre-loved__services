import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AuthTokens } from 'apps/auth/src/token-key/token-key.service';
import { User } from 'apps/user/src/entity/user.entity';
import { AUTH_MESSAGE_PATTERNS } from 'libs/constant/message-pattern-auth.constant';
import { USER_MESSAGE_PATTERN } from 'libs/constant/message-pattern.constant';
import { NAME_SERVICE_TCP } from 'libs/constant/port-tcp.constant';
import { catchError, firstValueFrom, throwError, timeout } from 'rxjs';
import { MicroserviceErrorHandler } from '../common/microservice-error.handler';
import { LoginUserDto, RegisterUserDto } from './dto/user.dto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @Inject(NAME_SERVICE_TCP.USER_SERVICE)
    private readonly userClient: ClientProxy,
    @Inject(NAME_SERVICE_TCP.AUTH_SERVICE)
    private readonly authClient: ClientProxy,
  ) {}

  async register(dto: RegisterUserDto) {
    try {
      this.logger.log(`Registering user: ${JSON.stringify(dto)}`);
      return await firstValueFrom<unknown>(
        this.userClient
          .send({ cmd: USER_MESSAGE_PATTERN.REGISTER_USER }, dto)
          .pipe(
            timeout(10000),
            catchError((error: unknown) => throwError(() => error)),
          ),
      );
    } catch (error) {
      MicroserviceErrorHandler.handleError(
        error,
        'register user',
        'User Service',
      );
    }
  }

  async login(dto: LoginUserDto) {
    try {
      this.logger.log(`User login attempt: ${dto.username}`);

      const user = await firstValueFrom<User>(
        this.userClient
          .send({ cmd: USER_MESSAGE_PATTERN.LOGIN_USER }, dto)
          .pipe(
            timeout(10000),
            catchError((error: unknown) => throwError(() => error)),
          ),
      );

      const authToken = await firstValueFrom<AuthTokens>(
        this.authClient.send(AUTH_MESSAGE_PATTERNS.CREATE_USER_AUTH_TOKEN, {
          userId: user.id,
          username: user.username,
          email: user.email,
        }),
      );
      this.logger.debug(` Auth token: ${JSON.stringify(authToken)}`);
      return {
        user,
        authToken,
      };
    } catch (error) {
      MicroserviceErrorHandler.handleError(error, 'login user', 'User Service');
    }
  }

  async refreshToken(refreshToken: string) {
    try {
      return await firstValueFrom<AuthTokens>(
        this.authClient
          .send<AuthTokens>(AUTH_MESSAGE_PATTERNS.REFRESH_ACCESS_TOKEN, {
            refreshToken,
          })
          .pipe(
            timeout(10000),
            catchError((error: unknown) => throwError(() => error)),
          ),
      );
    } catch (error) {
      MicroserviceErrorHandler.handleError(
        error,
        'refresh token',
        'Auth Service',
      );
    }
  }

  async getUserInfo(userId: number) {
    try {
      return await firstValueFrom<unknown>(
        this.userClient
          .send({ cmd: USER_MESSAGE_PATTERN.GET_USER_INFO }, userId)
          .pipe(
            timeout(10000),
            catchError((error: unknown) => throwError(() => error)),
          ),
      );
    } catch (error) {
      MicroserviceErrorHandler.handleError(
        error,
        `get user info for ID: ${userId}`,
        'User Service',
      );
    }
  }

  async getAllUsers() {
    try {
      return await firstValueFrom<unknown>(
        this.userClient
          .send({ cmd: USER_MESSAGE_PATTERN.GET_ALL_USERS }, {})
          .pipe(
            timeout(10000),
            catchError((error: unknown) => throwError(() => error)),
          ),
      );
    } catch (error) {
      MicroserviceErrorHandler.handleError(
        error,
        'get all users',
        'User Service',
      );
    }
  }
}
