import { Test, TestingModule } from '@nestjs/testing';
import { ImageProcessingController } from './image-processing.controller';

describe('ImageProcessingController', () => {
  let controller: ImageProcessingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImageProcessingController],
    }).compile();

    controller = module.get<ImageProcessingController>(ImageProcessingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
