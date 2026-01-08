import { PostgresModule, RmqModule } from '@app/common';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

@Module({
  imports: [
    PostgresModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './local/nodeB/.env',
    }),
    RmqModule.register({ name: 'PAYMENTS_SERVICE' }),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}
