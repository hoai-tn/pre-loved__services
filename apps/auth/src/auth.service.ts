import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'apps/user/src/entity/user.entity';
import { Repository } from 'typeorm';
import { AuthUser } from './entity/auth-user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(AuthUser)
    private readonly authUserRepository: Repository<AuthUser>,
  ) {}
  getHello(): string {
    return 'Hello World!';
  }

  async createUserAuthToken(payload: User) {
    const authUser = this.authUserRepository.upsert(
      {
        userId: payload.id,
        username: payload.username,
        email: payload.email,
        passwordHash: 'render password',
        isActive: true,
        failedLoginAttempts: 0,
        lastSuccessfulLoginAt: new Date(),
      },
      {
        conflictPaths: ['userId'],
        skipUpdateIfNoValuesChanged: true,
      },
    );
    return authUser;
  }
}
