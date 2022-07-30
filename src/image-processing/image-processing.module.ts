import { Module } from '@nestjs/common';
import { ImageProcessingService } from './image-processing.service';
import { ImageProcessingController } from './image-processing.controller';
import { StorageModule } from 'src/storage/storage.module';

@Module({
  imports: [StorageModule],
  providers: [ImageProcessingService],
  controllers: [ImageProcessingController],
})
export class ImageProcessingModule {}
