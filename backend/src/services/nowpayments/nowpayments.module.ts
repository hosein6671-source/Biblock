import { Module } from '@nestjs/common';
import { NowpaymentsService } from './nowpayments.service';

@Module({
  providers: [NowpaymentsService],
  exports: [NowpaymentsService],
})
export class NowpaymentsModule {}