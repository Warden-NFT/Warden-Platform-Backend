import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsBoolean, IsString } from 'class-validator';

@Expose()
export class SuccessfulMediaOperationDTO {
  @ApiProperty()
  @IsBoolean()
  success: boolean;
}

@Expose()
export class MediaWithMetadataDTO {
  @ApiProperty()
  @IsString()
  url: string;

  @ApiProperty({ type: [{}] })
  ticketMetadata: { [key: string]: string }[];

  @ApiProperty()
  @IsString()
  timeCreated: string;
}
