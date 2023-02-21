import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsBoolean, IsDate, IsNumber, IsString, Max, Min } from 'class-validator';
import { MultipleMediaUploadPayloadDTO } from 'src/media/dto/media.dto';
import { Currency, TicketQuota } from './ticket.interface';

export class TicketsMetadataDTO {
  @ApiProperty()
  attributes: { value: string; trait_type: string }[];

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsString()
  image: string;

  @ApiProperty()
  @IsString()
  name: string;
}

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

export class TicketQuotaDTO {
  general?: number;
  vip?: number;
  reservedSeat?: number;
}

@Expose()
export class TicketTypesDTO {
  @ApiProperty({ type: [TicketDTO] })
  genreralTickets: TicketDTO[];

  @ApiProperty({ type: [TicketDTO] })
  vipTickets: VIPTicketDTO[];

  @ApiProperty({ type: [TicketDTO] })
  reservedSeatTickets: ReservedSeatDTO[];
}

@Expose()
export class TicketCollectionDTO {
  @ApiProperty()
  @IsString()
  _id?: string;

  @ApiProperty({ type: TicketTypesDTO })
  tickets: {
    genreralTickets: TicketDTO[];
    vipTickets: VIPTicketDTO[];
    reservedSeatTickets: ReservedSeatDTO[];
  };

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

  @ApiProperty()
  @IsString()
  currency: Currency;

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

  @ApiProperty()
  @IsBoolean()
  enableResale: boolean;

  @ApiProperty({ type: TicketQuotaDTO })
  ticketQuota: TicketQuota;
}

export class updateTicketCollectionImagesDTO extends MultipleMediaUploadPayloadDTO {
  @ApiProperty()
  @IsString()
  ticketCollectionId?: string;
}

export class UpdateTicketDTO {
  @ApiProperty({ type: TicketDTO })
  ticket: TicketDTO;

  @ApiProperty()
  @IsString()
  ticketCollectionId: string;
}
