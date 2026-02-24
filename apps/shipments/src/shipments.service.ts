import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAddressDto } from './dto/create-address.dto';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { Address } from './entity/address.entity';
import { Shipment } from './entity/shipment.entity';
import { ShipmentEvent } from './entity/shipment-event.entity';
import { ShippingProvider } from './entity/shipping-provider.entity';

@Injectable()
export class ShipmentsService {
  private readonly logger = new Logger(ShipmentsService.name);

  constructor(
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
    @InjectRepository(ShippingProvider)
    private readonly shippingProviderRepository: Repository<ShippingProvider>,
    @InjectRepository(Shipment)
    private readonly shipmentRepository: Repository<Shipment>,
    @InjectRepository(ShipmentEvent)
    private readonly shipmentEventRepository: Repository<ShipmentEvent>,
  ) {}

  // Address CRUD
  async createAddress(dto: CreateAddressDto) {
    const address = this.addressRepository.create(dto);
    return this.addressRepository.save(address);
  }

  async getAllAddresses() {
    return this.addressRepository.find({ order: { created_at: 'DESC' } });
  }

  async getAddressById(id: string) {
    const address = await this.addressRepository.findOne({ where: { id } });
    if (!address) {
      throw new NotFoundException(`Address with id ${id} not found`);
    }
    return address;
  }

  async updateAddress(data: { id: string; dto: UpdateAddressDto }) {
    const address = await this.getAddressById(data.id);
    Object.assign(address, data.dto);
    return this.addressRepository.save(address);
  }

  async deleteAddress(id: string) {
    const address = await this.getAddressById(id);
    await this.addressRepository.remove(address);
    return { deleted: true };
  }

  // Shipping Provider
  async getAllShippingProviders() {
    return this.shippingProviderRepository.find({ where: { enabled: true } });
  }

  async getShippingProviderById(id: string) {
    const provider = await this.shippingProviderRepository.findOne({
      where: { id },
    });
    if (!provider) {
      throw new NotFoundException(`Shipping provider with id ${id} not found`);
    }
    return provider;
  }

  // Shipment
  async createShipment(dto: CreateShipmentDto) {
    const provider = await this.shippingProviderRepository.findOne({
      where: { code: dto.carrier, enabled: true },
    });
    if (!provider) {
      throw new BadRequestException(
        `Carrier '${dto.carrier}' not found or not enabled`,
      );
    }

    const shipment = this.shipmentRepository.create(dto);
    return this.shipmentRepository.save(shipment);
  }

  async getShipmentById(id: string) {
    const shipment = await this.shipmentRepository.findOne({
      where: { id },
      relations: ['events'],
    });
    if (!shipment) {
      throw new NotFoundException(`Shipment with id ${id} not found`);
    }
    return shipment;
  }

  async getShipmentsByOrder(orderId: string) {
    return this.shipmentRepository.find({
      where: { order_id: orderId },
      relations: ['events'],
      order: { created_at: 'DESC' },
    });
  }
}
