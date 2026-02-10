import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  CreateAddressDto,
  CreateShipmentDto,
  UpdateAddressDto,
} from './dto/shipment.dto';
import { ShipmentService } from './shipment.service';

@ApiTags('Shipment')
@Controller()
export class ShipmentController {
  constructor(private readonly shipmentService: ShipmentService) {}

  // ============================================================================
  // ADDRESS ENDPOINTS
  // ============================================================================

  @Get('addresses')
  @ApiOperation({ summary: 'Get all addresses' })
  @ApiResponse({ status: 200, description: 'List of addresses.' })
  async getAllAddresses() {
    return this.shipmentService.getAllAddresses();
  }

  @Get('addresses/:id')
  @ApiOperation({ summary: 'Get address by id' })
  @ApiParam({ name: 'id', description: 'Address ID', type: String })
  @ApiResponse({ status: 200, description: 'Address details.' })
  @ApiResponse({ status: 404, description: 'Address not found.' })
  async getAddressById(@Param('id') id: string) {
    return this.shipmentService.getAddressById(id);
  }

  @Post('addresses')
  @ApiOperation({ summary: 'Create a new address' })
  @ApiBody({ type: CreateAddressDto })
  @ApiResponse({ status: 201, description: 'Address created successfully.' })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input data.',
  })
  async createAddress(@Body(ValidationPipe) dto: CreateAddressDto) {
    return this.shipmentService.createAddress(dto);
  }

  @Put('addresses/:id')
  @ApiOperation({ summary: 'Update an address' })
  @ApiParam({ name: 'id', description: 'Address ID', type: String })
  @ApiBody({ type: UpdateAddressDto })
  @ApiResponse({ status: 200, description: 'Address updated successfully.' })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input data.',
  })
  @ApiResponse({ status: 404, description: 'Address not found.' })
  async updateAddress(
    @Param('id') id: string,
    @Body(ValidationPipe) dto: UpdateAddressDto,
  ) {
    return this.shipmentService.updateAddress(id, dto);
  }

  @Delete('addresses/:id')
  @ApiOperation({ summary: 'Delete an address' })
  @ApiParam({ name: 'id', description: 'Address ID', type: String })
  @ApiResponse({ status: 200, description: 'Address deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Address not found.' })
  async deleteAddress(@Param('id') id: string) {
    return this.shipmentService.deleteAddress(id);
  }

  // ============================================================================
  // SHIPPING PROVIDER ENDPOINTS
  // ============================================================================

  @Get('shipping-providers')
  @ApiOperation({ summary: 'Get all shipping providers' })
  @ApiResponse({ status: 200, description: 'List of shipping providers.' })
  async getAllShippingProviders() {
    return this.shipmentService.getAllShippingProviders();
  }

  // ============================================================================
  // SHIPMENT ENDPOINTS
  // ============================================================================

  @Post('shipments')
  @ApiOperation({ summary: 'Create a new shipment' })
  @ApiBody({ type: CreateShipmentDto })
  @ApiResponse({ status: 201, description: 'Shipment created successfully.' })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input data.',
  })
  async createShipment(@Body(ValidationPipe) dto: CreateShipmentDto) {
    return this.shipmentService.createShipment(dto);
  }

  @Get('shipments/:id')
  @ApiOperation({ summary: 'Get shipment by id' })
  @ApiParam({ name: 'id', description: 'Shipment ID', type: String })
  @ApiResponse({ status: 200, description: 'Shipment details.' })
  @ApiResponse({ status: 404, description: 'Shipment not found.' })
  async getShipmentById(@Param('id') id: string) {
    return this.shipmentService.getShipmentById(id);
  }

  @Get('shipments/order/:orderId')
  @ApiOperation({ summary: 'Get shipments by order id' })
  @ApiParam({ name: 'orderId', description: 'Order ID', type: String })
  @ApiResponse({ status: 200, description: 'List of shipments for order.' })
  @ApiResponse({ status: 404, description: 'Order not found.' })
  async getShipmentsByOrder(@Param('orderId') orderId: string) {
    return this.shipmentService.getShipmentsByOrder(orderId);
  }
}
