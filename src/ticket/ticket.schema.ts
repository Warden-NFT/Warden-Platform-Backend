import mongoose, { Types } from 'mongoose';

export const TicketSetSchema = new mongoose.Schema({
  tickets: [
    {
      _id: {
        type: String,
        required: true,
      },
      dateIssued: {
        type: String,
        required: true,
      },
      ticketNumber: {
        type: Number,
        required: false,
      },
      name: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: false,
      },
      ticketMetadata: [
        {
          attributes: [{ value: String, trait_type: String }],
          description: String,
          image: String,
          name: String,
        },
      ],
      ownerAddress: String,
      ownerHistory: [String],
    },
  ],
  createdDate: {
    type: String,
    required: true,
  },
  ownerId: {
    type: String,
    required: true,
  },
  ownerAddress: {
    type: String,
    required: true,
  },
  smartContractAddress: {
    type: String,
    required: false,
  },
  subjectOf: String, // Event ID
  ticketPrice: {
    general: {
      default: {
        type: Number,
        required: false,
      },
      min: {
        type: Number,
        required: false,
      },
      max: {
        type: Number,
        required: false,
      },
    },
    vip: {
      default: {
        type: Number,
        required: false,
      },
      min: {
        type: Number,
        required: false,
      },
      max: {
        type: Number,
        required: false,
      },
    },
    reservedSeat: {
      default: {
        type: Number,
        required: false,
      },
      min: {
        type: Number,
        required: false,
      },
      max: {
        type: Number,
        required: false,
      },
    },
  },
  royaltyFee: {
    type: Number,
    required: true,
  },
});
