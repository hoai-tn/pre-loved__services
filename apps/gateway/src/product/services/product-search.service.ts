import {
  IProduct,
  ISearchProductsResponse,
} from '@app/common/interfaces/product.interface';
import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { GetProductsQueryDto } from '../dto/product-simple.dto';

const INDEX_NAME = 'products';
@Injectable()
export class ProductSearchService {
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async searchProducts(
    query: GetProductsQueryDto,
  ): Promise<ISearchProductsResponse> {
    if (!query) {
      return { total: 0, items: [], page: 1, limit: 10, totalPages: 1 };
    }

    const body = await this.elasticsearchService.search({
      index: INDEX_NAME,
      query: {
        match: {
          name: query.search,
          categoryId: query.categoryId,
          brandId: query.brandId,
          minPrice: query.minPrice,
          maxPrice: query.maxPrice,
          isActive: query.isActive,
          isFeatured: query.isFeatured,
          isTrending: query.isTrending,
          condition: query.condition,
        },
      },
      sort: [{ createdAt: query.sortOrder === 'ASC' ? 'asc' : 'desc' }],
      from: (query.page ?? 1 - 1) * (query.limit ?? 10),
      size: query.limit ?? 10,
    });

    const total =
      typeof body.hits.total === 'object'
        ? (body.hits.total as { value: number; relation: string }).value
        : body.hits.total;

    return {
      total: total ?? 0,
      items: body.hits.hits.map(hit => hit._source) as IProduct[],
      page: query.page ?? 1,
      limit: query.limit ?? 10,
      totalPages: Math.ceil((total ?? 0) / (query.limit ?? 10)),
    } as ISearchProductsResponse;
  }
}
