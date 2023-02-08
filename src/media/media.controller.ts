import {
  Body,
  Controller,
  HttpStatus,
  NotFoundException,
  Post,
  Res,
  ServiceUnavailableException,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { StorageService } from 'src/storage/storage.service';
import { DeleteMediaDTO, GetMediaDTO, MultipleMediaUploadPayload } from './Interfaces/MediaUpload';

@ApiTags('Media')
@Controller('media')
export class MediaController {
  constructor(private storageService: StorageService) {}

  @Post('')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadMedia(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() mediaUploadPayload: MultipleMediaUploadPayload,
  ) {
    const { folder, metadata } = mediaUploadPayload;
    const filesData = files.map((file) => {
      return {
        path: `media/${folder}/${file.originalname}`,
        contentType: file.mimetype,
        media: file.buffer,
        metadata: JSON.parse(metadata),
      };
    });

    return this.storageService.saveFiles(filesData);
  }

  @Post('getMedia')
  async downloadMedia(@Body() dto: GetMediaDTO, @Res() res: Response) {
    // Return the public image URL and its customized metadata
    try {
      const url = `https://storage.googleapis.com/nft-generator-microservice-bucket-test/media/${dto.path}`;
      const { metadata } = await this.storageService.getMetadata(`media/${dto.path}`);
      res.send({ url, metadata });
    } catch (e) {
      console.log(e.message);
      if (e.message.toString().includes('No such object')) {
        throw new NotFoundException('image not found');
      } else {
        throw new ServiceUnavailableException('internal error');
      }
    }
  }

  @Post('delete')
  async deleteMedia(@Body() { path }: DeleteMediaDTO, @Res() res: Response) {
    await this.storageService.delete(path);
    return res.status(HttpStatus.OK).json({ success: true });
  }
}
