interface IProductElasticsearch {
  id: string;
  stock_quantity: number;
  user_id: string | null;
  condition: string;
  likes_count: number;
  sku: string;
  comments_count: number;
  rating: number;
  price: number;
  is_active: number;
  is_trending: number;
  image_url: string;
  seller_notes: string | null;
  version: string;
  app: string;
  brand_id: number;
  shares_count: number;
  rating_count: number;
  updated_at: string;
  description: string;
  timestamp: string;
  name: string;
  is_featured: number;
  view_count: number;
  category_id: number;
  created_at: string;
}

export { IProductElasticsearch };
