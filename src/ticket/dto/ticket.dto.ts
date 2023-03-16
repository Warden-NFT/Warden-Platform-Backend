import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsBoolean, IsDate, IsNumber, IsString, Max, Min } from 'class-validator';
import mongoose from 'mongoose';
import { MultipleMediaUploadPayloadDTO } from 'src/media/dto/media.dto';
import { Currency, TicketGenerationMode, TicketQuota, TicketType } from '../interface/ticket.interface';

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

export class PriceDTO {
  @ApiProperty()
  @IsNumber()
  amount: number;

  @ApiProperty()
  @IsString()
  currency: Currency;
}

export class TicketDTO {
  @ApiProperty()
  @IsString()
  _id?: string;

  @ApiProperty()
  @IsString()
  smartContractTicketId?: number;

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
  @IsString({ each: true })
  ownerHistory: string[];

  @ApiProperty()
  @IsString()
  ticketType: TicketType;

  @ApiProperty({ type: PriceDTO })
  price: PriceDTO;

  @ApiProperty()
  hasUsed: boolean;
}

export class VIPTicketDTO extends TicketDTO {
  @ApiProperty()
  @IsString()
  benefits?: string; // placeholder
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
export class ResaleTicketPurchasePermissionDTO {
  @ApiProperty()
  @IsString()
  _id?: string;

  @ApiProperty()
  @IsString()
  address: string;

  @ApiProperty()
  @IsString()
  ticketCollectionId: string;

  @ApiProperty()
  @IsString()
  ticketId: string;

  @ApiProperty()
  @IsNumber()
  smartContractTicketId: number;

  @ApiProperty()
  @IsBoolean()
  approved?: boolean;
}

@Expose()
export class ApproveTicketPurchaseDTO {
  @ApiProperty()
  @IsString()
  ticketCollectionId: string;

  @ApiProperty()
  @IsString()
  permissionId: string;
}

@Expose()
export class RequestResaleTicketPurchasePermissionResult {
  @ApiProperty()
  @IsNumber()
  success: boolean;

  @ApiProperty()
  @IsString()
  reason?: string;
}

@Expose()
export class TicketTypesDTO {
  @ApiProperty({ type: [TicketDTO] })
  genreralTickets: TicketDTO[];

  @ApiProperty({ type: [TicketDTO] })
  vip: VIPTicketDTO[];

  @ApiProperty({ type: [TicketDTO] })
  reservedSeat: ReservedSeatDTO[];
}

@Expose()
export class TicketCollectionDTO {
  @ApiProperty()
  @IsString()
  _id?: string;

  @ApiProperty({ type: TicketTypesDTO })
  tickets: {
    genreralTickets: TicketDTO[];
    vip: VIPTicketDTO[];
    reservedSeat: ReservedSeatDTO[];
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

  @ApiProperty()
  @IsString()
  generationMethod: TicketGenerationMode; // new

  @ApiProperty({ type: [ResaleTicketPurchasePermissionDTO] })
  resaleTicketPurchasePermission: ResaleTicketPurchasePermissionDTO[];
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

@Expose()
export class TicketTransactionDTO {
  @ApiProperty()
  @IsString()
  walletAddress: `0x${string}`;

  @ApiProperty()
  @IsString()
  eventId: string;

  @ApiProperty()
  @IsString()
  ticketCollectionId: string;

  @ApiProperty()
  @IsString()
  ticketId: string;
}

@Expose()
export class TicketUtilizeDTO {
  @ApiProperty()
  @IsString()
  eventId: string;

  @ApiProperty()
  @IsString()
  ticketId: string;

  @ApiProperty()
  @IsString()
  userId: string;

  @ApiProperty()
  @IsString()
  walletAddress: string;
}

@Expose()
export class TicketQuotaCheckResultDTO {
  @ApiProperty()
  @IsNumber()
  ownedTicketsCount: number;

  @ApiProperty()
  @IsNumber()
  quota: number;

  @ApiProperty()
  @IsBoolean()
  allowPurchase: boolean;

  @ApiProperty()
  @IsBoolean()
  resalePurchaseApproved: boolean;

  @ApiProperty()
  @IsBoolean()
  resalePurchasePendingApproval: boolean;
}
