import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import * as dotenv from 'dotenv';
import { PORT_TCP } from 'libs/constant/port-tcp.constant';
import { AllRpcExceptionFilter } from './filters/rpc-exception.filter';
import { ShipmentsModule } from './shipments.module';

async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    ShipmentsModule,
    {
      transport: Transport.TCP,
      options: {
        host: 'localhost',
        port: PORT_TCP.SHIPMENTS_TCP_PORT,
      },
    },
  );

  app.useGlobalFilters(new AllRpcExceptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
    }),
  );

  await app.listen();
  console.log(
    `Shipments microservice is listening on port ${PORT_TCP.SHIPMENTS_TCP_PORT}`,
  );
}
bootstrap();
