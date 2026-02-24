export interface AddressDto {
  id: string;
  province: string;
  district: string;
  ward?: string;
  street?: string;
  detail?: string;
  phone: string;
  full_text?: string;
  created_at: Date;
}

export interface ShippingProviderDto {
  id: string;
  code: string;
  name: string;
  enabled: boolean;
  supports_cod: boolean;
  supports_tracking: boolean;
  created_at: Date;
}

export interface ShipmentEventDto {
  id: string;
  shipment_id: string;
  carrier_status?: string;
  internal_status?: string;
  raw_payload?: any;
  created_at: Date;
}

export interface ShipmentDto {
  id: string;
  order_id: string;
  carrier: string;
  carrier_order_code?: string;
  tracking_code?: string;
  status: string;
  shipping_fee?: number;
  cod_amount?: number;
  created_at: Date;
  updated_at: Date;
  events?: ShipmentEventDto[];
}
