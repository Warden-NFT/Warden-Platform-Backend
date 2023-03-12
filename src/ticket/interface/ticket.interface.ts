import { TicketsMetadata } from 'src/event/interfaces/event.interface';
import { PriceDTO } from '../dto/ticket.dto';

export type TicketType = 'GENERAL' | 'VIP' | 'RESERVED_SEAT';

export const TicketTypeKeys = ['general', 'vip', 'reservedSeat'];

export type Currency = 'ETH' | 'MATIC';

export type TicketGenerationMode = 'complete' | 'layer';

export interface TicketCollection {
  _id?: string;
  smartContractTicketId?: number;
  tickets: {
    general: Ticket[];
    vip: VIPTicket[];
    reservedSeat: Ticket[];
  };
  createdDate: string;
  ownerId: string;
  ownerAddress: string;
  smartContractAddress: string;
  subjectOf: string; // Event ID
  ticketPrice: {
    general?: {
      default: number;
      min: number;
      max: number;
    };
    vip?: {
      default: number;
      min: number;
      max: number;
    };
    reservedSeat?: {
      default: number;
      min: number;
      max: number;
    };
  };
  royaltyFee: number;
  enableResale: boolean;
  currency: Currency;
  ticketQuota: TicketQuota;
  generationMethod: TicketGenerationMode;
}

export interface Ticket {
  _id?: string;
  dateIssued: Date;
  ticketNumber: number;
  name: string;
  description: string;
  ticketMetadata: TicketsMetadata[];
  ownerAddress: string;
  ownerHistory: string[];
  ticketType: TicketType;
  price: PriceDTO;
}

export interface VIPTicket extends Ticket {
  benefits: string; // placeholder
}

export interface ReservedSeatDTO extends Ticket {
  ticketSeat: string;
}

export interface TicketQuota {
  general?: number;
  vip?: number;
  reservedSeat?: number;
}
