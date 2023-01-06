import * as mongoose from 'mongoose';

export type EventStatusType = 'AdmissionStarted' | 'EventStarted' | 'EventEnded';

export class EventSchema extends mongoose.Schema {
  eventStatus: EventStatusType;
  keywords: string[];
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
