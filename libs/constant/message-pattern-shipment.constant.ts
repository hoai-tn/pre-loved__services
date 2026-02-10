export const SHIPMENT_MESSAGE_PATTERN = {
  // Address
  CREATE_ADDRESS: 'address.create',
  GET_ADDRESS_BY_ID: 'address.findById',
  GET_ALL_ADDRESSES: 'address.findAll',
  UPDATE_ADDRESS: 'address.update',
  DELETE_ADDRESS: 'address.delete',
  // Shipping Provider
  GET_ALL_SHIPPING_PROVIDERS: 'shipping_provider.findAll',
  GET_SHIPPING_PROVIDER_BY_ID: 'shipping_provider.findById',
  // Shipment
  CREATE_SHIPMENT: 'shipment.create',
  GET_SHIPMENT_BY_ID: 'shipment.findById',
  GET_SHIPMENTS_BY_ORDER: 'shipment.findByOrder',
};
