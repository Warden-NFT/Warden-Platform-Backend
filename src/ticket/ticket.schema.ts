import mongoose from 'mongoose';

export const TicketSchema = new mongoose.Schema({
  smartContractTicketId: {
    type: Number,
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
  ownerAddress: {
    type: String,
    reqired: false,
  },
  ownerHistory: {
    type: [String],
    required: true,
  },
  ticketType: {
    type: String,
    required: true,
  },
  price: {
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
    },
  },
  benefits: {
    type: String,
    required: false,
  },
  hasUsed: {
    type: Boolean,
    required: true,
  },
  eventId: {
    type: String,
    required: false,
  },
  startDate: {
    type: Date,
    required: false,
  },
});

export const TicketCollectionSchema = new mongoose.Schema({
  tickets: {
    general: [TicketSchema],
    vip: [TicketSchema],
    reservedSeat: [TicketSchema],
  },
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
  enableResale: {
    type: Boolean,
    required: true,
  },
  ticketQuota: {
    type: {
      general: {
        type: Number,
        required: false,
      },
      vip: {
        type: Number,
        required: false,
      },
      reservedSeat: {
        type: Number,
        required: false,
      },
    },
    required: false,
  },
  generationMethod: {
    type: String,
    required: true,
  },
  resaleTicketPurchasePermission: [
    {
      address: {
        type: String,
        required: true,
      },
      ticketCollectionId: {
        type: String,
        required: true,
      },
      ticketId: {
        type: String,
        required: true,
      },
      smartContractTicketId: {
        type: Number,
        required: true,
      },
      approved: {
        type: Boolean,
        required: false,
      },
    },
  ],
});
