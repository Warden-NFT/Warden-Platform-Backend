import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StorageModule } from './storage/storage.module';
import { MediaController } from './media/media.controller';
import { MediaModule } from './media/media.module';
import { ImageProcessingModule } from './image-processing/image-processing.module';

@Module({
  imports: [StorageModule, MediaModule, ImageProcessingModule],
  controllers: [AppController, MediaController],
  providers: [AppService],
})
export class AppModule {}
