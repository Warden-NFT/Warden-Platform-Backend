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
});
