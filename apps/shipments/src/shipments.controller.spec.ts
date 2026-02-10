import { Test, TestingModule } from '@nestjs/testing';
import { ShipmentsController } from './shipments.controller';
import { ShipmentsService } from './shipments.service';

describe('ShipmentsController', () => {
  let shipmentsController: ShipmentsController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ShipmentsController],
      providers: [ShipmentsService],
    }).compile();

    shipmentsController = app.get<ShipmentsController>(ShipmentsController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(shipmentsController.getHello()).toBe('Hello World!');
    });
  });
});
