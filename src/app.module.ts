import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ZalopayModule } from './zalopay/zalopay.module';

@Module({
  imports: [ZalopayModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
