import { Module } from '@nestjs/common';
import { SalesRepsController } from './sales-reps.controller';
import { SalesRepsService } from './sales-reps.service';

@Module({
  controllers: [SalesRepsController],
  providers: [SalesRepsService],
  exports: [SalesRepsService],
})
export class SalesRepsModule {}
