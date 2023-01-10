import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsDate, IsNumber, IsString } from 'class-validator';
import { TicketType } from 'src/ticket/ticket.interface';
import { EventStatusType, TicketsMetadata } from './event.interface';

@Expose()
export class TicketsMetadataDTO {
  data: [
    {
      attributes: string;
      description: string;
      image: string;
      name: string;
    },
  ];
}

@Expose()
export class EventDTO {
  @ApiProperty()
  @IsString()
  eventStatus: EventStatusType;

  @ApiProperty({ type: [String] })
  eventKeywords: string[];

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

  @ApiProperty()
  @IsString()
  ticketType: TicketType;

  @ApiProperty()
  @IsString()
  ownerAddress: string;

  @ApiProperty()
  @IsString()
  smartContractAddress: string;

  @ApiProperty({ type: TicketsMetadataDTO })
  ticketsMetadata: TicketsMetadata;
}

@Expose()
export class UpdateEventDTO extends EventDTO {
  @ApiProperty()
  @IsString()
  eventId: string;

  @ApiProperty()
  @IsString()
  eventOrganizerId: string;
}
