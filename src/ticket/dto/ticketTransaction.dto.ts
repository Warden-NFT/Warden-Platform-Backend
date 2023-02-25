import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsBoolean, IsString } from 'class-validator';

@Expose()
export class TicketTransactionPermissionDTO {
  @ApiProperty()
  @IsBoolean()
  allowed: boolean;

  @ApiProperty()
  @IsString()
  reason?: string;
}

@Expose()
export class UpdateTicketOwnershipDTO {
  @ApiProperty()
  @IsBoolean()
  success: boolean;

  @ApiProperty()
  @IsString()
  reason?: string;
}
