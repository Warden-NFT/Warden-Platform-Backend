import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import mongoose, { Model } from 'mongoose';
import { UserService } from '../user/user.service';
import { EventService } from '../event/event.service';
import { StorageService } from '../storage/storage.service';
import { TicketCollection } from '../ticket/interface/ticket.interface';
import { Market } from './dto/market.dto';
import { MarketService } from './market.service';
import { TicketService } from '../ticket/ticket.service';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { MongoMemoryServer } from 'mongodb-memory-server';

describe('MarketService', () => {
  let mongoServer: MongoMemoryServer;

  let marketService: MarketService;
  let marketModel: Model<Market>;
  let eventModel: Model<Event>;
  let ticketCollectionModel: Model<TicketCollection>;

  const mockMarketDoc = {
    _id: '123456789',
    featuredEvents: ['eventId1'],
  };

  beforeEach(async () => {
    mongoServer = await MongoMemoryServer.create();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MarketService,
        EventService,
        UserService,
        StorageService,
        TicketService,
        AuthService,
        JwtService,
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
            findOne: jest.fn(),
            deleteMany: jest.fn(),
            save: jest.fn().mockResolvedValue(mockMarketDoc),
          },
        },
        {
          provide: getModelToken('TicketCollection'),
          useValue: {
            findById: jest.fn().mockReturnThis(),
          },
        },
        {
          provide: getModelToken('User'),
          useValue: {
            findById: jest.fn().mockReturnThis(),
          },
        },
        {
          provide: getModelToken('Customer'),
          useValue: {
            findById: jest.fn().mockReturnThis(),
          },
        },
        {
          provide: getModelToken('EventOrganizer'),
          useValue: {
            findById: jest.fn().mockReturnThis(),
          },
        },
      ],
    }).compile();

    marketService = module.get<MarketService>(MarketService);
    eventModel = module.get<Model<Event>>(getModelToken('Event'));
    marketModel = module.get<Model<Market>>(getModelToken('Market'));

    ticketCollectionModel = module.get<Model<TicketCollection>>(getModelToken('TicketCollection'));
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoose.connection.close();
    mongoServer.stop();
  });

  afterEach(async () => {
    jest.resetAllMocks();
  });

  beforeEach(async () => {
    await marketModel.deleteMany({});
  });

  it('should be defined', () => {
    expect(marketService).toBeDefined();
  });

  describe('setFeaturedEvents', () => {
    it('should update the featured events array if a market document exists', async () => {
      // Arrange
      const marketDocument = {
        featuredEvents: ['event1', 'event2'],
        save: jest.fn(),
      };
      jest.spyOn(marketModel, 'findOne').mockResolvedValue(marketDocument);

      // Act
      const result = await marketService.setFeaturedEvents(['event3']);

      // Assert
      expect(marketDocument.featuredEvents).toEqual(['event3']);
      expect(marketDocument.save).toHaveBeenCalled();
      expect(result).toBeUndefined();
    });
  });
});
