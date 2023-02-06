import { Module } from '@nestjs/common';
import { SmartContractService } from './smart-contract.service';
import { SmartContractController } from './smart-contract.controller';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { SmartContractABISchama, SmartContractBytecodeSchama } from './schema/smart-contract.schema';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: 'SmartContractABI', schema: SmartContractABISchama, collection: 'smartContractABIs' },
      { name: 'SmartContractBytecode', schema: SmartContractBytecodeSchama, collection: 'smartContractBytecodes' },
    ]),
  ],
  providers: [SmartContractService],
  controllers: [SmartContractController],
})
export class SmartContractModule {}
