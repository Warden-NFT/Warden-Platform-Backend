import { TicketsMetadata } from '../../event/interfaces/event.interface';
import { PriceDTO } from '../dto/ticket.dto';

export type TicketType = 'GENERAL' | 'VIP' | 'RESERVED_SEAT';

export const TicketTypeKeys = ['general', 'vip', 'reservedSeat'];

export const TicketTypeKeyName = {
  GENERAL: 'general',
  VIP: 'vip',
  RESERVED_SEAT: 'reservedSeat',
};

export type Currency = 'ETH' | 'MATIC';

export type TicketGenerationMode = 'complete' | 'layer';

export interface TicketCollection {
  _id?: string;
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
  resaleTicketPurchasePermission: ResaleTicketPurchasePermission[];
}

export interface Ticket {
  _id?: string;
  smartContractTicketId?: number;
  dateIssued: Date;
  ticketNumber: number;
  name: string;
  description: string;
  ticketMetadata: TicketsMetadata[];
  ownerHistory: string[];
  ticketType: TicketType;
  price: PriceDTO;
  hasUsed: boolean;
  eventId?: string;
  startDate?: Date;
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

export interface ResaleTicketPurchasePermission {
  _id?: string;
  address: string;
  ticketCollectionId: string;
  ticketId: string;
  smartContractTicketId: number;
  approved?: boolean;
}
