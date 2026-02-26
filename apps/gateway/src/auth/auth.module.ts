import { Module, forwardRef } from '@nestjs/common';
import { GatewayModule } from '../gateway.module';
import { AuthOauthController } from './auth.controller';
import { AuthOauthService } from './auth.service';

@Module({
  imports: [forwardRef(() => GatewayModule)],
  controllers: [AuthOauthController],
  providers: [AuthOauthService],
})
export class AuthOauthModule {}
