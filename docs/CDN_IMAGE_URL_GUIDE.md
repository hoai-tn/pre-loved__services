# Product Image CDN URL Guide

## Overview

The product service automatically transforms relative image paths into full CDN URLs using the Cellphones CDN infrastructure.

## CDN Configuration

**Base URL:**

```
https://cdn2.cellphones.com.vn/insecure/rs:fill:300:300/q:90/plain/https://cellphones.com.vn/media/catalog/product
```

## How It Works

### Automatic URL Transformation

When you create or retrieve products, the `imageUrl` field is automatically transformed:

**Input (stored in database):**

```json
{
  "imageUrl": "/i/iphone-14-pro.jpg"
}
```

**Output (returned by API):**

```json
{
  "imageUrl": "https://cdn2.cellphones.com.vn/insecure/rs:fill:300:300/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/iphone-14-pro.jpg"
}
```

### Creating Products with Images

When creating a product, you can provide:

1. **Relative path** (recommended for Cellphones CDN):

```json
{
  "name": "iPhone 14 Pro",
  "imageUrl": "/i/iphone-14-pro.jpg"
}
```

2. **Full external URL** (will be returned as-is):

```json
{
  "name": "iPhone 14 Pro",
  "imageUrl": "https://example.com/images/phone.jpg"
}
```

## API Endpoints Using CDN URLs

All product endpoints return transformed URLs:

- `POST /products` - Create product
- `GET /products` - List products (with pagination)
- `GET /products/:id` - Get product by ID
- `GET /products/sku/:sku` - Get product by SKU
- `PUT /products/:id` - Update product

## Example API Response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "iPhone 14 Pro 256GB",
    "price": 25990000,
    "imageUrl": "https://cdn2.cellphones.com.vn/insecure/rs:fill:300:300/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/iphone-14-pro-256gb.jpg",
    "sku": "IP14P-256-BLK",
    "brand": {
      "id": 1,
      "name": "Apple"
    },
    "category": {
      "id": 1,
      "name": "Smartphones"
    }
  }
}
```

## Image Path Conventions

### Recommended Path Structure

```
/[category-initial]/[product-slug].jpg

Examples:
/i/iphone-14-pro.jpg        (iPhones)
/s/samsung-s23-ultra.jpg    (Samsung)
/a/airpods-pro-2.jpg        (Accessories)
```

## Configuration

The CDN configuration is centralized in:

```
libs/constant/cdn.constant.ts
```

To modify the CDN URL or add new image transformations, update the `CDN_CONFIG` object:

```typescript
export const CDN_CONFIG = {
  PRODUCT_IMAGE_BASE_URL: 'https://cdn2.cellphones.com.vn/...',

  getProductImageUrl: (imagePath?: string): string | undefined => {
    // Transformation logic
  },
};
```

## Notes

- URLs starting with `http://` or `https://` are not transformed
- Empty or undefined `imageUrl` fields remain unchanged
- The transformation happens automatically in the service layer
- All image transformations are applied before returning data to clients
