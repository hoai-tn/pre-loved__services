import { Module, forwardRef } from '@nestjs/common';
import { GatewayModule } from '../gateway.module';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';

@Module({
  imports: [forwardRef(() => GatewayModule)],
  controllers: [CategoryController],
  providers: [CategoryService],
  exports: [CategoryService],
})
export class CategoryModule { }
