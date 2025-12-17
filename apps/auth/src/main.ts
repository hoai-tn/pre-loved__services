import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AllRpcExceptionFilter } from 'apps/inventory/src/filters/rpc-exception.filter';
import { PORT_TCP } from 'libs/constant/port-tcp.constant';
import { AuthModule } from './auth.module';

async function bootstrap() {
  const logger = new Logger('AuthService');
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AuthModule,
    {
      transport: Transport.TCP,
      options: {
        host: 'localhost',
        port: PORT_TCP.AUTH_TCP_PORT,
      },
    },
  );
  // Enable global RPC exception filter
  app.useGlobalFilters(new AllRpcExceptionFilter());
  await app.listen();
  logger.log(`Auth Service is listening on port ${PORT_TCP.AUTH_TCP_PORT}`);
}
bootstrap();
