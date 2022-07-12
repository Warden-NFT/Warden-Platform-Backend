import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StorageModule } from './storage/storage.module';
import { MediaController } from './media/media.controller';
import { MediaModule } from './media/media.module';

@Module({
  imports: [StorageModule, MediaModule],
  controllers: [AppController, MediaController],
  providers: [AppService],
})
export class AppModule {}
