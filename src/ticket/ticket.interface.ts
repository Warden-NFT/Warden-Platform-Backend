import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNumber, IsString } from 'class-validator';
import { Types } from 'mongoose';
import { TicketsMetadataDTO } from 'src/event/event.dto';

export type TicketType = 'GENERAL' | 'VIP' | 'RESERVED_SEAT';

export class TicketDTO {
  @ApiProperty()
  @IsDate()
  dateIssued: Date;

  @ApiProperty()
  @IsString()
  issuedBy: Types.ObjectId;

  @ApiProperty()
  @IsString()
  priceCurrency: string;

  @ApiProperty()
  @IsNumber()
  ticketNumber: number;

  @ApiProperty()
  @IsNumber()
  totalPrice: number;

  @ApiProperty()
  @IsString()
  ownerId: Types.ObjectId;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  subjectOf: Types.ObjectId; // Event ID

  @ApiProperty()
  @IsString()
  smartContractAddress: string;

  @ApiProperty({ type: TicketsMetadataDTO })
  ticketMetadata: TicketsMetadataDTO;

  @ApiProperty()
  @IsString()
  ownerAddress: string;
}

export class VIPTicketDTO extends TicketDTO {
  @ApiProperty()
  @IsString()
  benefits: string; // placeholder
}

export class ReservedSeatDTO extends TicketDTO {
  @ApiProperty()
  @IsString()
  ticketSeat: string;
}
