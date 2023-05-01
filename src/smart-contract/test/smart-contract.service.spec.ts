import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { SmartContractService } from '../smart-contract.service';
import { HttpException } from '@nestjs/common';

describe('SmartContractService', () => {
  let service: SmartContractService;
  let scAbiModel: Model<SmartContractABI>;
  let scByteCode: Model<SmartContractBytecode>;

  const db = require('../../../test/db.ts');
  beforeAll(async () => await db.connect());
  afterEach(async () => await db.clearDatabase());
  afterAll(async () => await db.closeDatabase());

  class SmartContractABI {
    constructor(private data) {}
    static findById = jest.fn().mockReturnThis();
    static findOne = jest.fn().mockReturnThis();
    validate = jest.fn().mockReturnThis();
    save = jest.fn().mockReturnThis();
  }

  class SmartContractBytecode {
    constructor(private data) {}
    static findById = jest.fn().mockReturnThis();
    static findOne = jest.fn().mockReturnThis();
    validate = jest.fn().mockReturnThis();
    save = jest.fn().mockReturnThis();
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SmartContractService,
        {
          provide: getModelToken('SmartContractABI'),
          useValue: SmartContractABI,
        },
        {
          provide: getModelToken('SmartContractBytecode'),
          useValue: SmartContractBytecode,
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

  describe('getSmartContractABI', () => {
    it('should return a SmartContractABI when given a valid id', async () => {
      const id = 'valid-id';
      const mockRes = {
        _id: id,
        abi: 'valid-abi',
      };

      jest.spyOn(scAbiModel, 'findOne').mockResolvedValueOnce(mockRes);

      const res = await service.getSmartContractABI();
      expect(res).toBeDefined();
      expect(res.abi).toBeDefined();
    });

    it('should throw a NotFoundException if the latest smart contract ABI is not found', async () => {
      jest.spyOn(scAbiModel, 'findOne').mockResolvedValueOnce(null);

      // expect NotFoundException
      try {
        await service.getSmartContractABI();
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect(err.message).toBe('Smart Contract ABI not found');
      }
    });

    it('should throw an Error when given an invalid id', async () => {
      try {
        await service.getSmartContractABI();
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toBe('Smart Contract ABI not found');
      }
    });
  });

  describe('getSmartContractBytecode', () => {
    it('should return a SmartContractBytecode when given a valid id', async () => {
      const id = 'valid-id';
      const mockRes = {
        _id: id,
        bytecode: 'valid-bytecode',
      };

      jest.spyOn(scByteCode, 'findOne').mockResolvedValueOnce(mockRes);

      const res = await service.getSmartContractBytecode();
      expect(res).toBeDefined();
      expect(res.bytecode).toBeDefined();
    });

    it('should throw a NotFoundException if the latest smart contract bytecode is not found', async () => {
      jest.spyOn(scByteCode, 'findOne').mockResolvedValueOnce(null);

      // expect NotFoundException
      try {
        await service.getSmartContractBytecode();
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect(err.message).toBe('Smart Contract Bytecode not found');
      }
    });

    it('should throw an Error when given an invalid id', async () => {
      try {
        await service.getSmartContractBytecode();
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toBe('Smart Contract Bytecode not found');
      }
    });
  });

  describe('uploadSmartContractABI', () => {
    it('should return a SmartContractABI when given a valid abi', async () => {
      const mockRes = {
        _id: 'valid-id',
        abi: 'valid-abi',
      };
      const payload = {
        abi: 'valid-abi',
        date: 'date',
      };

      const newSmartContractAbi = await new SmartContractABI(payload as any);
      jest.spyOn(newSmartContractAbi, 'save').mockResolvedValueOnce(mockRes as any);
      jest.spyOn(newSmartContractAbi, 'validate').mockResolvedValueOnce(true as any);
      const res: any = await service.uploadSmartContractABI(payload.abi as any);
      expect(res.data.abi).toEqual(mockRes.abi);
    });

    it('should throw an Error when given an invalid abi', async () => {
      try {
        await service.uploadSmartContractABI('');
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
      }
    });
  });

  describe('uploadSmartContractBytecode', () => {
    it('should return a SmartContractBytecode when given a valid bytecode', async () => {
      const mockRes = {
        _id: 'valid-id',
        bytecode: 'valid-bytecode',
      };
      const payload = {
        bytecode: 'valid-bytecode',
        date: 'date',
      };

      const newSmartContractBytecode = await new SmartContractBytecode(payload as any);
      jest.spyOn(newSmartContractBytecode, 'save').mockResolvedValueOnce(mockRes as any);
      jest.spyOn(newSmartContractBytecode, 'validate').mockResolvedValueOnce(true as any);
      const res: any = await service.uploadSmartContractBytecode(payload.bytecode as any);
      expect(res.data.bytecode).toEqual(mockRes.bytecode);
    });

    it('should throw an Error when given an invalid bytecode', async () => {
      try {
        await service.uploadSmartContractBytecode('');
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
      }
    });
  });
});
