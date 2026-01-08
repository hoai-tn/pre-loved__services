import { UserResponseDto } from '@app/common/dto';
import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
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
    //1. check if user exists
    const user = await this.userRepository.findOne({
      where: { username: dto.username },
    });
    if (!user) {
      this.logger.warn('User not found', dto.username);
      throw new NotFoundException('Invalid credentials');
    }
    //2. check if password is correct
    const isPasswordCorrect = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordCorrect) {
      this.logger.warn('Invalid password for user', dto.username);
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async getInfo(userId: number): Promise<UserResponseDto | null> {
    this.logger.log(`Get info for userId: ${userId}`);
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      return null;
    }
    return user;
  }

  getServiceInfo(): string {
    this.logger.log('getServiceInfo called');
    return 'User Service is up and running';
  }
}
