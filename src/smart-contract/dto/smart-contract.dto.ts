import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsDateString, IsString } from 'class-validator';

@Expose()
export class SmartContractAbiDTO {
  @ApiProperty()
  @IsString()
  _id: string;

  @ApiProperty()
  @IsDateString()
  date: Date | string;

  @ApiProperty()
  abi: any;
}

@Expose()
export class SmartContractBytecodeDTO {
  @ApiProperty()
  @IsString()
  _id: string;

  @ApiProperty()
  @IsDateString()
  date: Date | string;

  @ApiProperty()
  bytecode: any;
}
