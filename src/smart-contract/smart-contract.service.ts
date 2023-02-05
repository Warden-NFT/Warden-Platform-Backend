import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SmartContractAbiDTO, SmartContractBytecodeDTO } from './dto/smart-contract.dto';
import { SmartContractABI, SmartContractBytecode } from './interface/smart-contract.interface';

@Injectable()
export class SmartContractService {
  constructor(
    @InjectModel('SmartContractABI') private smartContractABIModel: Model<SmartContractABI>,
    @InjectModel('SmartContractBytecode') private smartContractBytecodeModel: Model<SmartContractBytecode>,
  ) {}

  async uploadSmartContractABI(abi): Promise<SmartContractAbiDTO> {
    const payload = {
      date: new Date(),
      abi: abi,
    };
    try {
      await new this.smartContractABIModel(payload).validate();
      const newSmartContractAbi = await new this.smartContractABIModel(payload);
      return newSmartContractAbi.save();
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

  async getSmartContractABI(): Promise<SmartContractAbiDTO> {
    try {
      const latestSmartContractABI = await this.smartContractABIModel.findOne({}, {}, { sort: { date: -1 } });
      if (!latestSmartContractABI) {
        throw new NotFoundException(`Smart Contract ABI not found`);
      }
      return latestSmartContractABI;
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

  async uploadSmartContractBytecode(bytecodeJson): Promise<SmartContractBytecodeDTO> {
    const payload = {
      date: new Date(),
      bytecode: bytecodeJson,
    };
    try {
      await new this.smartContractBytecodeModel(payload).validate();
      const newByteCode = await new this.smartContractBytecodeModel(payload);
      return newByteCode.save();
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

  async getSmartContractBytecode(): Promise<SmartContractBytecodeDTO> {
    try {
      const latestSmartContractBytecode = await this.smartContractBytecodeModel.findOne({}, {}, { sort: { date: -1 } });
      if (!latestSmartContractBytecode) {
        throw new NotFoundException(`Smart Contract Bytecode not found`);
      }
      return latestSmartContractBytecode;
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
