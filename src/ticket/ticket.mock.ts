import { Event } from 'src/event/interfaces/event.interface';
import { TicketCollection } from './interface/ticket.interface';

export const EventDB: Event[] = [
  {
    _id: '1',
    eventStatus: 'EVENT_STARTED',
    eventKeywords: [],
    location: null,
    online_url: 'http://localhost:4321',
    ticketSupply: {
      general: 2,
      vip: 1,
      reservedSeat: 0,
    },
    organizerId: '1',
    subEventId: '1',
    superEventId: '1',
    description: 'text',
    identifier: 'text',
    image: undefined,
    name: 'Event name',
    url: '',
    doorTime: new Date(),
    startDate: new Date(),
    endDate: new Date(),
    ticketType: 'GENERAL',
    ownerAddress: '0x111111',
    smartContractAddress: '0x123456',
    ticketCollectionId: '1',
  },
];
export const TicketDB: TicketCollection[] = [
  {
    _id: '1',
    tickets: {
      general: [
        {
          _id: '1',
          smartContractTicketId: 0x123456,
          dateIssued: new Date(),
          ticketNumber: 1,
          name: 'Name',
          description: 'Desc',
          ticketMetadata: [],
          ownerHistory: [],
          ticketType: 'GENERAL',
          price: {
            amount: 1,
            currency: 'ETH',
          },
          hasUsed: false,
        },
        {
          _id: '2',
          smartContractTicketId: 0x123456,
          dateIssued: new Date(),
          ticketNumber: 2,
          name: 'Name',
          description: 'Desc',
          ticketMetadata: [],
          ownerHistory: [],
          ticketType: 'GENERAL',
          price: {
            amount: 1,
            currency: 'ETH',
          },
          hasUsed: true,
        },
      ],
      vip: [],
      reservedSeat: [],
    },
    createdDate: '28-03-2023',
    ownerId: '1',
    ownerAddress: '0x111111',
    smartContractAddress: '0x123456',
    subjectOf: '1',
    ticketPrice: {
      general: {
        default: 1,
        min: 1,
        max: 1,
      },
      vip: {
        default: 1,
        min: 1,
        max: 1,
      },
    },
    royaltyFee: 6,
    enableResale: true,
    currency: 'ETH',
    ticketQuota: {
      general: 4,
      vip: 1,
    },
    generationMethod: 'complete',
    resaleTicketPurchasePermission: [],
  },
];
