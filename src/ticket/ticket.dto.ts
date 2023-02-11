import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsDate, IsNumber, IsString, Max, Min } from 'class-validator';
import { TicketsMetadataDTO } from 'src/event/event.dto';
import { Ticket } from './ticket.interface';

export class TicketPriceSettings {
  @ApiProperty()
  @IsNumber()
  default: number;

  @ApiProperty()
  @IsNumber()
  min: number;

  @ApiProperty()
  @IsNumber()
  max: number;
}
export class TicketPriceDTO {
  @ApiProperty({ type: TicketPriceSettings })
  general?: {
    default: number;
    min: number;
    max: number;
  };

  @ApiProperty({ type: TicketPriceSettings })
  vip?: {
    default: number;
    min: number;
    max: number;
  };

  @ApiProperty({ type: TicketPriceSettings })
  reservedSeat?: {
    default: number;
    min: number;
    max: number;
  };
}

@Expose()
export class TicketSetDTO {
  @ApiProperty()
  @IsString()
  _id?: string;
  tickets: Ticket[];

  @ApiProperty()
  @IsString()
  createdDate: string;

  @ApiProperty()
  @IsString()
  ownerId: string;

  @ApiProperty()
  @IsString()
  ownerAddress: string;

  @ApiProperty()
  @IsString()
  smartContractAddress: string;

  @ApiProperty()
  @IsString()
  subjectOf: string; // Event ID

  @ApiProperty({ type: TicketPriceDTO })
  ticketPrice: {
    general: {
      default: number;
      min: number;
      max: number;
    };
    vip: {
      default: number;
      min: number;
      max: number;
    };
    reservedSeat: {
      default: number;
      min: number;
      max: number;
    };
  };

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Max(1)
  royaltyFee: number;
}

export class TicketDTO {
  @ApiProperty()
  @IsString()
  _id?: string;

  @ApiProperty()
  @IsDate()
  dateIssued: Date;

  @ApiProperty()
  @IsNumber()
  ticketNumber: number;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty({ type: [TicketsMetadataDTO] })
  ticketMetadata: TicketsMetadataDTO[];

  @ApiProperty()
  @IsString()
  ownerAddress: string;

  @ApiProperty()
  @IsString({ each: true })
  ownerHistory: string[];
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

export class UpdateTicketDTO {
  @ApiProperty({ type: TicketDTO })
  ticket: TicketDTO;

  @ApiProperty()
  @IsString()
  ticketSetId: string;
}
