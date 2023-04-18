import { Test, TestingModule } from '@nestjs/testing';
import { StorageService } from '../storage.service';
import { HttpException } from '@nestjs/common';

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StorageService],
    }).compile();

    service = module.get<StorageService>(StorageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('removeFileExtension', () => {
    it('should remove the file extension', () => {
      const path = 'path/to/file.ext';
      const result = service.removeFileExtension(path);
      expect(result).toBe('path/to/file');
    });

    it('should return the same path if no extension is found', () => {
      const path = 'path/to/file';
      const result = service.removeFileExtension(path);
      expect(result).toBe('path/to/file');
    });

    it('should return the same path if the path is empty', () => {
      const path = '';
      const result = service.removeFileExtension(path);
      expect(result).toBe('');
    });

    it('should return the same path if the path is undefined', () => {
      const path = undefined;
      const result = service.removeFileExtension(path);
      expect(result).toBe(undefined);
    });
  });

  describe('save', () => {
    it('should throw an error if no media is provided', () => {
      const path = 'path/to/file';
      const contentType = 'text/plain';
      const media = undefined;
      try {
        service.save(path, contentType, media);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
      }
    });

    // it('should return a promise', () => {
    //   const path = 'path/to/file';
    //   const contentType = 'text/plain';
    //   const media = Buffer.from('test');
    //   const result = service.save(path, contentType, media);
    //   expect(result).toBeInstanceOf(Promise);
    // });

    // it('should return a promise that resolves to an object with metadata and contentType', async () => {
    //   const path = 'path/to/file';
    //   const contentType = 'text/plain';
    //   const media = Buffer.from('test');
    //   const result = await service.save(path, contentType, media);
    //   expect(result).toEqual({ metadata: undefined, contentType });
    // });
  });
});
