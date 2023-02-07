import { StorageFile } from './storage-file';
import { DownloadResponse, Storage } from '@google-cloud/storage';
import { Injectable } from '@nestjs/common';
import StorageConfig from './storage-config';

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

  async save(path: string, contentType: string, media: Buffer, metadata: { [key: string]: string }[]) {
    return new Promise((resolve, reject) => {
      try {
        const object = metadata.reduce((obj, item) => Object.assign(obj, item), {});
        console.log(object);
        object.contentType = contentType;
        const file = this.storage.bucket(this.bucket).file(path);
        const stream = file.createWriteStream({
          metadata: {
            contentType: contentType,
          },
        });
        stream.on('finish', async () => {
          return await file.setMetadata({
            metadata: object,
          });
        });
        stream.end(media);
        resolve({ success: true });
      } catch (error) {
        reject({ success: false, reason: error });
      }
    });
  }

  async saveFiles(
    files: { path: string; contentType: string; media: Buffer; metadata: { [key: string]: string }[] }[],
  ) {
    return new Promise((resolve, reject) => {
      Array.from(files).forEach(async (file) => {
        try {
          await this.save(file.path, file.contentType, file.media, file.metadata);
          resolve({ success: true });
        } catch (error) {
          reject({ success: false, reason: error });
        }
      });
    });
  }

  async delete(path: string) {
    await this.storage.bucket(this.bucket).file(path).delete({ ignoreNotFound: true });
  }

  async getWithMetaData(path: string): Promise<StorageFile> {
    const [metadata] = await this.storage.bucket(this.bucket).file(path).getMetadata();
    const fileResponse: DownloadResponse = await this.storage.bucket(this.bucket).file(path).download();
    const [buffer] = fileResponse;

    const storageFile = new StorageFile();
    storageFile.buffer = buffer;
    storageFile.metadata = new Map<string, string>(Object.entries(metadata || {}));
    storageFile.contentType = storageFile.metadata.get('contentType');
    return storageFile;
  }
}
