import { EventStatusType } from './event.schema';

export interface Event {
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
}
