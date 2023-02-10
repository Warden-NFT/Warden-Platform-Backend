import { StorageFile, StorageFileWithMetadata } from './storage-file';
import { DownloadResponse, Storage } from '@google-cloud/storage';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import StorageConfig from './storage-config';
import { FileData, StoredFileMetadata } from 'src/media/Interfaces/MediaUpload';

@Injectable()
export class StorageService {
  private storage: Storage;
  private bucket: string;

  constructor() {
    this.storage = new Storage({
      projectId: StorageConfig.projectId,
      credentials: {
        client_email: StorageConfig.client_email,
        private_key: StorageConfig.private_key,
      },
    });

    this.bucket = StorageConfig.mediaBucket;
  }

  async save(path: string, contentType: string, media: Buffer, metadata?: StoredFileMetadata[] | undefined) {
    if (!media) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'No file was uploaded',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    return new Promise((resolve, _) => {
      const file = this.storage.bucket(this.bucket).file(path);
      const stream = file.createWriteStream({
        metadata: {
          contentType,
        },
      });
      stream.on('finish', async () => {
        return await file.setMetadata({
          metadata: metadata,
        });
      });

      stream.end(media);
      resolve({ metadata, contentType });
    });
  }

  async saveFiles(files: FileData[]) {
    if (files.length <= 0) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'No file was uploaded',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    files.map(async (file) => {
      await this.save(file.path, file.contentType, file.media, file.metadata);
    });

    return { success: true };
  }

  async delete(path: string) {
    try {
      await this.storage.bucket(this.bucket).file(path).delete({ ignoreNotFound: true });
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getWithMetaData(path: string): Promise<StorageFileWithMetadata> {
    const [metadata] = await this.storage.bucket(this.bucket).file(path).getMetadata();
    const fileResponse: DownloadResponse = await this.storage.bucket(this.bucket).file(path).download();
    const [buffer] = fileResponse;

    const storageFile = new StorageFile();
    storageFile.buffer = buffer;
    storageFile.metadata = new Map<string, string>(Object.entries(metadata || {}));
    storageFile.contentType = storageFile.metadata.get('contentType');
    return { file: storageFile, metadata: metadata.metadata };
  }

  async getMetadata(path: string): Promise<StoredFileMetadata> {
    try {
      const [metadata] = await this.storage.bucket(this.bucket).file(path).getMetadata();
      return metadata;
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
