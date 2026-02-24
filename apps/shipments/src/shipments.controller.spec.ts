import { Test, TestingModule } from '@nestjs/testing';
import { ShipmentsController } from './shipments.controller';
import { ShipmentsService } from './shipments.service';

const mockShipmentsService = {
  createAddress: jest.fn(),
  getAllAddresses: jest.fn(),
  getAddressById: jest.fn(),
  updateAddress: jest.fn(),
  deleteAddress: jest.fn(),
  getAllShippingProviders: jest.fn(),
  getShippingProviderById: jest.fn(),
  createShipment: jest.fn(),
  getShipmentById: jest.fn(),
  getShipmentsByOrder: jest.fn(),
};

describe('ShipmentsController', () => {
  let shipmentsController: ShipmentsController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ShipmentsController],
      providers: [
        { provide: ShipmentsService, useValue: mockShipmentsService },
      ],
    }).compile();

    shipmentsController = app.get<ShipmentsController>(ShipmentsController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(shipmentsController).toBeDefined();
  });

  describe('createAddress', () => {
    it('should create and return an address', async () => {
      const dto = { street: '123 Main St', city: 'Hanoi', country: 'VN' };
      const created = { id: 'addr-1', ...dto };
      mockShipmentsService.createAddress.mockResolvedValue(created);

      const result = await shipmentsController.createAddress(dto as any);

      expect(mockShipmentsService.createAddress).toHaveBeenCalledWith(dto);
      expect(result).toEqual(created);
    });
  });

  describe('getAllAddresses', () => {
    it('should return all addresses', async () => {
      const addresses = [{ id: 'addr-1' }, { id: 'addr-2' }];
      mockShipmentsService.getAllAddresses.mockResolvedValue(addresses);

      const result = await shipmentsController.getAllAddresses();

      expect(mockShipmentsService.getAllAddresses).toHaveBeenCalled();
      expect(result).toEqual(addresses);
    });
  });

  describe('getAddressById', () => {
    it('should return an address by id', async () => {
      const address = { id: 'addr-1', street: '123 Main St' };
      mockShipmentsService.getAddressById.mockResolvedValue(address);

      const result = await shipmentsController.getAddressById('addr-1');

      expect(mockShipmentsService.getAddressById).toHaveBeenCalledWith(
        'addr-1',
      );
      expect(result).toEqual(address);
    });
  });

  describe('createShipment', () => {
    it('should create and return a shipment', async () => {
      const dto = { orderId: 'order-1', addressId: 'addr-1' };
      const shipment = { id: 'ship-1', ...dto };
      mockShipmentsService.createShipment.mockResolvedValue(shipment);

      const result = await shipmentsController.createShipment(dto as any);

      expect(mockShipmentsService.createShipment).toHaveBeenCalledWith(dto);
      expect(result).toEqual(shipment);
    });
  });

  describe('getShipmentsByOrder', () => {
    it('should return shipments for an order', async () => {
      const shipments = [{ id: 'ship-1', orderId: 'order-1' }];
      mockShipmentsService.getShipmentsByOrder.mockResolvedValue(shipments);

      const result = await shipmentsController.getShipmentsByOrder('order-1');

      expect(mockShipmentsService.getShipmentsByOrder).toHaveBeenCalledWith(
        'order-1',
      );
      expect(result).toEqual(shipments);
    });
  });
});
