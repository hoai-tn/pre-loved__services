import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { TokenKeyService } from './token-key.service';

@Module({
  providers: [TokenKeyService, JwtService],
  exports: [TokenKeyService],
})
export class TokenKeyModule {}
