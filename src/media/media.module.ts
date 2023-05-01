import { Module } from '@nestjs/common';
import { StorageModule } from '../storage/storage.module';
import { MediaController } from './media.controller';

@Module({
  imports: [StorageModule],
  controllers: [MediaController],
})
export class MediaModule {}
