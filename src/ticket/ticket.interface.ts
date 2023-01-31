import { Types } from 'mongoose';
import { TicketsMetadata } from 'src/event/interfaces/event.interface';

export type TicketType = 'GENERAL' | 'VIP' | 'RESERVED_SEAT';

export interface Ticket {
  _id?: Types.ObjectId;
  dateIssued: Date;
  issuedBy: Types.ObjectId;
  priceCurrency: string;
  ticketNumber: number;
  totalPrice: number;
  ownerId: Types.ObjectId;
  description: string;
  name: string;
  subjectOf: Types.ObjectId; // Event ID
  smartContractAddress: string;
  ticketMetadata: TicketsMetadata;
  ownerAddress: string;
}

export interface VIPTicked extends Ticket {
  benefits: string; // placeholder
}

export interface ReservedSeatDTO extends Ticket {
  ticketSeat: string;
}
