import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SHIPMENT_MESSAGE_PATTERN } from 'libs/constant/message-pattern-shipment.constant';
import { CreateAddressDto } from './dto/create-address.dto';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { ShipmentsService } from './shipments.service';

@Controller()
export class ShipmentsController {
  private readonly logger = new Logger(ShipmentsController.name);

  constructor(private readonly shipmentsService: ShipmentsService) {}

  // Address
  @MessagePattern(SHIPMENT_MESSAGE_PATTERN.CREATE_ADDRESS)
  async createAddress(@Payload() dto: CreateAddressDto) {
    return this.shipmentsService.createAddress(dto);
  }

  @MessagePattern(SHIPMENT_MESSAGE_PATTERN.GET_ALL_ADDRESSES)
  async getAllAddresses() {
    return this.shipmentsService.getAllAddresses();
  }

  @MessagePattern(SHIPMENT_MESSAGE_PATTERN.GET_ADDRESS_BY_ID)
  async getAddressById(@Payload() id: string) {
    return this.shipmentsService.getAddressById(id);
  }

  @MessagePattern(SHIPMENT_MESSAGE_PATTERN.UPDATE_ADDRESS)
  async updateAddress(@Payload() data: { id: string; dto: UpdateAddressDto }) {
    return this.shipmentsService.updateAddress(data);
  }

  @MessagePattern(SHIPMENT_MESSAGE_PATTERN.DELETE_ADDRESS)
  async deleteAddress(@Payload() id: string) {
    return this.shipmentsService.deleteAddress(id);
  }

  // Shipping Provider
  @MessagePattern(SHIPMENT_MESSAGE_PATTERN.GET_ALL_SHIPPING_PROVIDERS)
  async getAllShippingProviders() {
    return this.shipmentsService.getAllShippingProviders();
  }

  @MessagePattern(SHIPMENT_MESSAGE_PATTERN.GET_SHIPPING_PROVIDER_BY_ID)
  async getShippingProviderById(@Payload() id: string) {
    return this.shipmentsService.getShippingProviderById(id);
  }

  // Shipment
  @MessagePattern(SHIPMENT_MESSAGE_PATTERN.CREATE_SHIPMENT)
  async createShipment(@Payload() dto: CreateShipmentDto) {
    return this.shipmentsService.createShipment(dto);
  }

  @MessagePattern(SHIPMENT_MESSAGE_PATTERN.GET_SHIPMENT_BY_ID)
  async getShipmentById(@Payload() id: string) {
    return this.shipmentsService.getShipmentById(id);
  }

  @MessagePattern(SHIPMENT_MESSAGE_PATTERN.GET_SHIPMENTS_BY_ORDER)
  async getShipmentsByOrder(@Payload() orderId: string) {
    return this.shipmentsService.getShipmentsByOrder(orderId);
  }
}
