import { PostgresModule, RmqModule } from '@app/common';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RewardsController } from './rewards.controller';
import { RewardsService } from './rewards.service';

@Module({
  imports: [
    PostgresModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './local/nodeB/.env',
    }),
    RmqModule,
  ],
  controllers: [RewardsController],
  providers: [RewardsService],
})
export class RewardsModule {}
