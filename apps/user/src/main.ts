import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import * as dotenv from 'dotenv';
import { PORT_TCP } from 'libs/constant/port-tcp.constant';
import { AllRpcExceptionFilter } from './filters/rpc-exception.filter';
import { UserModule } from './user.module';

async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    UserModule,
    {
      transport: Transport.TCP,
      options: {
        host: 'localhost',
        port: PORT_TCP.USER_TCP_PORT,
      },
    },
  );

  // Enable global RPC exception filter
  app.useGlobalFilters(new AllRpcExceptionFilter());

  // Enable validation (disabled temporarily to debug)
  // app.useGlobalPipes(new ValidationPipe({
  //   transform: true,
  //   whitelist: true,
  //   forbidNonWhitelisted: false, // Allow extra properties for microservice flexibility
  // }));

  await app.listen();
  console.log(
    `User microservice is listening on port ${PORT_TCP.USER_TCP_PORT}`,
  );
}
bootstrap();
