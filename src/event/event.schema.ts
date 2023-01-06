import * as mongoose from 'mongoose';

export type EventStatusType = 'AdmissionStarted' | 'EventStarted' | 'EventEnded';

export const EventSchema = new mongoose.Schema({
  eventStatus: String,
  keywords: [String],
  location: String,
  maximumAttendeeCapacity: Number,
  organizerId: String,
  subEventId: String,
  superEventId: String,
  description: String,
  identifier: String,
  image: String,
  name: String,
  url: String,
  doorTime: Date,
  startDate: Date,
  endDate: Date,
});
