import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { User } from '../common/decorators/user.decorator';
import { AuthGuard } from '../common/guards/auth.guard';
import { LoginUserDto, RegisterUserDto } from './dto/user.dto';
import { UserService } from './user.service';

const COOKIE_MAX_AGE = 30 * 24 * 60 * 60 * 1000; // 30 days
const COOKIE_SAME_SITE =
  process.env.NODE_ENV === 'production' ? 'none' : 'none';
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

    console.log({ refreshToken: authToken.refreshToken });

    response.cookie('refresh_token', authToken.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: COOKIE_MAX_AGE,
      path: '/',
    });
    return { user, accessToken: authToken.accessToken };
  }

  @Post('/logout')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'Logout successful.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = req.cookies['refresh_token'] as string | null;
    if (!refreshToken) {
      throw new UnauthorizedException('Unauthorized');
    }
    response.clearCookie('refresh_token');
    return await this.userService.userLogout(refreshToken);
  }

  @Get('all')
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'List all users.' })
  async getAllUsers() {
    return await this.userService.getAllUsers();
  }

  @Get('profile')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getProfile(@User() user: { tid: string; sub: string }) {
    const userId = parseInt(user.tid, 10);
    return await this.userService.getUserInfo(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user info by id' })
  @ApiResponse({ status: 200, description: 'User info.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async getUserInfo(@Param('id') id: number) {
    return await this.userService.getUserInfo(id);
  }

  @Post('refresh-token')
  @ApiOperation({ summary: 'Refresh token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = req.cookies['refresh_token'] as string;

    const { accessToken, refreshToken: newRefreshToken } =
      await this.userService.refreshToken(refreshToken);
    response.cookie('refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: COOKIE_MAX_AGE,
      path: '/',
    });
    return { accessToken };
  }
}
