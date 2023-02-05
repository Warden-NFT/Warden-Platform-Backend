import * as mongoose from 'mongoose';

export interface SmartContractABI extends mongoose.Document {
  date: Date;
  abi: any;
}

export interface SmartContractBytecode extends mongoose.Document {
  date: Date;
  bytecode: any;
}
