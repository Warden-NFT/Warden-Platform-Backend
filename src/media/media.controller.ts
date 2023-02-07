import {
  Body,
  Controller,
  HttpStatus,
  NotFoundException,
  Post,
  Res,
  ServiceUnavailableException,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { StorageFileWithMetadata } from 'src/storage/storage-file';
import { StorageService } from 'src/storage/storage.service';
import {
  DeleteMediaDTO,
  GetMediaDTO,
  MediaUploadPayload,
  MultipleMediaUploadPayload,
  StoredFileMetadata,
} from './Interfaces/MediaUpload';

@ApiTags('Media')
@Controller('media')
export class MediaController {
  constructor(private storageService: StorageService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        files: 1,
        fileSize: 10_000_000, // approximately 10 MB
      },
    }),
  )
  async uploadMedia(@UploadedFile() file: Express.Multer.File, @Body() mediaUploadPayload: MediaUploadPayload) {
    const { mediaId, folder } = mediaUploadPayload;
    return this.storageService.save(`media/${folder}/` + mediaId, file.mimetype, file.buffer, [{ mediaId: mediaId }]);
  }

  @Post('multiple')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadMultipleMedia(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() mediaUploadPayload: MultipleMediaUploadPayload,
  ) {
    const { folder, metadata } = mediaUploadPayload;
    const fileMetadata = JSON.parse(metadata) as StoredFileMetadata[];
    const filesData = files.map((file, i) => {
      const _metadata = fileMetadata[i] ?? {};
      return {
        path: `media/${folder}/${file.originalname}`,
        contentType: file.mimetype,
        media: file.buffer,
        metadata: [_metadata],
      };
    });
    return this.storageService.saveFiles(filesData);
  }

  @Post('getMedia')
  async downloadMedia(@Body() dto: GetMediaDTO, @Res() res: Response) {
    // Return the public image URL
    const url = `https://storage.googleapis.com/nft-generator-microservice-bucket-test/${dto.path}`;
    res.send(url);
  }

  @Post('getMetadata')
  async getMetadata(@Body() dto: GetMediaDTO, @Res() res: Response) {
    let storageFile: StorageFileWithMetadata;
    try {
      storageFile = await this.storageService.getWithMetaData(dto.path);
      const url = `https://storage.googleapis.com/nft-generator-microservice-bucket-test/${dto.path}`;
      res.send({ url, ticketMetadata: storageFile.ticketMetadata });
    } catch (e) {
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
