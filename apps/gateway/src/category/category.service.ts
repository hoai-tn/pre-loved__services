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
  ) { }

  async getAllCategories() {
    this.logger.log('Fetching all categories from product service');
    try {
      const result = await firstValueFrom(
        this.productClient
          .send(PRODUCT_MESSAGE_PATTERNS.CATEGORY_FIND_ALL, {})
          .pipe(
            timeout(5000),
            catchError((error) => {
              this.logger.error('Failed to fetch categories', error);
              return throwError(() => error);
            }),
          ),
      );
      this.logger.log(`Successfully fetched ${result?.length || 0} categories`);
      return result;
    } catch (error) {
      this.logger.error('Error in getAllCategories:', error);
      throw error;
    }
  }

  async createCategory(dto: CreateCategoryDto) {
    this.logger.log(`Creating category: ${dto.name}`);
    try {
      const result = await firstValueFrom(
        this.productClient
          .send(PRODUCT_MESSAGE_PATTERNS.CATEGORY_CREATE, dto)
          .pipe(
            timeout(5000),
            catchError((error) => {
              this.logger.error('Failed to create category', error);
              return throwError(() => error);
            }),
          ),
      );
      this.logger.log(`Successfully created category with ID: ${result?.id}`);
      return result;
    } catch (error) {
      this.logger.error('Error in createCategory:', error);
      throw error;
    }
  }

  async getCategoryById(id: number) {
    this.logger.log(`Fetching category with ID: ${id}`);
    try {
      const result = await firstValueFrom(
        this.productClient
          .send(PRODUCT_MESSAGE_PATTERNS.CATEGORY_FIND_BY_ID, id)
          .pipe(
            timeout(5000),
            catchError((error) => {
              this.logger.error(`Failed to fetch category with ID: ${id}`, error);
              return throwError(() => error);
            }),
          ),
      );
      this.logger.log(`Successfully fetched category: ${result?.name}`);
      return result;
    } catch (error) {
      this.logger.error('Error in getCategoryById:', error);
      throw error;
    }
  }

  async updateCategory(id: number, dto: UpdateCategoryDto) {
    this.logger.log(`Updating category with ID: ${id}`);
    try {
      const result = await firstValueFrom(
        this.productClient
          .send(PRODUCT_MESSAGE_PATTERNS.CATEGORY_UPDATE, { id, ...dto })
          .pipe(
            timeout(5000),
            catchError((error) => {
              this.logger.error(`Failed to update category with ID: ${id}`, error);
              return throwError(() => error);
            }),
          ),
      );
      this.logger.log(`Successfully updated category with ID: ${id}`);
      return result;
    } catch (error) {
      this.logger.error('Error in updateCategory:', error);
      throw error;
    }
  }

  async deleteCategory(id: number) {
    this.logger.log(`Deleting category with ID: ${id}`);
    try {
      const result = await firstValueFrom(
        this.productClient
          .send(PRODUCT_MESSAGE_PATTERNS.CATEGORY_DELETE, id)
          .pipe(
            timeout(5000),
            catchError((error) => {
              this.logger.error(`Failed to delete category with ID: ${id}`, error);
              return throwError(() => error);
            }),
          ),
      );
      this.logger.log(`Successfully deleted category with ID: ${id}`);
      return result;
    } catch (error) {
      this.logger.error('Error in deleteCategory:', error);
      throw error;
    }
  }
}
