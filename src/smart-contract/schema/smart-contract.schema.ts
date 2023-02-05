import * as mongoose from 'mongoose';

export const SmartContractABISchama = new mongoose.Schema({
  date: {
    type: String,
    required: true,
  },
  abi: {
    type: [Object],
    required: true,
  },
});

export const SmartContractBytecodeSchama = {
  date: {
    type: String,
    required: true,
  },
  bytecode: {
    type: Object,
    required: true,
  },
};
