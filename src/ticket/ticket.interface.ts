import { TicketsMetadata } from 'src/event/interfaces/event.interface';

export type TicketType = 'GENERAL' | 'VIP' | 'RESERVED_SEAT';

export const TicketTypeKeys = ['generalTickets', 'vipTickets', 'reservedSeatTickets'];

export type Currency = 'ETH' | 'MATIC';

export interface TicketSet {
  _id?: string;
  tickets: {
    generalTickets: Ticket[];
    vipTickets: VIPTicket[];
    reservedSeatTickets: Ticket[];
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
