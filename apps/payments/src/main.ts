import { NestFactory } from '@nestjs/core';
import { RmqService } from '@app/common';
import { PaymentsModule } from './payments.module';
import { ValidationPipe } from '@nestjs/common';
import { EXCHANGE } from '@app/common/constants/exchange';
import { AllRpcExceptionFilter } from './filters/rpc-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(PaymentsModule);

  // Enable global RPC exception filter for microservices
  app.useGlobalFilters(new AllRpcExceptionFilter());

  // Enable validation
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false, // Allow extra properties for microservice flexibility
    }),
  );

  // // const rmqService = app.get<RmqService>(RmqService);

  // // // Kết nối microservice, lắng nghe trên queue 'PAYMENTS_SERVICE_QUEUE'
  // // app.connectMicroservice(rmqService.getOptions('PAYMENTS_SERVICE_QUEUE'));
  // const rmqService = app.get<RmqService>(RmqService);
  //   app.connectMicroservice(rmqService.getOptionsTopic('PAYMENTS_SERVICE', false, {
  //     name: EXCHANGE.ORDERS_EXCHANGE,
  //     type: 'fanout',
  //   }));
  await app.startAllMicroservices();
  console.log('💳 Payments microservice is running and listening for events.');
}
bootstrap();
