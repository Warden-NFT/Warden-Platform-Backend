import {
  Body,
  Controller,
  HttpStatus,
  NotFoundException,
  Post,
  Res,
  ServiceUnavailableException,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBadRequestResponse, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { AdminGuard } from 'src/auth/jwt.guard';
import { StorageService } from 'src/storage/storage.service';
import {
  DeleteMediaDTO,
  GetMediaDTO,
  MultipleMediaUploadPayloadDTO,
  SuccessfulMediaOperationDTO,
} from './dto/media.dto';

@ApiTags('Media')
@Controller('media')
export class MediaController {
  constructor(private storageService: StorageService) {}

  @Post()
  @ApiCreatedResponse({ type: SuccessfulMediaOperationDTO })
  @ApiBadRequestResponse({ description: 'Invalid file or file size is too large' })
  @UseGuards(AdminGuard)
  @UseInterceptors(FilesInterceptor('files'))
  async uploadMedia(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() mediaUploadPayload: MultipleMediaUploadPayloadDTO,
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
  @ApiOkResponse({ type: String })
  @ApiBadRequestResponse({ description: 'Incorrect path' })
  @UseGuards(AdminGuard)
  async downloadMedia(@Body() dto: GetMediaDTO, @Res() res: Response) {
    // Return the public image URL and its customized metadata
    try {
      const url = `https://storage.googleapis.com/nft-generator-microservice-bucket-test/media/${dto.path}`;
      const { metadata } = await this.storageService.getMetadata(`media/${dto.path}`);
      res.send({ url, metadata });
    } catch (e) {
      if (e.message.toString().includes('No such object')) {
        throw new NotFoundException('File does not exist');
      } else {
        throw new ServiceUnavailableException('internal error');
      }
    }
  }

  @Post('delete')
  @ApiOkResponse({ type: SuccessfulMediaOperationDTO })
  @ApiCreatedResponse({ type: SuccessfulMediaOperationDTO })
  @ApiBadRequestResponse({ description: 'File does not exist' })
  @UseGuards(AdminGuard)
  async deleteMedia(@Body() { path }: DeleteMediaDTO, @Res() res: Response) {
    await this.storageService.delete(path);
    return res.status(HttpStatus.OK).json({ success: true });
  }
}
