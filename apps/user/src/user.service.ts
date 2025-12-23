import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { User } from './entity/user.entity';
@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getAllUsers(): Promise<User[]> {
    this.logger.log('Fetching all users');
    return await this.userRepository.find();
  }
  async register(dto: RegisterUserDto): Promise<User> {
    this.logger.debug(`Register user: ${dto.username}`);
    //1. check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new ConflictException(
        `User with email ${dto.email} already exists`,
      );
    }
    //2. generate password hash
    const passwordHash = await bcrypt.hash(dto.password, 10);
    //3. create user
    const user = this.userRepository.create({
      username: dto.username,
      email: dto.email,
      password: passwordHash,
    });
    return await this.userRepository.save(user);
  }

  async login(dto: LoginUserDto): Promise<User | null> {
    this.logger.debug(`Login user: ${dto.username}`);
    const user = await this.userRepository.findOne({
      where: { username: dto.username, password: dto.password },
    });
    return user || null;
  }

  async getInfo(userId: number): Promise<User | null> {
    this.logger.log(`Get info for userId: ${userId}`);
    return await this.userRepository.findOne({ where: { id: userId } });
  }

  getServiceInfo(): string {
    this.logger.log('getServiceInfo called');
    return 'User Service is up and running';
  }
}
