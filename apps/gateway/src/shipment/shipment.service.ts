import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { SHIPMENT_MESSAGE_PATTERN } from 'libs/constant/message-pattern-shipment.constant';
import { NAME_SERVICE_TCP } from 'libs/constant/port-tcp.constant';
import { catchError, firstValueFrom, throwError, timeout } from 'rxjs';
import { MicroserviceErrorHandler } from '../common/microservice-error.handler';

@Injectable()
export class ShipmentService {
  private readonly logger = new Logger(ShipmentService.name);

  constructor(
    @Inject(NAME_SERVICE_TCP.SHIPMENTS_SERVICE)
    private readonly shipmentsClient: ClientProxy,
  ) {}

  // Address
  async createAddress(dto: any) {
    try {
      return await firstValueFrom(
        this.shipmentsClient
          .send(SHIPMENT_MESSAGE_PATTERN.CREATE_ADDRESS, dto)
          .pipe(timeout(5000), catchError(err => throwError(() => err))),
      );
    } catch (error) {
      MicroserviceErrorHandler.handleError(error, 'create address', 'Shipments Service');
    }
  }

  async getAllAddresses() {
    try {
      return await firstValueFrom(
        this.shipmentsClient
          .send(SHIPMENT_MESSAGE_PATTERN.GET_ALL_ADDRESSES, {})
          .pipe(timeout(5000), catchError(err => throwError(() => err))),
      );
    } catch (error) {
      MicroserviceErrorHandler.handleError(error, 'get all addresses', 'Shipments Service');
    }
  }

  async getAddressById(id: string) {
    try {
      return await firstValueFrom(
        this.shipmentsClient
          .send(SHIPMENT_MESSAGE_PATTERN.GET_ADDRESS_BY_ID, id)
          .pipe(timeout(5000), catchError(err => throwError(() => err))),
      );
    } catch (error) {
      MicroserviceErrorHandler.handleError(error, 'get address by id', 'Shipments Service');
    }
  }

  async updateAddress(id: string, dto: any) {
    try {
      return await firstValueFrom(
        this.shipmentsClient
          .send(SHIPMENT_MESSAGE_PATTERN.UPDATE_ADDRESS, { id, dto })
          .pipe(timeout(5000), catchError(err => throwError(() => err))),
      );
    } catch (error) {
      MicroserviceErrorHandler.handleError(error, 'update address', 'Shipments Service');
    }
  }

  async deleteAddress(id: string) {
    try {
      return await firstValueFrom(
        this.shipmentsClient
          .send(SHIPMENT_MESSAGE_PATTERN.DELETE_ADDRESS, id)
          .pipe(timeout(5000), catchError(err => throwError(() => err))),
      );
    } catch (error) {
      MicroserviceErrorHandler.handleError(error, 'delete address', 'Shipments Service');
    }
  }

  // Shipping Provider
  async getAllShippingProviders() {
    try {
      return await firstValueFrom(
        this.shipmentsClient
          .send(SHIPMENT_MESSAGE_PATTERN.GET_ALL_SHIPPING_PROVIDERS, {})
          .pipe(timeout(5000), catchError(err => throwError(() => err))),
      );
    } catch (error) {
      MicroserviceErrorHandler.handleError(error, 'get shipping providers', 'Shipments Service');
    }
  }

  // Shipment
  async createShipment(dto: any) {
    try {
      return await firstValueFrom(
        this.shipmentsClient
          .send(SHIPMENT_MESSAGE_PATTERN.CREATE_SHIPMENT, dto)
          .pipe(timeout(5000), catchError(err => throwError(() => err))),
      );
    } catch (error) {
      MicroserviceErrorHandler.handleError(error, 'create shipment', 'Shipments Service');
    }
  }

  async getShipmentById(id: string) {
    try {
      return await firstValueFrom(
        this.shipmentsClient
          .send(SHIPMENT_MESSAGE_PATTERN.GET_SHIPMENT_BY_ID, id)
          .pipe(timeout(5000), catchError(err => throwError(() => err))),
      );
    } catch (error) {
      MicroserviceErrorHandler.handleError(error, 'get shipment by id', 'Shipments Service');
    }
  }

  async getShipmentsByOrder(orderId: string) {
    try {
      return await firstValueFrom(
        this.shipmentsClient
          .send(SHIPMENT_MESSAGE_PATTERN.GET_SHIPMENTS_BY_ORDER, orderId)
          .pipe(timeout(5000), catchError(err => throwError(() => err))),
      );
    } catch (error) {
      MicroserviceErrorHandler.handleError(error, 'get shipments by order', 'Shipments Service');
    }
  }
}
