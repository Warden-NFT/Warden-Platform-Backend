import * as mongoose from 'mongoose';
import * as uniqueValidator from 'mongoose-unique-validator';

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
    type: {
      description: String,
      structured_formatting: {
        main_text: String,
        secondary_text: String,
        main_text_matched_substrings: {
          offset: Number,
          length: Number,
        },
      },
      place_id: String,
    },
    required: false,
  },
  online_url: {
    type: String,
    required: false,
  },
  ticketSupply: {
    type: {
      general: Number,
      vip: Number,
      reservedSeat: Number,
    },
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
    type: String,
    required: false,
  },
  startDate: {
    type: String,
    required: false,
  },
  endDate: {
    type: String,
    required: false,
  },
  ticketType: {
    type: String,
    required: true,
  },
  // Smart Contract owner
  ownerAddress: {
    type: String,
    required: false,
  },
  // The address that the smart contract is deployed to
  smartContractAddress: {
    type: String,
    required: false,
  },
  // MongoDB object ID of the ticket set
  ticketCollectionId: {
    type: String,
    required: false,
  },
});

EventSchema.plugin(uniqueValidator);
