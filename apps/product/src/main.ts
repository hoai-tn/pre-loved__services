import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { PORT_TCP } from 'libs/constant/port-tcp.constant';
import { AllRpcExceptionFilter } from './filters/rpc-exception.filter';
import { ProductModule } from './product.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    ProductModule,
    {
      transport: Transport.TCP,
      options: {
        host: 'localhost',
        port: PORT_TCP.PRODUCT_TCP_PORT,
      },
    },
  );

  // Enable global RPC exception filter
  app.useGlobalFilters(new AllRpcExceptionFilter());

  await app.listen();
  console.log(
    `Product microservice is listening on port ${PORT_TCP.PRODUCT_TCP_PORT}`,
  );
}
bootstrap();
