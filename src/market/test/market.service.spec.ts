import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import mongoose, { Model } from 'mongoose';
import { UserService } from '../../user/user.service';
import { EventService } from '../../event/event.service';
import { StorageService } from '../../storage/storage.service';
import { Ticket, TicketCollection } from '../../ticket/interface/ticket.interface';
import { Market } from '../dto/market.dto';
import { MarketService } from '../market.service';
import { TicketService } from '../../ticket/ticket.service';
import { AuthService } from '../../auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { mockEvents } from './mocks/event.mock';
import { ROLE } from '../../../common/roles';
import { eventTicketPreviewsMock } from './mocks/eventTicket.mock';
import { EventOrganizerUser } from 'src/user/user.interface';
import { marketTicketMock } from './mocks/marketTicket.mock';
import {
  ticketListingMock,
  ticketListingMockFromTicketId,
  ticketListingMockFromTicketIdWithoutSubjectOf,
} from './mocks/ticketListing.mock';

describe('MarketService', () => {
  let mongoServer: MongoMemoryServer;

  let marketService: MarketService;
  let eventService: EventService;
  let userService: UserService;
  let ticketService: TicketService;
  let marketModel: Model<Market>;
  let eventModel: Model<Event>;
  let ticketCollectionModel: Model<TicketCollection>;

  const mockMarketDoc = {
    _id: '123456789',
    featuredEvents: ['eventId1'],
  };

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = await mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  beforeEach(async () => {
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
            find: jest.fn().mockReturnThis(),
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
            findOne: jest.fn().mockReturnThis(),
          },
        },
        {
          provide: getModelToken('User'),
          useValue: {
            findById: jest.fn().mockReturnThis(),
            exec: jest.fn().mockReturnThis(),
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
        {
          provide: UserService,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: TicketService,
          useValue: {
            getTicketPreviews: jest.fn(),
            getTicketsOfEvent: jest.fn(),
            getTicketByID: jest.fn(),
          },
        },
      ],
    }).compile();

    marketService = module.get<MarketService>(MarketService);
    eventService = module.get<EventService>(EventService);
    userService = module.get<UserService>(UserService);
    ticketService = module.get<TicketService>(TicketService);
    eventService = module.get<EventService>(EventService);
    eventModel = module.get<Model<Event>>(getModelToken('Event'));
    marketModel = module.get<Model<Market>>(getModelToken('Market')) as any;

    ticketCollectionModel = module.get<Model<TicketCollection>>(getModelToken('TicketCollection'));
  });

  beforeEach(async () => {
    await marketModel.deleteMany({});
  });

  afterEach(async () => {
    jest.resetAllMocks();
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  }, 20000);

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

    it('should create the featured events array if a market document does not exist', async () => {
      // Act
      jest.spyOn(marketModel, 'findOne').mockResolvedValue(null);

      // Assert
      await expect(marketService.setFeaturedEvents(['event3'])).rejects.toThrowError(HttpException);
    });
  });

  describe('getFeaturedEvents', () => {
    it('should return an array of featured events', async () => {
      // Arrange
      const mockMarket = { featuredEvents: ['641ea50abfcfee2cfef14190'] };
      jest.spyOn(marketModel, 'findOne').mockResolvedValue(mockMarket);
      jest.spyOn(eventModel, 'find').mockResolvedValue(mockEvents);

      // Act
      const result = await marketService.getFeaturedEvents();

      // Assert
      expect(result).toEqual(mockEvents);
    });

    it('should return an empty array if no featured events are found', async () => {
      // Arrange
      jest.spyOn(marketModel, 'findOne').mockResolvedValue({ featuredEvents: [] });
      jest.spyOn(eventModel, 'find').mockResolvedValue([]);

      // Act
      const result = await marketService.getFeaturedEvents();

      // Assert
      expect(result).toEqual([]);
    });

    it('should throw an HttpException if an error occurs', async () => {
      // Arrange
      const errorMessage = 'Test error message';
      jest.spyOn(marketModel, 'findOne').mockRejectedValue(new Error(errorMessage));

      // Act and Assert
      await expect(marketService.getFeaturedEvents()).rejects.toThrowError(
        new HttpException(
          {
            statusCode: HttpStatus.NOT_IMPLEMENTED,
            message: errorMessage,
          },
          HttpStatus.NOT_IMPLEMENTED,
        ),
      );
    });
  });

  describe('searchEvents', () => {
    it('should call the event model with the correct search query', async () => {
      const searchTerm = 'test';
      const startDate = '2023-03-27T00:00:00.000Z';
      const endDate = '2023-03-28T00:00:00.000Z';
      const location = 'test';

      const searchQuery = {
        $or: [
          { name: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } },
          { eventKeywords: { $in: [searchTerm] } },
          { startDate: { $gte: startDate, $lte: endDate } },
          { endDate: { $gte: startDate, $lte: endDate } },
          { 'location.description': { $regex: location, $options: 'i' } },
        ],
      };

      const eventModelFindSpy = jest.spyOn(eventModel, 'find').mockReturnValue({
        // select: jest.fn().mockReturnValue(mockEvents),
        lean: jest.fn().mockReturnValueOnce({
          exec: jest.fn().mockResolvedValueOnce(mockEvents),
        }),
      } as any);

      await marketService.searchEvents({
        searchTerm,
        startDate,
        endDate,
        location,
      });

      expect(eventModelFindSpy).toHaveBeenCalledWith(searchQuery);
    });

    it('should return the events sorted by score', async () => {
      const eventModelFindSpy = jest.spyOn(eventModel, 'find').mockReturnValue({
        // select: jest.fn().mockReturnValue(mockEvents),
        lean: jest.fn().mockReturnValueOnce({
          exec: jest.fn().mockResolvedValueOnce(mockEvents),
        }),
      } as any);

      const result = await marketService.searchEvents({});

      expect(eventModelFindSpy).toHaveBeenCalled();
      expect(result).toEqual([
        {
          ...mockEvents[0],
          score: 15, // expected score based on weightings
        },
      ]);
    });
  });

  describe('getMarketEvents', () => {
    it('should return market events when organizer ID is valid', async () => {
      // Arrange
      const organizerId = '640d8d27ed4becff87d7f300';
      const expectedOrganizationInfo = {
        _id: '640d8d27ed4becff87d7f300',
        organizationName: 'Dhanabordee Mekintharanggur',
        phoneNumber: '0971249955',
        email: 'pointmekin@gmail.com',
        username: '6238077121',
        password: '$2b$10$xRgKXMGHb0wJy3QoKwVr8uyb0cAyO08j5BwAckpIU1Kx3RMfWFDBi',
        accountType: 'EVENT_ORGANIZER',
        verificationStatus: 'Verified',
        profileImage:
          'https://storage.googleapis.com/nft-generator-microservice-bucket-test/profile/640d8d27ed4becff87d7f300/profileImage',
        __v: 0,
      };
      jest.spyOn(userService, 'findById').mockReturnValue(eventTicketPreviewsMock.organizerInfo as any);
      jest.spyOn(eventService, 'getEventFromEventOrganizer').mockReturnValue(eventTicketPreviewsMock.events as any);
      jest
        .spyOn(ticketService, 'getTicketPreviews')
        .mockReturnValue([
          eventTicketPreviewsMock.eventTicketPreviews[0].tickets.general[0],
          eventTicketPreviewsMock.eventTicketPreviews[1].tickets.general[0],
        ] as any);

      // Act
      const result = await marketService.getMarketEvents(organizerId);

      // Assert
      expect(result.organizerInfo._id).toEqual(expectedOrganizationInfo._id);
      expect(userService.findById).toHaveBeenCalledWith(organizerId);
      expect(eventService.getEventFromEventOrganizer).toHaveBeenCalledWith(organizerId, false);
      expect(ticketService.getTicketPreviews).toHaveBeenCalledWith('641e9d72f18f625b6a8bde72');
      expect(ticketService.getTicketPreviews).toHaveBeenCalledWith('641e9a04f18f625b6a8b9bcc');
    });

    it('should throw NotFoundException when organizer ID is invalid', async () => {
      // Arrange
      const organizerId = 'invalidOrganizerId';
      jest.spyOn(userService, 'findById').mockResolvedValueOnce(undefined);
      jest.spyOn(eventService, 'getEventFromEventOrganizer').mockResolvedValueOnce(undefined);
      jest.spyOn(ticketService, 'getTicketPreviews').mockResolvedValueOnce(undefined);

      // Act & Assert
      await expect(marketService.getMarketEvents(organizerId)).rejects.toThrowError(HttpException);
      expect(userService.findById).toHaveBeenCalledWith(organizerId);
      expect(eventService.getEventFromEventOrganizer).not.toHaveBeenCalled();
      expect(ticketService.getTicketPreviews).not.toHaveBeenCalled();
    });
  });

  describe('getMarketTickets', () => {
    it('should return market tickets with correct IDs, when the event organizer ID is valid', async () => {
      // Arrange
      const organizerId = '640d8d27ed4becff87d7f300';
      jest.spyOn(eventModel, 'findById').mockReturnValue(marketTicketMock.event as any);
      jest.spyOn(userService, 'findById').mockReturnValue(marketTicketMock.organizerInfo as any);
      jest.spyOn(ticketService, 'getTicketsOfEvent').mockReturnValue(marketTicketMock.ticketCollection as any);

      // Act
      const result = await marketService.getMarketTickets(organizerId);

      // Assert
      expect(result.organizerInfo._id).toEqual(organizerId);
    });

    it('should throw NotFoundException when organizer ID is invalid', async () => {
      // Arrange
      const organizerId = 'invalidOrganizerId';
      jest.spyOn(eventModel, 'findById').mockResolvedValueOnce(undefined);
      jest.spyOn(userService, 'findById').mockResolvedValueOnce(undefined);
      jest.spyOn(ticketService, 'getTicketPreviews').mockResolvedValueOnce(undefined);

      // Act & Assert
      await expect(marketService.getMarketTickets(organizerId)).rejects.toThrowError(HttpException);
      expect(eventModel.findById).toHaveBeenCalledWith(organizerId);
      expect(userService.findById).not.toHaveBeenCalled();
      expect(ticketService.getTicketPreviews).not.toHaveBeenCalled();
    });
  });

  describe('getOwnedTicketsFromEventId', () => {
    it('should return marketTicket from the given ID that is owned by the given walletAddress', async () => {
      // Arrange
      const eventId = '64104b2f1ba3a237dd0e5163';
      const walletAddress = '0x45Fb4CcBC9975b07b96d91047ddd06c38E0e8878';

      jest.spyOn(marketService, 'getMarketTickets').mockReturnValue(marketTicketMock as any);

      // Act
      const result = await marketService.getOwnedTicketsFromEventId(eventId, walletAddress);

      // Assert
      result.ticketCollection.tickets.general.forEach((ticket: Ticket) => {
        expect(ticket.ownerHistory.at(-1)).toEqual(walletAddress);
      });
    });

    it('should throw HttpException when organizer ID is invalid', async () => {
      // Arrange
      const eventId = 'invalidEventId';
      const walletAddress = '0x45Fb4CcBC9975b07b96d91047ddd06c38E0e8878';

      jest.spyOn(eventModel, 'findById').mockResolvedValueOnce(undefined);
      jest.spyOn(userService, 'findById').mockResolvedValueOnce(undefined);
      jest.spyOn(ticketService, 'getTicketPreviews').mockResolvedValueOnce(undefined);

      // Act & Assert
      await expect(marketService.getOwnedTicketsFromEventId(eventId, walletAddress)).rejects.toThrowError(
        HttpException,
      );
      expect(userService.findById).not.toHaveBeenCalled();
      expect(ticketService.getTicketPreviews).not.toHaveBeenCalled();
    });

    it('should throw HttpException when wallet Address is invalid', async () => {
      // Arrange
      const eventId = '64104b2f1ba3a237dd0e5163';
      const walletAddress = 'invalid address';

      jest.spyOn(eventModel, 'findById').mockResolvedValueOnce(undefined);
      jest.spyOn(userService, 'findById').mockResolvedValueOnce(undefined);
      jest.spyOn(ticketService, 'getTicketPreviews').mockResolvedValueOnce(undefined);

      // Act & Assert
      await expect(marketService.getOwnedTicketsFromEventId(eventId, walletAddress)).rejects.toThrowError(
        HttpException,
      );
      expect(userService.findById).not.toHaveBeenCalled();
      expect(ticketService.getTicketPreviews).not.toHaveBeenCalled();
    });
  });

  describe('getTicketListingDetails', () => {
    it('should return ticketListingDetails correctly based on the eventId, ticketCollectionId, and ticketId provided', async () => {
      // Arrange
      const eventId = '64104b2f1ba3a237dd0e5163';
      const ticketCollectionId = '64104bbf1ba3a237dd0e51d1';
      const ticketId = '64104bbf1ba3a237dd0e51d2';

      jest.spyOn(eventService, 'getEvent').mockResolvedValueOnce(ticketListingMock.event as any);
      jest.spyOn(userService, 'findById').mockResolvedValueOnce(ticketListingMock.organizerInfo as any);
      jest.spyOn(ticketService, 'getTicketByID').mockResolvedValueOnce(ticketListingMock.ticket as any);

      // Act
      const result = await marketService.getTicketListingDetails(eventId, ticketCollectionId, ticketId);

      // Assert
      expect(eventService.getEvent).toHaveBeenCalledWith(eventId);
      expect(userService.findById).toHaveBeenCalled();
      expect(ticketService.getTicketByID).toHaveBeenCalledWith(eventId, ticketId);
      expect(result.event.organizerId).toEqual(result.organizerInfo._id);
      expect(result.ticket._id).toEqual(ticketId);
    });

    it('should return throw HttpException given invalid eventId', async () => {
      // Arrange
      const eventId = 'invalidId';
      const ticketCollectionId = '64104bbf1ba3a237dd0e51d1';
      const ticketId = '64104bbf1ba3a237dd0e51d2';

      // Act and Assert
      await expect(marketService.getTicketListingDetails(eventId, ticketCollectionId, ticketId)).rejects.toThrowError(
        HttpException,
      );
    });

    it('should return throw HttpException given invalid ticketCollectionId', async () => {
      // Arrange
      const eventId = '64104b2f1ba3a237dd0e5163';
      const ticketCollectionId = 'invalidId';
      const ticketId = '64104bbf1ba3a237dd0e51d2';

      // Act and Assert
      await expect(marketService.getTicketListingDetails(eventId, ticketCollectionId, ticketId)).rejects.toThrowError(
        HttpException,
      );
    });

    it('should return throw HttpException given invalid ticketId', async () => {
      // Arrange
      const eventId = '64104b2f1ba3a237dd0e5163';
      const ticketCollectionId = '64104bbf1ba3a237dd0e51d1';
      const ticketId = 'invalidId';

      // Act and Assert
      await expect(marketService.getTicketListingDetails(eventId, ticketCollectionId, ticketId)).rejects.toThrowError(
        HttpException,
      );
    });
  });

  describe('getTicketListingDetailsFromTicketId', () => {
    it('should return ticketListingDetails correctly based on the ticketId provided', async () => {
      // Arrange
      const ticketId = '64104bbf1ba3a237dd0e51d2';

      jest.spyOn(ticketCollectionModel, 'findOne').mockResolvedValueOnce(marketTicketMock.ticketCollection as any);
      jest.spyOn(eventService, 'getEvent').mockResolvedValueOnce(ticketListingMock.event as any);
      jest.spyOn(userService, 'findById').mockResolvedValueOnce(ticketListingMock.organizerInfo as any);
      jest.spyOn(ticketService, 'getTicketByID').mockResolvedValueOnce(ticketListingMock.ticket as any);

      // Act
      const result = await marketService.getTicketListingDetailsFromTicketId(ticketId);

      // Assert
      expect(eventService.getEvent).toHaveBeenCalledWith(ticketListingMockFromTicketId.event._id);
      expect(userService.findById).toHaveBeenCalled();
      expect(ticketService.getTicketByID).toHaveBeenCalledWith(ticketListingMockFromTicketId.event._id, ticketId);
      expect(result.event.organizerId).toEqual(result.organizerInfo._id);
      expect(result.ticket._id).toEqual(ticketId);
    });

    it('should throw HttpException given invalid ticketId', async () => {
      // Arrange
      const ticketId = 'invalidId';

      jest.spyOn(ticketCollectionModel, 'findOne').mockResolvedValueOnce(undefined);
      jest.spyOn(eventService, 'getEvent').mockResolvedValueOnce(ticketListingMock.event as any);
      jest.spyOn(userService, 'findById').mockResolvedValueOnce(ticketListingMock.organizerInfo as any);
      jest.spyOn(ticketService, 'getTicketByID').mockResolvedValueOnce(ticketListingMock.ticket as any);

      // Act & Assert
      await expect(marketService.getTicketListingDetailsFromTicketId(ticketId)).rejects.toThrowError(NotFoundException);
    });

    it('should throw HttpException when the event found does not contain the subjectOf field', async () => {
      // Arrange
      const ticketId = 'invalidId';

      jest.spyOn(ticketCollectionModel, 'findOne').mockResolvedValueOnce(ticketListingMockFromTicketIdWithoutSubjectOf);
      jest.spyOn(eventService, 'getEvent').mockResolvedValueOnce(undefined);
      jest.spyOn(userService, 'findById').mockResolvedValueOnce(ticketListingMock.organizerInfo as any);
      jest.spyOn(ticketService, 'getTicketByID').mockResolvedValueOnce(undefined);

      // Act & Assert
      await expect(marketService.getTicketListingDetailsFromTicketId(ticketId)).rejects.toThrowError(NotFoundException);
    });

    it('should throw HttpException given the ticket is not found', async () => {
      // Arrange
      const ticketId = 'invalidId';

      jest.spyOn(ticketCollectionModel, 'findOne').mockResolvedValueOnce(ticketListingMockFromTicketIdWithoutSubjectOf);
      jest.spyOn(eventService, 'getEvent').mockResolvedValueOnce(ticketListingMock.event as any);
      jest.spyOn(userService, 'findById').mockResolvedValueOnce(ticketListingMock.organizerInfo as any);
      jest.spyOn(ticketService, 'getTicketByID').mockResolvedValueOnce(undefined);

      // Act & Assert
      await expect(marketService.getTicketListingDetailsFromTicketId(ticketId)).rejects.toThrowError(NotFoundException);
    });

    it('should throw HttpException given the event organizer is not found', async () => {
      // Arrange
      const ticketId = 'invalidId';

      jest.spyOn(ticketCollectionModel, 'findOne').mockResolvedValueOnce(ticketListingMockFromTicketIdWithoutSubjectOf);
      jest.spyOn(eventService, 'getEvent').mockResolvedValueOnce(ticketListingMock.event as any);
      jest.spyOn(userService, 'findById').mockResolvedValueOnce(undefined);
      jest.spyOn(ticketService, 'getTicketByID').mockResolvedValueOnce(ticketListingMock.ticket as any);

      // Act & Assert
      await expect(marketService.getTicketListingDetailsFromTicketId(ticketId)).rejects.toThrowError(NotFoundException);
    });
  });
});
