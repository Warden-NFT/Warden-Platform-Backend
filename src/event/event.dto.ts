import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsDateString, IsNumber, IsString } from 'class-validator';
import { TicketType } from 'src/ticket/ticket.interface';
import { EventStatusType, TicketsMetadata } from './interfaces/event.interface';
import { PlaceType } from './interfaces/location.interface';

@Expose()
export class TicketsMetadataDTO {
  attributes: { value: string; trait_type: string }[];
  description: string;
  image: string;
  name: string;
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
  location: PlaceType;

  @ApiProperty()
  @IsString()
  online_url: string;

  @ApiProperty()
  ticketSupply: {
    general: number;
    vip: number;
    reservedSeat: number;
  };

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
  image: any;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  url: string;

  @ApiProperty()
  @IsDateString()
  doorTime: Date;

  @ApiProperty()
  @IsDateString()
  startDate: Date;

  @ApiProperty()
  @IsDateString()
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

  @ApiProperty()
  @IsString()
  ticketSetId: string;
}

@Expose()
export class CreateEventDTO {
  @ApiProperty()
  data: string;
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
