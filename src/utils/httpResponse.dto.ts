import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsBoolean, IsNumber, IsString } from 'class-validator';

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
