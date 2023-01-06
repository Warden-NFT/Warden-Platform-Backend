import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsDate, IsNumber, IsString } from 'class-validator';
import { EventStatusType } from './event.schema';

@Expose()
export class EventDTO {
  @ApiProperty()
  @IsString()
  eventStatus: EventStatusType;

  @ApiProperty({ type: [String] })
  keywords: string[];

  @ApiProperty()
  @IsString()
  location: string;

  @ApiProperty()
  @IsNumber()
  maximumAttendeeCapacity: number;

  @ApiProperty()
  @IsString()
  organizerId: string;

  @ApiProperty()
  @IsString()
  subEventId: string;

  @ApiProperty()
  @IsString()
  superEventId: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsString()
  identifier: string;

  @ApiProperty({ oneOf: [{ type: 'string' }, { type: 'file' }] })
  image: File | string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  url: string;

  @ApiProperty()
  @IsDate()
  doorTime: Date;

  @ApiProperty()
  @IsDate()
  startDate: Date;

  @ApiProperty()
  @IsDate()
  endDate: Date;
}
