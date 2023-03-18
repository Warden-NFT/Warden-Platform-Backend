import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { StorageService } from '../storage/storage.service';
import { TicketCollection } from '../ticket/interface/ticket.interface';
import { Market } from './dto/market.dto';
import { MarketService } from './market.service';

describe('MarketService', () => {
  let service: MarketService;
  let eventModel: Model<Event>;
  let marketModel: Model<Market>;
  let ticketCollectionModel: Model<TicketCollection>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MarketService,
        StorageService,
        {
          provide: getModelToken('Event'),
          useValue: {
            findById: jest.fn().mockReturnThis(),
          },
        },
        {
          provide: getModelToken('Market'),
          useValue: {
            findById: jest.fn().mockReturnThis(),
          },
        },
        // {
        //   provide: getModelToken('TicketCollection'),
        //   useValue: {
        //     findById: jest.fn().mockReturnThis(),
        //   },
        // },
      ],
    }).compile();

    service = module.get<MarketService>(MarketService);
    eventModel = module.get<Model<Event>>(getModelToken('Event'));
    marketModel = module.get<Model<Market>>(getModelToken('Market'));
    ticketCollectionModel = module.get<Model<TicketCollection>>(getModelToken('TicketCollection'));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
