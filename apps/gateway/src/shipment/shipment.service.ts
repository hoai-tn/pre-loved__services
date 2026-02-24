import { AddressDto, ShipmentDto, ShippingProviderDto } from '@app/common/dto';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { SHIPMENT_MESSAGE_PATTERN } from 'libs/constant/message-pattern-shipment.constant';
import { NAME_SERVICE_TCP } from 'libs/constant/port-tcp.constant';
import { firstValueFrom, timeout } from 'rxjs';
import {
  CreateAddressDto,
  CreateShipmentDto,
  UpdateAddressDto,
} from './dto/shipment.dto';

@Injectable()
export class ShipmentService {
  private readonly logger = new Logger(ShipmentService.name);

  constructor(
    @Inject(NAME_SERVICE_TCP.SHIPMENTS_SERVICE)
    private readonly shipmentsClient: ClientProxy,
  ) {}

  // Address
  async createAddress(dto: CreateAddressDto) {
    return await firstValueFrom(
      this.shipmentsClient
        .send<
          AddressDto,
          CreateAddressDto
        >(SHIPMENT_MESSAGE_PATTERN.CREATE_ADDRESS, dto)
        .pipe(timeout(5000)),
    );
  }

  async getAllAddresses() {
    return await firstValueFrom(
      this.shipmentsClient
        .send<AddressDto[]>(SHIPMENT_MESSAGE_PATTERN.GET_ALL_ADDRESSES, {})
        .pipe(timeout(5000)),
    );
  }

  async getAddressById(id: string) {
    return await firstValueFrom(
      this.shipmentsClient
        .send<AddressDto>(SHIPMENT_MESSAGE_PATTERN.GET_ADDRESS_BY_ID, id)
        .pipe(timeout(5000)),
    );
  }

  async updateAddress(id: string, dto: UpdateAddressDto): Promise<AddressDto> {
    return await firstValueFrom(
      this.shipmentsClient
        .send<AddressDto>(SHIPMENT_MESSAGE_PATTERN.UPDATE_ADDRESS, {
          id,
          dto,
        })
        .pipe(timeout(5000)),
    );
  }

  async deleteAddress(id: string): Promise<{ deleted: boolean }> {
    return await firstValueFrom(
      this.shipmentsClient
        .send<{
          deleted: boolean;
        }>(SHIPMENT_MESSAGE_PATTERN.DELETE_ADDRESS, id)
        .pipe(timeout(5000)),
    );
  }

  // Shipping Provider
  async getAllShippingProviders(): Promise<ShippingProviderDto[]> {
    return await firstValueFrom(
      this.shipmentsClient
        .send<
          ShippingProviderDto[]
        >(SHIPMENT_MESSAGE_PATTERN.GET_ALL_SHIPPING_PROVIDERS, {})
        .pipe(timeout(5000)),
    );
  }

  // Shipment
  async createShipment(dto: CreateShipmentDto): Promise<ShipmentDto> {
    return await firstValueFrom(
      this.shipmentsClient
        .send<ShipmentDto>(SHIPMENT_MESSAGE_PATTERN.CREATE_SHIPMENT, dto)
        .pipe(timeout(5000)),
    );
  }

  async getShipmentById(id: string): Promise<ShipmentDto> {
    return await firstValueFrom(
      this.shipmentsClient
        .send<ShipmentDto>(SHIPMENT_MESSAGE_PATTERN.GET_SHIPMENT_BY_ID, id)
        .pipe(timeout(5000)),
    );
  }

  async getShipmentsByOrder(orderId: string): Promise<ShipmentDto[]> {
    return await firstValueFrom(
      this.shipmentsClient
        .send<
          ShipmentDto[]
        >(SHIPMENT_MESSAGE_PATTERN.GET_SHIPMENTS_BY_ORDER, orderId)
        .pipe(timeout(5000)),
    );
  }
}
