import { HttpException } from '@nestjs/common';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import mongoose, { Model } from 'mongoose';
import { UserService } from '../../user/user.service';
import { EventService } from '../../event/event.service';
import { StorageService } from '../../storage/storage.service';
import { TicketCollection } from '../interface/ticket.interface';
import { TicketService } from '../ticket.service';
import { AuthService } from '../../auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { ticketCollectionMock } from './mock/ticketCollection.mock';
import { TicketCollectionSchema } from '../ticket.schema';
import { EventSchema } from '../../event/event.schema';
import { MongoMemoryServer } from 'mongodb-memory-server';

describe('TicketService', () => {
  let mongoServer: MongoMemoryServer;
  let ticketService: TicketService;
  let storageService: StorageService;
  let userService: UserService;
  let eventService: EventService;
  let ticketCollectionModel: Model<TicketCollection>;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = await mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      // imports: [
      //   MongooseModule.forFeature([
      //     { name: 'TicketCollection', schema: TicketCollectionSchema, collection: 'tickets' },
      //     { name: 'Event', schema: EventSchema, collection: 'events' },
      //   ]),
      // ],
      providers: [
        TicketService,
        StorageService,
        EventService,
        UserService,
        AuthService,
        JwtService,
        {
          provide: getModelToken('TicketCollection'),
          useValue: {
            find: jest.fn(),
            exec: jest.fn(),
            create: jest.fn(),
            validate: jest.fn(),
            save: jest.fn(),
            prototype: {
              save: jest.fn(),
            },
          },
        },
        {
          provide: getModelToken('Event'),
          useValue: {
            find: jest.fn(),
            exec: jest.fn(),
          },
        },
        {
          provide: getModelToken('User'),
          useValue: {
            find: jest.fn(),
            exec: jest.fn(),
          },
        },
        {
          provide: getModelToken('EventOrganizer'),
          useValue: {
            find: jest.fn(),
            exec: jest.fn(),
          },
        },
        {
          provide: getModelToken('Customer'),
          useValue: {
            find: jest.fn(),
            exec: jest.fn(),
          },
        },
        {
          provide: EventService,
          useValue: {
            getEvent: jest.fn(),
            updateEvent: jest.fn(),
          },
        },
        {
          provide: TicketService,
          useValue: {
            getEvent: jest.fn(),
            updateEvent: jest.fn(),
            getTicketsOfUser: jest.fn().mockReturnThis(),
          },
        },
      ],
    }).compile();

    ticketService = module.get<TicketService>(TicketService);
    ticketCollectionModel = module.get<Model<TicketCollection>>(getModelToken('TicketCollection'));

    eventService = module.get<EventService>(EventService);
    userService = module.get<UserService>(UserService);
    eventService = module.get<EventService>(EventService);
  });

  afterEach(async () => {
    jest.resetAllMocks();
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  }, 20000);

  describe('createTicketCollection', () => {
    const ticketCollectionDTO = ticketCollectionMock as any;

    const subjectOf = 'subjectOf_id';
    const eventOrganizerId = 'eventOrganizer_id';
    const existingEvent = { id: subjectOf, ticketCollectionId: 'existing_ticket_collection_id' };
    const newTicketCollection = { id: 'new_ticket_collection_id', subjectOf };
    const savedEvent = { ...existingEvent, ticketCollectionId: newTicketCollection.id };
    const savedTicketCollection = { ...newTicketCollection };

    beforeEach(() => {
      jest.spyOn(ticketCollectionModel, 'create').mockReturnValue(newTicketCollection as any);
      // jest.spyOn(ticketCollectionModel.prototype, 'validate').mockResolvedValue(undefined);
      jest.spyOn(ticketCollectionModel.prototype, 'save').mockResolvedValue(savedTicketCollection);
      jest.spyOn(eventService, 'getEvent').mockResolvedValue(existingEvent as any);
      jest.spyOn(eventService, 'updateEvent').mockResolvedValue(savedEvent as any);
    });

    it('should create a new ticket collection and return it', async () => {
      const result = await ticketService.createTicketCollection(ticketCollectionDTO, eventOrganizerId);
      expect(ticketCollectionModel.create).toHaveBeenCalledWith(ticketCollectionDTO);
      expect(ticketCollectionModel.prototype.validate).toHaveBeenCalled();
      expect(ticketCollectionModel.prototype.save).toHaveBeenCalled();
      expect(eventService.getEvent).toHaveBeenCalledWith(subjectOf);
      expect(eventService.updateEvent).toHaveBeenCalledWith(
        { ...existingEvent, ticketCollectionId: newTicketCollection.id },
        eventOrganizerId,
      );
      expect(result).toEqual(savedTicketCollection);
    });

    it('should throw an error if validation fails', async () => {
      const validationError = new Error('Validation error');
      jest.spyOn(ticketCollectionModel.prototype, 'validate').mockRejectedValue(validationError);
      await expect(ticketService.createTicketCollection(ticketCollectionDTO, eventOrganizerId)).rejects.toThrowError(
        HttpException,
      );
      expect(ticketCollectionModel.create).toHaveBeenCalledWith(ticketCollectionDTO);
      expect(ticketCollectionModel.prototype.validate).toHaveBeenCalled();
      expect(ticketCollectionModel.prototype.save).not.toHaveBeenCalled();
      expect(eventService.getEvent).not.toHaveBeenCalled();
      expect(eventService.updateEvent).not.toHaveBeenCalled();
    });
  });

  describe('getTicketsOfUser', () => {
    it('should return an array of tickets and ticket listings that belong to the user', async () => {
      const walletAddress = '0x123456';
      const ticketCollection = {
        tickets: {
          general: [
            {
              ownerHistory: ['0x111111', '0x222222', '0x123456'],
            },
            {
              ownerHistory: ['0x222222', '0x123456', '0x444444'],
            },
          ],
          vip: [
            {
              ownerHistory: ['0x555555', '0x123456', '0x555555'],
            },
          ],
          reservedSeat: [
            {
              ownerHistory: ['0x777777', '0x888888', '0x123456'],
            },
          ],
        },
      };
      const ticketCollections = [ticketCollection];
      jest.spyOn(ticketCollectionModel, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValue(ticketCollections),
      } as any);

      const result = await ticketService.getTicketsOfUser(walletAddress);
      const expectedMyTickets = [ticketCollection.tickets.general[0], ticketCollection.tickets.reservedSeat[0]];
      const expectedMyTicketListing = [ticketCollection.tickets.vip[0]];

      expect(result.myTickets).toEqual(expectedMyTickets);
      expect(result.myTicketListing).toEqual(expectedMyTicketListing);
    });

    it('should throw an error if an error occurs while trying to retrieve the tickets', async () => {
      const walletAddress = '0x123456';
      jest.spyOn(ticketCollectionModel, 'find').mockImplementation(() => {
        throw new Error();
      });

      await expect(ticketService.getTicketsOfUser(walletAddress)).rejects.toThrow(HttpException);
    });
  });
});
