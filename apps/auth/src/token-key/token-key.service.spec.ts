import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';

import { TokenKeyService } from './token-key.service';

describe('TokenKeyService', () => {
  let service: TokenKeyService;
  let jwtService: JwtService;
  let configService: ConfigService;

  const mockJwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
    decode: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenKeyService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<TokenKeyService>(TokenKeyService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
  });

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Setup default mock returns
    mockConfigService.get.mockImplementation((key: string) => {
      const config: Record<string, string> = {
        JWT_SECRET: 'test-secret',
        JWT_REFRESH_SECRET: 'test-refresh-secret',
      };
      return config[key] || `test-${key.toLowerCase()}`;
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have jwt service injected', () => {
    expect(jwtService).toBeDefined();
  });

  it('should have config service injected', () => {
    expect(configService).toBeDefined();
  });

  describe('generateTokenKey', () => {
    it('should generate access and refresh tokens', async () => {
      // Arrange
      const userId = 'user-123';
      const userAuthId = 'auth-456';

      mockJwtService.signAsync
        .mockResolvedValueOnce('mock-access-token')
        .mockResolvedValueOnce('mock-refresh-token');

      // Act
      const result = await service.generateTokenKey(userId, userAuthId);

      // Assert
      expect(result).toEqual({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      });

      expect(mockJwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(mockConfigService.get).toHaveBeenCalledWith('JWT_SECRET');
      expect(mockConfigService.get).toHaveBeenCalledTimes(2);
    });
  });
});
