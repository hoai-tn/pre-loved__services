import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Res,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { LoginUserDto, RegisterUserDto } from './dto/user.dto';
import { UserService } from './user.service';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register new user' })
  @ApiBody({ type: RegisterUserDto })
  @ApiResponse({ status: 201, description: 'User registered successfully.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async register(@Body(ValidationPipe) dto: RegisterUserDto) {
    return await this.userService.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiBody({ type: LoginUserDto })
  @ApiResponse({ status: 200, description: 'Login successful.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async login(
    @Body(ValidationPipe) dto: LoginUserDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { user, authToken } = await this.userService.login(dto);
    response.cookie('refresh_token', authToken.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 15 * 60 * 1000, // 15 minutes
      sameSite: 'strict',
    });
    return { user, accessToken: authToken.accessToken };
  }
  @Get('all')
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'List all users.' })
  async getAllUsers() {
    return await this.userService.getAllUsers();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user info by id' })
  @ApiResponse({ status: 200, description: 'User info.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async getUserInfo(@Param('id') id: number) {
    return await this.userService.getUserInfo(id);
  }
}
