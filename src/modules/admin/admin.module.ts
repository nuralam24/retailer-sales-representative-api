import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { RetailersModule } from '../retailers/retailers.module';
import { SalesRepsModule } from '../sales_rep_retailers/sales-reps.module';

@Module({
  imports: [RetailersModule, SalesRepsModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}

