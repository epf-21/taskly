import { Module } from '@nestjs/common';
import { ColumnItemController, ColumnsController } from './columns.controller';
import { ColumnsRepository } from './columns.repository';
import { ColumnsService } from './columns.service';

@Module({
  controllers: [ColumnsController, ColumnItemController],
  providers: [ColumnsRepository, ColumnsService],
  exports: [ColumnsService, ColumnsRepository],
})
export class ColumnsModule {}
