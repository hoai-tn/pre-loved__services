export interface BrandResponseDto {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryResponseDto {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductResponseDto {
  id: number;
  name: string;
  description?: string;
  price: number;
  stockQuantity: number;
  sku: string;
  brandId?: number;
  categoryId: number;
  userId?: number; // ID of the product creator
  imageUrl?: string;
  isActive: boolean;

  // Social engagement metrics
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  viewCount: number;

  // Product status for timeline/feed
  isFeatured: boolean;
  isTrending: boolean;

  condition?: string; // 'new', 'used', 'refurbished'
  sellerNotes?: string; // Notes from the seller

  rating: number;
  ratingCount: number;

  createdAt: Date;
  updatedAt: Date;

  brand?: BrandResponseDto;
  category: CategoryResponseDto;
}

// Alias for backward compatibility
export type CreateProductResponseDto = ProductResponseDto;
export type ProductDto = ProductResponseDto;

export interface FindAllProductsResponseDto {
  items: ProductResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
