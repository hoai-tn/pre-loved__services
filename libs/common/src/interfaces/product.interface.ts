export interface IBrand {
  id: number;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}
export interface ICategory {
  id: number;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProduct {
  id: string;
  name: string;
  description?: string;
  price: number;
  stockQuantity: number;
  sku: string;
  brandId?: number;
  categoryId: number;
  userId?: number;
  thumbnailUrl: string;
  catalogImagesUrl: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  brand?: IBrand;
  category?: ICategory;
}

export interface ISearchProductsResponse {
  total: number;
  items: IProduct[];
  page: number;
  limit: number;
  totalPages: number;
}
