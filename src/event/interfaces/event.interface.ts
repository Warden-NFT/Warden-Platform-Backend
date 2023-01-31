import { Types } from 'mongoose';
import { TicketType } from 'src/ticket/ticket.interface';
import { PlaceType } from './location.interface';

export type EventStatusType = 'NOT_STARTED' | 'ADMISSION_STARTED' | 'EVENT_STARTED' | 'EVENT_ENDED';

export enum EVENT_STATUS_TYPE {
  NOT_STARTED = 'NOT_STARTED',
  ADMISSION_STARTED = 'ADMISSION_STARTED',
  EVENT_STARTED = 'EVENT_STARTED',
  EVENT_ENDED = 'EVENT_ENDED',
}

export type TicketsMetadata = {
  data: {
    attributes: { value: string; trait_type: string }[];
    description: string;
    image: string;
    name: string;
  }[];
};

export interface Event {
  _id?: Types.ObjectId | string;
  eventStatus: EventStatusType;
  eventKeywords: string[];
  location: PlaceType | null;
  online_url: string;
  ticketSupply: {
    general: number;
    vip: number;
    reservedSeat: number;
  };
  organizerId: string;
  subEventId: string;
  superEventId: string;
  description: string;
  identifier: string;
  image: File | string | undefined;
  name: string;
  url: string;
  doorTime: Date | null;
  startDate: Date | null;
  endDate: Date | null;
  ticketType: TicketType;
  ownerAddress: string;
  smartContractAddress: string;
  ticketsMetadata: TicketsMetadata;
}

export interface TicketSupply {
  general: number;
  vip: number;
  reservedSeat: number;
}
