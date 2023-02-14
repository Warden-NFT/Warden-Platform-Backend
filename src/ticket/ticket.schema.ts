import mongoose from 'mongoose';

export const TicketSetSchema = new mongoose.Schema({
  tickets: [
    {
      _id: {
        type: String,
        required: false,
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
  subjectOf: {
    type: String,
    required: false,
  }, // Event ID
  currency: {
    type: String,
    required: true,
  },
  ticketPrice: {
    general: {
      type: {
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
      required: false,
    },
    vip: {
      type: {
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
      required: false,
    },
    reservedSeat: {
      type: {
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
      required: false,
    },
  },
  royaltyFee: {
    type: Number,
    required: true,
  },
  enableResale: Boolean,
});
