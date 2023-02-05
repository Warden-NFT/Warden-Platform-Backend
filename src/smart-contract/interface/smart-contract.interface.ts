import * as mongoose from 'mongoose';

export interface InputData {
  indexed: boolean;
  internalType: string;
  name: string;
  type: string;
}

export interface ABIItem {
  anonymous: boolean;
  inputs: InputData[];
}

export interface SmartContractABI extends mongoose.Document {
  date: Date;
  abi: ABIItem[];
}

export interface SmartContractBytecode extends mongoose.Document {
  date: Date;
  bytecode: any;
}
