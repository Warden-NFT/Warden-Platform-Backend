import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { SmartContractABI, SmartContractBytecode } from './interface/smart-contract.interface';
import { SmartContractABISchama } from './schema/smart-contract.schema';
import { SmartContractService } from './smart-contract.service';

describe('SmartContractService', () => {
  let service: SmartContractService;
  let scAbiModel: Model<SmartContractABI>;
  let scByteCode: Model<SmartContractBytecode>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SmartContractService,
        {
          provide: getModelToken('SmartContractABI'),
          useValue: {
            findById: jest.fn().mockReturnThis(),
          },
        },
        {
          provide: getModelToken('SmartContractBytecode'),
          useValue: {
            findById: jest.fn().mockReturnThis(),
          },
        },
      ],
    }).compile();

    scAbiModel = module.get<Model<SmartContractABI>>(getModelToken('SmartContractABI'));
    scByteCode = module.get<Model<SmartContractBytecode>>(getModelToken('SmartContractBytecode'));
    service = module.get<SmartContractService>(SmartContractService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
