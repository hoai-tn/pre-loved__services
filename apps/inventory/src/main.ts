import { RmqService } from '@app/common';
import { EXCHANGE } from '@app/common/constants/exchange';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { PORT_TCP } from 'libs/constant/port-tcp.constant';
import { AllRpcExceptionFilter } from './filters/rpc-exception.filter';
import { InventoryModule } from './inventory.module';

async function bootstrap() {
  const app = await NestFactory.create(InventoryModule);

  // Get RMQ service for message queue communication
  const rmqService = app.get<RmqService>(RmqService);

  // Connect to queue for RPC communication
  app.connectMicroservice(rmqService.getOptions('INVENTORY_SERVICE_QUEUE'));

  // Connect to fanout exchange for order created events
  app.connectMicroservice(
    rmqService.getOptionsTopic(EXCHANGE.ORDERS_EXCHANGE, false, {
      name: EXCHANGE.ORDERS_EXCHANGE,
      type: 'fanout',
    }),
  );

  // Add TCP microservice for direct communication
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: 'localhost',
      port: PORT_TCP.INVENTORY_TCP_PORT,
    },
  });

  // Enable global RPC exception filter for microservices
  app.useGlobalFilters(new AllRpcExceptionFilter());

  // Start all microservices (RMQ + TCP)
  await app.startAllMicroservices();

  // Start HTTP server
  const httpPort = PORT_TCP.INVENTORY_TCP_PORT;
  await app.listen(httpPort);

  console.log('✅ Inventory service is running:');
  console.log(`   📡 HTTP API Server: http://localhost:${httpPort}`);
  console.log(
    `   🔌 TCP Microservice: localhost:${PORT_TCP.INVENTORY_TCP_PORT}`,
  );
  console.log('   📨 RabbitMQ Consumer: INVENTORY_SERVICE_QUEUE');
}
bootstrap();
