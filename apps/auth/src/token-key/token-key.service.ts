import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RpcException } from '@nestjs/microservices';
import { TokenPayloadDto } from '../dto';
import { AuthUserCreateDto } from '../dto/auth-user-create.dto';
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class TokenKeyService {
  private readonly logger = new Logger(TokenKeyService.name);
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async generateTokenKey(payload: AuthUserCreateDto): Promise<AuthTokens> {
    this.logger.debug(
      `[TokenKeyService] Generating token key for user: ${JSON.stringify(payload)}`,
    );
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_SECRET'),
      algorithm: 'HS256',
      expiresIn: '15m',
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_SECRET'),
      algorithm: 'HS256',
      expiresIn: '7d',
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  private async validateToken(token: string): Promise<TokenPayloadDto> {
    try {
      const payload = await this.jwtService.verifyAsync<TokenPayloadDto>(
        token,
        {
          secret: this.configService.get('JWT_SECRET'),
          algorithms: ['HS256'],
        },
      );

      if (!payload) {
        throw new RpcException({
          message: 'Invalid refresh token',
          statusCode: HttpStatus.UNAUTHORIZED,
        });
      }
      return payload;
    } catch (error) {
      this.logger.error('Error validating token', error);
      throw error;
    }
  }

  async validateRefreshToken(refreshToken: string) {
    try {
      const payload = await this.validateToken(refreshToken);
      this.logger.log(`Validating refresh token for user: ${payload.tid}`);

      // const userAuth = await this.prismaService.userAuth.findUnique({
      //   where: {
      //     id: payload.tid,
      //   },
      // });

      // if (!userAuth) {
      //   throw new RpcException({
      //     message: 'User not found',
      //     statusCode: HttpStatus.NOT_FOUND,
      //   });
      // }

      // // Validate that the provided refresh token matches the stored one
      // if (!userAuth.refreshToken || userAuth.refreshToken !== refreshToken) {
      //   throw new RpcException({
      //     message: 'Invalid refresh token',
      //     statusCode: HttpStatus.UNAUTHORIZED,
      //   });
      // }

      // // Check if user is still active
      // if (!userAuth.isActive) {
      //   throw new RpcException({
      //     message: 'User account is inactive',
      //     statusCode: HttpStatus.FORBIDDEN,
      //   });
      // }

      // // Use refresh token rotation for enhanced security
      // const tokens = await this.generateTokenKey(userAuth.id, userAuth.userId);
      // return tokens;
    } catch (error) {
      this.logger.error('Error validating refresh token', error);
      throw error;
    }
  }

  async revokeToken(refreshToken: string) {
    try {
      const payload = await this.validateToken(refreshToken);

      // await this.prismaService.userAuth.update({
      //   where: { id: payload.tid },
      //   data: { refreshToken: null },
      // });

      this.logger.log(`Refresh token revoked for user: ${payload.tid}`);

      return {
        success: true,
        message: 'Token revoked successfully',
      };
    } catch (error) {
      this.logger.error('Error revoking token', error);
      throw new RpcException({
        message: 'Failed to revoke token',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }
  }

  /**
   * Validates access token and returns payload (for API Gateway use)
   */
  async validateAccessToken(accessToken: string): Promise<TokenPayloadDto> {
    try {
      const payload = await this.validateToken(accessToken);

      // Verify user is still active
      // const userAuth = await this.prismaService.userAuth.findUnique({
      //   where: { id: payload.tid },
      //   select: { isActive: true },
      // });

      // if (!userAuth?.isActive) {
      //   throw new RpcException({
      //     message: 'User account is inactive',
      //     statusCode: HttpStatus.FORBIDDEN,
      //   });
      // }

      return payload;
    } catch (error) {
      this.logger.error('Error validating access token', error);
      throw error;
    }
  }
}
