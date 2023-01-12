import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class VerifyOtpDTO {
  @ApiProperty()
  @IsString()
  token: string;

  @ApiProperty({ minLength: 6, maxLength: 6 })
  @IsString()
  pin: string;
}

export class RequestOtpResponseDTO {
  @ApiProperty()
  @IsString()
  status: string;

  @ApiProperty()
  @IsString()
  token: string;

  @ApiProperty()
  @IsString()
  refno: string;
}
