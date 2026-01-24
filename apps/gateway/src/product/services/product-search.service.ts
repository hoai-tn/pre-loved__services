import {
  IProduct,
  ISearchProductsResponse,
} from '@app/common/interfaces/product.interface';
import { SearchRequest } from '@elastic/elasticsearch/lib/api/types';
import { Injectable, Logger } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { IProductElasticsearch } from '../dto/product-elasticsearch.dto';
import { GetProductsQueryDto } from '../dto/product-simple.dto';

const INDEX_NAME = 'products';
@Injectable()
export class ProductSearchService {
  private readonly logger = new Logger(ProductSearchService.name);
  constructor(private readonly elasticsearchService: ElasticsearchService) { }

  async searchProducts(
    query: GetProductsQueryDto,
  ): Promise<ISearchProductsResponse> {
    if (!query) {
      return { total: 0, items: [], page: 1, limit: 10, totalPages: 1 };
    }
    this.logger.debug(
      `[ProductSearchService] Searching products with query:`,
      query,
    );
    const queryBuilder: SearchRequest = {
      index: INDEX_NAME,
      _source: true, // Explicitly request source fields
    };
    if (query.search) {
      queryBuilder.query = {
        multi_match: {
          query: query.search,
          fields: ['name^2', 'sku', 'brand_name', 'category_name'],
          type: 'best_fields',
          fuzziness: 'AUTO',
        },
      };
    } else {
      queryBuilder.query = { match_all: {} };
    }
    //category filter
    if (query.categoryId) {
      queryBuilder.post_filter = {
        term: { category_id: query.categoryId },
      };
    }
    if (query.sortBy) {
      queryBuilder.sort = [
        {
          [query.sortBy as keyof IProduct]:
            query.sortOrder === 'ASC' ? 'asc' : 'desc',
        },
      ];
    }

    // Set pagination - always set size and from
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    queryBuilder.from = (page - 1) * limit;
    queryBuilder.size = limit;

    this.logger.debug(
      `[ProductSearchService] Query builder:`,
      JSON.stringify(queryBuilder, null, 2),
    );

    const body = await this.elasticsearchService.search<IProductElasticsearch>(queryBuilder);

    const total =
      typeof body.hits.total === 'object'
        ? (body.hits.total as { value: number; relation: string }).value
        : body.hits.total;

    const items = body.hits.hits
      .map(hit => hit._source ? this.#mapToProduct(hit._source) : null)
      .filter(source => source != null);

    this.logger.debug(`[ProductSearchService] Mapped items:`, items.length);

    return {
      total: total ?? 0,
      items,
      page: query.page ?? 1,
      limit: query.limit ?? 10,
      totalPages: Math.ceil((total ?? 0) / (query.limit ?? 10)),
    };
  }

  #mapToProduct(esProduct: IProductElasticsearch): IProduct {
    return {
      id: esProduct.id,
      name: esProduct.name,
      description: esProduct.description,
      price: esProduct.price,
      stockQuantity: esProduct.stock_quantity,
      sku: esProduct.sku,
      brandId: esProduct.brand_id,
      categoryId: esProduct.category_id,
      userId: esProduct.user_id ? Number(esProduct.user_id) : undefined,
      imageUrl: esProduct.image_url,
      isActive: Boolean(esProduct.is_active),
      createdAt: new Date(esProduct.created_at),
      updatedAt: new Date(esProduct.updated_at),

    }
  }
}
