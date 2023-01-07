import * as mongoose from 'mongoose';
import * as uniqueValidator from 'mongoose-unique-validator';

export type EventStatusType = 'NotStarted' | 'AdmissionStarted' | 'EventStarted' | 'EventEnded';

export const EventSchema = new mongoose.Schema({
  eventStatus: {
    type: String,
    required: true,
  },
  eventKeywords: {
    type: [String],
    required: false,
  },
  location: {
    type: String,
    required: false,
  },
  maximumAttendeeCapacity: {
    type: String,
    required: false,
  },
  organizerId: {
    type: String,
    required: true,
  },
  subEventId: {
    type: String,
    required: false,
  },
  superEventId: {
    type: String,
    required: false,
  },
  description: {
    type: String,
    required: false,
  },
  identifier: {
    type: String,
    required: false,
  },
  image: {
    type: String,
    required: false,
  },
  name: {
    type: String,
    required: true,
    unique: true,
  },
  url: {
    type: String,
    required: false,
  },
  doorTime: {
    type: Date,
    required: false,
  },
  startDate: {
    type: Date,
    required: false,
  },
  endDate: {
    type: Date,
    required: false,
  },
});

EventSchema.plugin(uniqueValidator);
