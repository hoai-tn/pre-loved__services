import { CategoryResponseDto } from '@app/common/dto';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PRODUCT_MESSAGE_PATTERNS } from 'libs/constant/message-pattern-product.constant';
import { NAME_SERVICE_TCP } from 'libs/constant/port-tcp.constant';
import { catchError, firstValueFrom, throwError, timeout } from 'rxjs';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  private readonly logger = new Logger(CategoryService.name);

  constructor(
    @Inject(NAME_SERVICE_TCP.PRODUCT_SERVICE)
    private readonly productClient: ClientProxy,
  ) {}

  async getAllCategories(): Promise<CategoryResponseDto[]> {
    this.logger.log('Fetching all categories from product service');
    return await firstValueFrom(
      this.productClient
        .send<
          CategoryResponseDto[],
          Record<string, never>
        >(PRODUCT_MESSAGE_PATTERNS.CATEGORY_FIND_ALL, {})
        .pipe(
          timeout(5000),
          catchError(err =>
            throwError(() => {
              if (err instanceof Error) {
                this.logger.error('Error fetching all categories:', err);
              }
              throw err;
            }),
          ),
        ),
    );
  }

  async createCategory(dto: CreateCategoryDto): Promise<CategoryResponseDto> {
    this.logger.log(`Creating category: ${dto.name}`);
    return await firstValueFrom(
      this.productClient
        .send<
          CategoryResponseDto,
          CreateCategoryDto
        >(PRODUCT_MESSAGE_PATTERNS.CATEGORY_CREATE, dto)
        .pipe(
          timeout(5000),
          catchError(err =>
            throwError(() => {
              if (err instanceof Error) {
                this.logger.error('Error creating category:', err);
              }
              throw err;
            }),
          ),
        ),
    );
  }

  async getCategoryById(id: number): Promise<CategoryResponseDto> {
    this.logger.log(`Fetching category with ID: ${id}`);
    return await firstValueFrom(
      this.productClient
        .send<
          CategoryResponseDto,
          number
        >(PRODUCT_MESSAGE_PATTERNS.CATEGORY_FIND_BY_ID, id)
        .pipe(timeout(5000)),
    );
  }

  async updateCategory(
    id: number,
    dto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    this.logger.log(`Updating category with ID: ${id}`);
    return await firstValueFrom(
      this.productClient
        .send<
          CategoryResponseDto,
          { id: number } & UpdateCategoryDto
        >(PRODUCT_MESSAGE_PATTERNS.CATEGORY_UPDATE, { id, ...dto })
        .pipe(timeout(5000)),
    );
  }

  async deleteCategory(id: number): Promise<CategoryResponseDto> {
    this.logger.log(`Deleting category with ID: ${id}`);
    return await firstValueFrom(
      this.productClient
        .send<
          CategoryResponseDto,
          number
        >(PRODUCT_MESSAGE_PATTERNS.CATEGORY_DELETE, id)
        .pipe(timeout(5000)),
    );
  }
}
