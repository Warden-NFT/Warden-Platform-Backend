import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsBoolean, IsNumber, IsString } from 'class-validator';
import { Types } from 'mongoose';

@Expose()
export class HttpErrorResponse {
  @ApiProperty()
  @IsString()
  status: string;

  @ApiProperty()
  @IsString()
  message: string;
}

@Expose()
export class DeleteResponseDTO {
  @ApiProperty()
  @IsBoolean()
  acknowledged: boolean;

  @ApiProperty()
  @IsNumber()
  deletedCount: number;
}

@Expose()
export class InsertManyResponseDTO {
  @ApiProperty()
  @IsBoolean()
  acknowledged: boolean;

  @ApiProperty({ type: [String] })
  insertedIds: Types.ObjectId[];
}
