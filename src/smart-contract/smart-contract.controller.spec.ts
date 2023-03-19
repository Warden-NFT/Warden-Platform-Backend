import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { SmartContractController } from './smart-contract.controller';
import { SmartContractService } from './smart-contract.service';

describe('SmartContractController', () => {
  let controller: SmartContractController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SmartContractController],
      providers: [
        SmartContractService,
        {
          provide: getModelToken('SmartContractABI'),
          useValue: {},
        },
        {
          provide: getModelToken('SmartContractBytecode'),
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<SmartContractController>(SmartContractController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
