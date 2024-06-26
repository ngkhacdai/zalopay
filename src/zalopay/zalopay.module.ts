import { Module } from '@nestjs/common';
import { ZalopayController } from './zalopay.controller';
import { ZalopayService } from './zalopay.service';

@Module({
  controllers: [ZalopayController],
  providers: [ZalopayService]
})
export class ZalopayModule {}
