import { HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import mongoose, { Model } from 'mongoose';
import { UserService } from '../../user/user.service';
import { EventService } from '../../event/event.service';
import { StorageService } from '../../storage/storage.service';
import { TicketCollection } from '../interface/ticket.interface';
import { TicketService } from '../ticket.service';
import { AuthService } from '../../auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { ticketCollectionMock } from './mock/ticketCollection.mock';

describe('TicketService', () => {
  let mongoServer: MongoMemoryServer;
  let ticketService: TicketService;
  let eventService: EventService;
  let ticketCollectionModel: Model<TicketCollection>;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = await mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterEach(async () => {
    jest.resetAllMocks();
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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
            create: jest.fn().mockReturnThis(),
            new: jest.fn().mockResolvedValue({ save: jest.fn() }),
            prototype: {
              save: jest.fn().mockReturnThis(),
              validate: jest.fn().mockReturnThis(),
            },
            validate: jest.fn().mockReturnThis(),
            save: jest.fn().mockResolvedValue({
              _id: 'test_id',
              ...ticketCollectionMock,
            }),
            findById: jest.fn().mockReturnThis(),
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
      ],
    }).compile();

    ticketService = module.get<TicketService>(TicketService);
    eventService = module.get<EventService>(EventService);

    ticketCollectionModel = module.get<Model<TicketCollection>>(getModelToken('TicketCollection'));
  });

  // Can't test await new this.ticketCollectionModel(ticketCollection).validate();
  xdescribe('createTicketCollection', () => {
    const ticketCollectionDTO = ticketCollectionMock as any;

    const subjectOf = 'subjectOf_id';
    const eventOrganizerId = 'eventOrganizer_id';
    const existingEvent = { id: subjectOf, ticketCollectionId: 'existing_ticket_collection_id' };
    const newTicketCollection = { id: 'new_ticket_collection_id', subjectOf };
    const savedEvent = { ...existingEvent, ticketCollectionId: newTicketCollection.id };
    const savedTicketCollection = { ...newTicketCollection };

    beforeEach(() => {
      jest.spyOn(ticketCollectionModel, 'create').mockReturnValue(newTicketCollection as any);
      jest.spyOn(ticketCollectionModel.prototype, 'validate').mockResolvedValue(undefined);
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
  });

  describe('getTicketCollectionByID', () => {
    it('should return a ticket collection', async () => {
      // Arrange
      const ticketCollectionId = 'mock-id';
      const ticketCollection = { _id: ticketCollectionId, name: 'mock-ticket-collection' };
      jest.spyOn(ticketCollectionModel, 'findById').mockResolvedValue(ticketCollection);

      // Act
      const result = await ticketService.getTicketCollectionByID(ticketCollectionId);

      // Assert
      expect(ticketCollectionModel.findById).toHaveBeenCalledWith(ticketCollectionId);
      expect(result).toEqual(ticketCollection);
    });

    it('should throw NotFoundException if ticket collection is not found', async () => {
      // Arrange
      const ticketCollectionId = 'non-existent-id';
      jest.spyOn(ticketCollectionModel, 'findById').mockResolvedValue(null);

      // Act & Assert
      await expect(ticketService.getTicketCollectionByID(ticketCollectionId)).rejects.toThrowError(
        new NotFoundException(`Ticket set #${ticketCollectionId} not found`),
      );
      expect(ticketCollectionModel.findById).toHaveBeenCalledWith(ticketCollectionId);
    });

    it('should throw HttpException if an error occurs', async () => {
      // Arrange
      const ticketCollectionId = 'mock-id';
      const error = new Error('Some error');
      jest.spyOn(ticketCollectionModel, 'findById').mockRejectedValue(error);

      // Act & Assert
      await expect(ticketService.getTicketCollectionByID(ticketCollectionId)).rejects.toThrowError(
        new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: error.message,
          },
          HttpStatus.BAD_REQUEST,
        ),
      );
      expect(ticketCollectionModel.findById).toHaveBeenCalledWith(ticketCollectionId);
    });
  });

  describe('getTicketByID', () => {
    it('should return a ticket', async () => {
      // Arrange
      const eventId = 'mock-event-id';
      const ticketCollectionId = 'mock-ticket-collection-id';
      const ticketId = 'mock-ticket-id';
      const ticketCollection = {
        _id: ticketCollectionId,
        tickets: {
          standard: [{ _id: ticketId, name: 'Mock Ticket' }],
        },
      };
      const event = { _id: eventId, ticketCollectionId };
      jest.spyOn(eventService, 'getEvent').mockResolvedValue(event as any);
      jest.spyOn(ticketCollectionModel, 'findById').mockResolvedValue(ticketCollection);

      // Act
      const result = await ticketService.getTicketByID(eventId, ticketId);

      // Assert
      expect(eventService.getEvent).toHaveBeenCalledWith(eventId);
      expect(ticketCollectionModel.findById).toHaveBeenCalledWith(ticketCollectionId);
      expect(result._id).toEqual(ticketId);
    });

    it('should throw NotFoundException if event is not found', async () => {
      // Arrange
      const eventId = 'non-existent-id';
      const ticketId = 'mock-ticket-id';
      jest.spyOn(eventService, 'getEvent').mockResolvedValue(null);

      // Act & Assert
      await expect(ticketService.getTicketByID(eventId, ticketId)).rejects.toThrowError(
        new NotFoundException(`Event with _id: ${eventId} cannot be found`),
      );
      expect(eventService.getEvent).toHaveBeenCalledWith(eventId);
    });

    it('should throw NotFoundException if ticket collection is not found', async () => {
      // Arrange
      const eventId = 'mock-event-id';
      const ticketId = 'mock-ticket-id';
      const event = { _id: eventId, ticketCollectionId: 'non-existent-id' };
      jest.spyOn(eventService, 'getEvent').mockResolvedValue(event as any);
      jest.spyOn(ticketCollectionModel, 'findById').mockResolvedValue(null);

      // Act & Assert
      await expect(ticketService.getTicketByID(eventId, ticketId)).rejects.toThrowError(
        new NotFoundException(`Ticket #${event.ticketCollectionId} not found`),
      );
      expect(eventService.getEvent).toHaveBeenCalledWith(eventId);
      expect(ticketCollectionModel.findById).toHaveBeenCalledWith(event.ticketCollectionId);
    });

    it('should throw NotFoundException if ticket is not found', async () => {
      // Arrange
      const eventId = 'mock-event-id';
      const ticketCollectionId = 'mock-ticket-collection-id';
      const ticketId = 'non-existent-id';
      const ticketCollection = {
        _id: ticketCollectionId,
        tickets: {
          standard: [{ _id: 'some-other-id', name: 'Mock Ticket' }],
        },
      };
      const event = { _id: eventId, ticketCollectionId };
      jest.spyOn(eventService, 'getEvent').mockResolvedValue(event as any);
      jest.spyOn(ticketCollectionModel, 'findById').mockResolvedValue(ticketCollection);

      // Act & Assert
      await expect(ticketService.getTicketByID(eventId, ticketId)).rejects.toThrowError(
        new NotFoundException(`Ticket #${ticketId} not found`),
      );
      expect(eventService.getEvent).toHaveBeenCalledWith(eventId);
      expect(ticketCollectionModel.findById).toHaveBeenCalledWith(ticketCollectionId);
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
