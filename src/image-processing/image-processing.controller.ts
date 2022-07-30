import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import * as sharp from 'sharp';
import { StorageService } from 'src/storage/storage.service';

@Controller('image-processing')
export class ImageProcessingController {
  constructor(private storageService: StorageService) {}

  @Get()
  async test() {
    return HttpStatus.OK;
  }

  @Post('merge')
  @UseInterceptors(FilesInterceptor('files'))
  async mergeImage(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Res() res,
    @Body() body,
  ) {
    const { folder, mediaId } = body;
    const url = `https://storage.googleapis.com/nft-generator-microservice-bucket-test/media/${folder}/${mediaId}`;
    const layers = files.map((file) => {
      return {
        input: file.buffer,
        mimetype: file.mimetype,
      };
    });
    try {
      sharp(layers[0].input)
        .composite(layers)
        .png()
        .toBuffer()
        .then(async (data) => {
          // Sending the image back
          // res.type('png').send(data);

          // Uploading to Cloud Storage
          this.storageService
            .save(`media/${folder}/` + mediaId, layers[0].mimetype, data, [
              { mediaId: mediaId },
            ])
            .then(() => res.send(url));
        });
    } catch (error) {
      throw new HttpException('Bad request', HttpStatus.BAD_REQUEST);
    }
  }
}
