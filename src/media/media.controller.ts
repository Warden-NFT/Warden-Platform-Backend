import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
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
import { StorageFile } from 'src/storage/storage-file';
import { StorageService } from 'src/storage/storage.service';
import { MediaUploadPayload, MultipleMediaUploadPayload } from './Interfaces/MediaUpload';

@ApiTags('Media')
@Controller('media')
export class MediaController {
  constructor(private storageService: StorageService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        files: 1,
        fileSize: 10000000, // approximately 10 MB
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
    const { folder } = mediaUploadPayload;
    const filesData: { path: string; contentType: string; media: Buffer; metadata: { [key: string]: string }[] }[] =
      Array.from(files).map((file, index) => {
        return {
          path: `media/${folder}/` + index,
          contentType: file.mimetype,
          media: file.buffer,
          metadata: [
            {
              mediaId: `${file}`,
            },
          ],
        };
      });
    return this.storageService.saveFiles(filesData);
  }

  @Get('/:folder/:mediaId')
  async downloadMedia(@Param('folder') folder: string, @Param('mediaId') mediaId: string, @Res() res: Response) {
    console.log(mediaId);
    let storageFile: StorageFile;
    try {
      storageFile = await this.storageService.getWithMetaData(`media/${folder}/${mediaId}`);
    } catch (e) {
      if (e.message.toString().includes('No such object')) {
        throw new NotFoundException('image not found');
      } else {
        throw new ServiceUnavailableException('internal error');
      }
    }

    // Return the actual image file
    // res.setHeader('Content-Type', storageFile.contentType);
    // res.setHeader('Cache-Control', 'max-age=60d');
    // res.end(storageFile.buffer);

    // Return the public image URL
    const url = `https://storage.googleapis.com/nft-generator-microservice-bucket-test/media/${folder}/${mediaId}`;
    res.send(url);
  }
}
