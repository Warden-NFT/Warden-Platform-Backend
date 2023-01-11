import { Types } from 'mongoose';
import { TicketType } from 'src/ticket/ticket.interface';

export type EventStatusType = 'NotStarted' | 'AdmissionStarted' | 'EventStarted' | 'EventEnded';

export type TicketsMetadata = { data: [{ attributes: string; description: string; image: string; name: string }] };

export interface Event {
  _id?: Types.ObjectId | string;
  eventStatus: EventStatusType;
  eventKeywords: [string];
  location: string;
  ticketSupply: {
    general: number;
    vip: number;
    reservedSeat: number;
    total: number;
  };
  organizerId: string;
  subEventId: string;
  superEventId: string;
  description: string;
  identifier: string;
  image: string;
  name: string;
  url: string;
  doorTime: Date;
  startDate: Date;
  endDate: Date;
  ticketType: TicketType;
  ownerAddress: string;
  smartContractAddress: string;
  ticketsMetadata: TicketsMetadata;
}
