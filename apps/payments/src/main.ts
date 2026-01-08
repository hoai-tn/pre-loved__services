import { RmqService } from '@app/common';
import { EXCHANGE } from '@app/common/constants/exchange';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AllRpcExceptionFilter } from './filters/rpc-exception.filter';
import { PaymentsModule } from './payments.module';

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

  // Connect microservice, listen on queue 'PAYMENTS_SERVICE_QUEUE'
  const rmqService = app.get<RmqService>(RmqService);
  // app.connectMicroservice(rmqService.getOptions('PAYMENTS_SERVICE_QUEUE'));
  app.connectMicroservice(
    rmqService.getOptionsTopic('PAYMENTS_SERVICE_QUEUE', false, {
      name: EXCHANGE.ORDERS_EXCHANGE,
      type: 'fanout',
    }),
  );
  await app.startAllMicroservices();
  console.log('💳 Payments microservice is running and listening for events.');
}
bootstrap();
