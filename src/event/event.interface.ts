export type EventStatusType = 'NotStarted' | 'AdmissionStarted' | 'EventStarted' | 'EventEnded';

export type TicketType = 'GENERAL' | 'VIP' | 'RESERVED_SEAT';

export type TicketsMetadata = { data: [{ attributes: string; description: string; image: string; name: string }] };

export interface Event {
  _id?: string;
  eventStatus: EventStatusType;
  eventKeywords: [string];
  location: string;
  maximumAttendeeCapacity: number;
  organizerId: string;
  subEventId: string;
  superEventId: string;
  description: string;
  identifier: string;
  image: File | string;
  name: string;
  url: string;
  doorTime: Date;
  startDate: Date;
  endDate: Date;
  ticketType: TicketType;
  owner: string;
  smartContractAddress: string;
  ticketsMetadata: TicketsMetadata;
}
