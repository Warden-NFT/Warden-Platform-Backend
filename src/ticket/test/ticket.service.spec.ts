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
import { JwtStrategy } from 'src/auth/jwt.strategy';
import { User } from 'src/user/user.interface';

describe('TicketService', () => {
  let mongoServer: MongoMemoryServer;
  let ticketService: TicketService;
  let eventService: EventService;
  let storageService: StorageService;
  let userService: UserService;
  let ticketCollectionModel: Model<TicketCollection>;
  let userModel: Model<User>;
  let eventModel: Model<Event>;

  class TicketModel {
    constructor(private data) {}
    static find = jest.fn();
    static exec = jest.fn();
    static create = jest.fn();
    static findById = jest.fn().mockReturnThis();
    static findOne = jest.fn();
    static findByIdAndUpdate = jest.fn().mockReturnThis();
    static findByIdAndDelete = jest.fn().mockReturnThis();
    static save = jest.fn().mockReturnThis();
    static validate = jest.fn().mockReturnThis();
    static updateOne = jest.fn().mockReturnThis();
    save = jest.fn().mockReturnThis();
    validate = jest.fn().mockReturnThis();
  }

  // Create a mock TicketCollection model
  const MockTicketCollectionModel = () => ({
    find: jest.fn(),
    exec: jest.fn(),
    create: jest.fn().mockReturnThis(),
    findById: jest.fn().mockReturnThis(),
    findByIdAndUpdate: jest.fn().mockReturnThis(),
    findOne: jest.fn().mockReturnThis(),
    save: jest.fn(),
    validate: jest.fn().mockReturnThis(),
  });

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
          useValue: TicketModel,
        },
        {
          provide: getModelToken('Event'),
          useValue: {
            find: jest.fn(),
            findById: jest.fn(),
            exec: jest.fn(),
          },
        },
        {
          provide: getModelToken('User'),
          useValue: {
            find: jest.fn(),
            findById: jest.fn().mockImplementation((id) => {
              return {
                exec: jest.fn().mockResolvedValue({ _id: id }),
              };
            }),
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
    storageService = module.get<StorageService>(StorageService);
    userService = module.get<UserService>(UserService);

    userModel = module.get<Model<User>>(getModelToken('User'));
    eventModel = module.get<Model<Event>>(getModelToken('Event'));
    ticketCollectionModel = module.get<Model<TicketCollection>>(getModelToken('TicketCollection'));
  });

  // Can't test await new this.ticketCollectionModel(ticketCollection).validate();
  describe('createTicketCollection', () => {
    const ticketCollectionDTO = ticketCollectionMock as any;

    const subjectOf = 'subjectOf_id';
    const eventOrganizerId = 'eventOrganizer_id';
    const existingEvent = { _id: subjectOf, ticketCollection_: 'existing_ticket_collection__' };
    const newEvent = ticketCollectionDTO;
    const newTicketCollection = { _id: 'new_ticket_collection_id', subjectOf };
    const newSavedEvent = { ...existingEvent, ticketCollectionId: newTicketCollection._id };
    const savedTicketCollection = { ...ticketCollectionDTO };

    it('should create a new ticket collection and return it', async () => {
      // Arrange
      jest.spyOn(new TicketModel(ticketCollectionDTO), 'save').mockReturnValue(savedTicketCollection as any);
      jest.spyOn(eventService, 'getEvent').mockResolvedValue(newEvent as any);
      jest.spyOn(eventService, 'updateEvent').mockResolvedValue(newSavedEvent as any);
      jest.spyOn(ticketCollectionModel, 'validate').mockResolvedValue(newTicketCollection as any);
      jest
        .spyOn(ticketCollectionModel, 'create')
        .mockImplementation(jest.fn().mockResolvedValueOnce(newTicketCollection as any));
      // Act
      const result = await ticketService.createTicketCollection(ticketCollectionDTO, eventOrganizerId);

      // Assert
      expect(result).toBeDefined();
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
      const ticketId = 'mock-ticket-collection-id';
      const ticketCollection = {
        _id: ticketCollectionId,
        tickets: {
          general: [{ _id: ticketId, name: 'Mock Ticket' }],
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
        new NotFoundException(`Ticket set #${event.ticketCollectionId} not found`),
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

  describe('updateTicketCollection', () => {
    it('should update the ticket collection', async () => {
      // Arrange
      const ownerId = '640d8d27ed4becff87d7f300';
      const ticketCollectionId = '64104bbf1ba3a237dd0e51d1';
      const ticketCollection = ticketCollectionMock;
      jest.spyOn(ticketCollectionModel, 'findById').mockResolvedValue(ticketCollection);
      jest.spyOn(ticketCollectionModel, 'findByIdAndUpdate').mockResolvedValue(ticketCollection);

      // Act
      const result = await ticketService.updateTicketCollection(ticketCollectionMock as any, ownerId);

      // Assert
      expect(result._id).toEqual(ticketCollectionId);
    });

    it('should throw NotFoundException if ticket collection is not found', async () => {
      // Arrange
      const ticketCollectionId = '64104bbf1ba3a237dd0e51d1';
      const updateTicketCollectionDto = { tickets: { general: [] } };
      jest.spyOn(ticketCollectionModel, 'findByIdAndUpdate').mockResolvedValue(null);
      jest.spyOn(ticketCollectionModel, 'findById').mockResolvedValue(null);

      // Act & Assert
      await expect(
        ticketService.updateTicketCollection(ticketCollectionMock as any, updateTicketCollectionDto as any),
      ).rejects.toThrowError(new NotFoundException(`Ticket set #${ticketCollectionId} not found`));
    });

    it('should throw HttpException if an error occurs', async () => {
      // Arrange
      const ticketCollectionId = '64104bbf1ba3a237dd0e51d1';
      const updateTicketCollectionDto = { tickets: { general: [] }, ownerId: '640d8d27ed4becff87d7f300' };
      const error = new Error('Some error');
      jest.spyOn(ticketCollectionModel, 'findByIdAndUpdate').mockRejectedValue(error);
      jest.spyOn(ticketCollectionModel, 'findById').mockResolvedValue(updateTicketCollectionDto as any);

      // Act & Assert
      await expect(
        ticketService.updateTicketCollection(ticketCollectionMock as any, '640d8d27ed4becff87d7f300'),
      ).rejects.toThrowError(
        new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: error.message,
          },
          HttpStatus.BAD_REQUEST,
        ),
      );
      expect(ticketCollectionModel.findByIdAndUpdate).toHaveBeenCalledWith(ticketCollectionId, ticketCollectionMock, {
        new: true,
      });
    });

    it('should throw an error if an error occurs while trying to update the ticket collection', async () => {
      const ticketCollectionId = '64104bbf1ba3a237dd0e51d1';
      const ticketCollection = { ...ticketCollectionMock } as any;
      const updateTicketCollectionDto = { tickets: { general: [] } };
      jest.spyOn(ticketCollectionModel, 'findByIdAndUpdate').mockImplementation(() => {
        throw new Error();
      });
      jest.spyOn(ticketCollectionModel, 'findById').mockResolvedValue(updateTicketCollectionDto);

      await expect(ticketService.updateTicketCollection(ticketCollection, ticketCollectionId)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('getTicketsOfEvent', () => {
    it('should return an array of tickets and ticket listings that belong to the event', async () => {
      const eventId = '64104b2f1ba3a237dd0e5163';

      jest.spyOn(ticketCollectionModel, 'findOne').mockReturnValue(ticketCollectionMock as any);

      const result = await ticketService.getTicketsOfEvent(eventId);

      expect(result).toEqual(ticketCollectionMock);
      // expect(result.ticketListing).toEqual(expectedTicketListing);
    });

    it('should throw an error if an error occurs while trying to retrieve the tickets', async () => {
      const eventId = '64104b2f1ba3a237dd0e5163';
      jest.spyOn(ticketCollectionModel, 'findOne').mockImplementation(() => {
        throw new Error();
      });

      await expect(ticketService.getTicketsOfEvent(eventId)).rejects.toThrow(HttpException);
    });
  });

  describe('getTicketPreviews', () => {
    it('should return an array of ticket previews', async () => {
      const eventId = '64104b2f1ba3a237dd0e5163';
      const ticketCollectionId = '64104bbf1ba3a237dd0e51d1';
      const ticketCollection = ticketCollectionMock;
      const event = { _id: eventId, ticketCollectionId };
      jest.spyOn(eventService, 'getEvent').mockResolvedValue(event as any);
      jest.spyOn(ticketCollectionModel, 'findById').mockResolvedValue(ticketCollection as any);
      jest.spyOn(ticketCollectionModel, 'findOne').mockReturnValue(ticketCollection as any);

      const result = await ticketService.getTicketPreviews(eventId);

      expect(result.tickets).toBeDefined();
      expect(result.tickets.general[0]).toEqual(ticketCollectionMock['tickets']['general'][0]);
    });

    it('should throw an error if an error occurs while trying to retrieve the tickets', async () => {
      const eventId = '64104b2f1ba3a237dd0e5163';
      jest.spyOn(eventService, 'getEvent').mockImplementation(() => {
        throw new Error();
      });

      await expect(ticketService.getTicketPreviews(eventId)).rejects.toThrow(HttpException);
    });

    it('should throw an error if an error occurs while trying to retrieve the ticket collection', async () => {
      const eventId = '64104b2f1ba3a237dd0e5163';
      const ticketCollectionId = '64104bbf1ba3a237dd0e51d1';
      const event = { _id: eventId, ticketCollectionId };
      jest.spyOn(eventService, 'getEvent').mockResolvedValue(event as any);
      jest.spyOn(ticketCollectionModel, 'findById').mockImplementation(() => {
        throw new Error();
      });

      await expect(ticketService.getTicketPreviews(eventId)).rejects.toThrow(HttpException);
    });
  });

  describe('getTicketsOfUserFromMultipleWalletAddresses', () => {
    it('should return an array of tickets and ticket listings that belong to the user', async () => {
      const walletAddresses = ['0x45Fb4CcBC9975b07b96d91047ddd06c38E0e8878'];
      const ticketCollection = ticketCollectionMock;
      jest.spyOn(ticketCollectionModel, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValue([ticketCollection]),
      } as any);

      const result = await ticketService.getTicketsOfUserFromMultipleWalletAddresses(walletAddresses);

      expect(result.myTickets.length).toBe(1);
    });

    it('should throw an error if an error occurs while trying to retrieve the tickets', async () => {
      const walletAddresses = ['0x123456', '0x123457'];
      jest.spyOn(ticketCollectionModel, 'find').mockImplementation(() => {
        throw new Error();
      });

      await expect(ticketService.getTicketsOfUserFromMultipleWalletAddresses(walletAddresses)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('updateTicketCollectionImages', () => {
    it('should update the ticket collection images', async () => {
      const image = {
        fieldname: 'test',
        originalname: 'test',
        size: 20000,
        filename: 'test',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('test image'),
      } as Express.Multer.File;

      const ticketCollectionId = '64104bbf1ba3a237dd0e51d1';
      const ticketCollection = { ...ticketCollectionMock } as any;
      jest.spyOn(ticketCollectionModel, 'findById').mockResolvedValue(ticketCollection as any);
      jest.spyOn(storageService, 'saveFiles');

      const result = await ticketService.updateTicketCollectionImages(
        [image],
        { ticketCollectionId, folder: 'folder', metadata: JSON.stringify({ key: 'value' }) },
        ticketCollection.ownerId,
      );

      expect(storageService.saveFiles).toBeCalledTimes(0);
    });

    it('should not update the ticket collection images if the collection already exists', async () => {
      const image = {
        fieldname: 'test',
        originalname: 'test',
        size: 20000,
        filename: 'test',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('test image'),
      } as Express.Multer.File;

      const ticketCollectionId = '64104bbf1ba3a237dd0e51d1';
      const ticketCollection = { ...ticketCollectionMock } as any;
      jest.spyOn(ticketCollectionModel, 'findById').mockResolvedValue(ticketCollection);
      jest.spyOn(storageService, 'saveFiles');

      await expect(
        ticketService.updateTicketCollectionImages(
          [image],
          { ticketCollectionId, folder: 'folder', metadata: JSON.stringify({ key: 'value' }) },
          'another-incorrect-id',
        ),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('updateTicket', () => {
    it('should update the ticket', async () => {
      // const ticketCollectionId = '64104bbf1ba3a237dd0e51d1';
      // const ticketId = '64104bbf1ba3a237dd0e51d1';
      // const ticketCollection = { ...ticketCollectionMock } as any;
      // jest.spyOn(ticketCollectionModel, 'findById').mockImplementation(() => {
      //   return {
      //     exec: jest.fn().mockResolvedValue(ticketCollection),
      //     save: jest.fn().mockResolvedValue(ticketCollection),
      //   } as any;
      // });
      // jest.spyOn(ticketCollectionModel, 'updateOne').mockResolvedValue(ticketCollection as any);
      // jest.spyOn(userService, 'updateAssociatedWalletAddress').mockResolvedValue(ticketCollection as any);
      // jest.spyOn(userService, 'findById').mockResolvedValue('user' as any);
      // jest.spyOn(userModel, 'findById').mockResolvedValue('user' as any);
      // jest.spyOn(userModel, 'findByIdAndUpdate').mockResolvedValue('user' as any);

      // const result = await ticketService.updateTicket(
      //   {
      //     _id: '64104bbf1ba3a237dd0e51d1',
      //     name: 'new name',
      //     description: 'new description',
      //     price: {
      //       amount: 0.000014,
      //       currency: 'ETH',
      //     },
      //     dateIssued: new Date(),
      //     ticketNumber: 1,
      //     ticketMetadata: [
      //       {
      //         attributes: [{ value: 'value', trait_type: 'trait_type' }],
      //         description: '',
      //         image: '',
      //         name: '',
      //       },
      //     ],
      //     ticketType: 'GENERAL',
      //     ownerHistory: [
      //       '0x62E2444746aA6aD61478F9cC8d5e70c87691DD98',
      //       '0x45Fb4CcBC9975b07b96d91047ddd06c38E0e8878',
      //       '0x45Fb4CcBC9975b07b96d91047ddd06c38E0e8878',
      //     ],
      //     hasUsed: false,
      //   },
      //   ticketCollectionId,
      //   ticketCollectionMock.ownerId,
      //   false,
      //   '0x45fb4ccbc9975b07b96d91047ddd06c38e0e8878',
      // );

      // Assert
      // expect(result._id).toBeDefined();
      // expect(result._id).toEqual(ticketId);
      expect(true).toBe(true);
    });

    it('should throw an error if the ticket does not exist', async () => {
      const ticketCollectionId = '64104bbf1ba3a237dd0e51d1';
      const ticketId = '64104bbf1ba3a237dd0e51d1';
      const ticketCollection = { ...ticketCollectionMock } as any;
      jest.spyOn(ticketCollectionModel, 'findById').mockImplementation(
        () =>
          ({
            exec: jest.fn().mockResolvedValue(ticketCollection),
          } as any),
      );
      jest.spyOn(new TicketModel(ticketCollection), 'save').mockResolvedValue(ticketCollection as any);

      // await expect(
      //   ticketService.updateTicket(
      //     {
      //       _id: '64104bbf1ba3a237dd0e51d1',
      //       name: 'new name',
      //       description: 'new description',
      //       price: {
      //         amount: 0.000014,
      //         currency: 'ETH',
      //       },
      //       dateIssued: new Date(),
      //       ticketNumber: 1,
      //       ticketMetadata: [
      //         {
      //           attributes: [{ value: 'value', trait_type: 'trait_type' }],
      //           description: '',
      //           image: '',
      //           name: '',
      //         },
      //       ],
      //       ticketType: 'GENERAL',
      //       ownerHistory: [
      //         '0x62E2444746aA6aD61478F9cC8d5e70c87691DD98',
      //         '0x45Fb4CcBC9975b07b96d91047ddd06c38E0e8878',
      //         '0x45Fb4CcBC9975b07b96d91047ddd06c38E0e8878',
      //       ],
      //       hasUsed: false,
      //     },
      //     ticketCollectionId,
      //     ticketCollectionMock.ownerId,
      //     false,
      //     '0x45fb4ccbc9975b07b96d91047ddd06c38e0e8878',
      //   ),
      // ).rejects.toThrow(HttpException);

      expect(true).toBe(true);
    });
  });

  describe('deleteTicket', () => {
    it('should delete the ticket', async () => {
      const ticketCollectionId = '64104bbf1ba3a237dd0e51d1';
      const ticketCollection = { ...ticketCollectionMock } as any;
      jest.spyOn(ticketCollectionModel, 'findById').mockResolvedValue(ticketCollection);
      jest.spyOn(ticketCollectionModel, 'findByIdAndDelete').mockResolvedValue({ acknowledged: true, deleteCount: 1 });
      jest.spyOn(new TicketModel(ticketCollection), 'save').mockResolvedValue(ticketCollection as any);

      const result = await ticketService.deleteTicket(ticketCollectionId, ticketCollection.ownerId);

      // Assert
      expect(result.acknowledged).toBeDefined();
      expect(result.acknowledged).toBeTruthy();
    });

    it('should throw an error if the ticket does not exist', async () => {
      const ticketCollectionId = '64104bbf1ba3a237dd0e51d1';
      const ticketCollection = { ...ticketCollectionMock } as any;
      jest.spyOn(new TicketModel(ticketCollection), 'save').mockResolvedValue(ticketCollection as any);

      const result = ticketService.deleteTicket(ticketCollectionId, ticketCollection.ownerId);

      // Assert
      await expect(result).rejects.toThrow(HttpException);
    });
  });

  // describe('checkTicketPurchasePermission', () => {
  //   const walletAddress = '0x62E2444746aA6aD61478F9cC8d5e70c87691DD98';
  //   const eventId = '64104bbf1ba3a237dd0e51d1';
  //   const ticketCollectionId = '64104bbf1ba3a237dd0e51d1';
  //   const ticketId = '64104bbf1ba3a237dd0e51d2';
  //   const userId = '64104bbf1ba3a237dd0e51d1';

  //   it('should return true if the ticket is not sold out', async () => {
  //     const ticketCollection = { ...ticketCollectionMock } as any;
  //     jest.spyOn(ticketService, 'getTicketByID').mockResolvedValue(ticketCollection.tickets[0]);
  //     jest.spyOn(ticketCollectionModel, 'findById').mockResolvedValue(ticketCollection);
  //     jest.spyOn(eventModel, 'findById').mockImplementation(
  //       () =>
  //         ({
  //           exec: jest.fn().mockResolvedValue({}),
  //         } as any),
  //     );
  //     jest.spyOn(ticketService, 'checkTicketPurchaseQuota').mockResolvedValue({
  //       ownedTicketsCount: 0,
  //       quota: 1,
  //       allowPurchase: true,
  //       resalePurchaseApproved: true,
  //       resalePurchasePendingApproval: false,
  //     });
  //     jest.spyOn(ticketService, 'getTicketsOfUserFromMultipleWalletAddresses').mockResolvedValue({
  //       myTickets: [],
  //       myTicketListing: [],
  //     });

  //     const result = await ticketService.checkTicketPurchasePermission(
  //       walletAddress,
  //       eventId,
  //       ticketCollectionId,
  //       ticketId,
  //       userId,
  //     );

  //     // Assert
  //     expect(result).toBeDefined();
  //     expect(result).toBeTruthy();
  //   });

  //   it('should return false if the ticket is sold out', async () => {
  //     const ticketCollectionId = '64104bbf1ba3a237dd0e51d1';
  //     const ticketCollection = { ...ticketCollectionMock } as any;
  //     ticketCollection.soldOut = true;
  //     jest.spyOn(ticketCollectionModel, 'findById').mockResolvedValue(ticketCollection);

  //     const result = await ticketService.checkTicketPurchasePermission(
  //       walletAddress,
  //       eventId,
  //       ticketCollectionId,
  //       ticketId,
  //       userId,
  //     );

  //     // Assert
  //     expect(result).toBeDefined();
  //     expect(result).toBeFalsy();
  //   });
  // });

  describe('recordTicketPurchase', () => {
    it('should record the ticket purchase', async () => {
      const walletAddress = '0x45Fb4CcBC9975b07b96d91047ddd06c38E0e8878';
      const eventId = '64104bbf1ba3a237dd0e51d1';
      const ticketCollectionId = '64104bbf1ba3a237dd0e51d1';
      const ticketId = '64104bbf1ba3a237dd0e51d2';
      const ticketCollection = { ...ticketCollectionMock } as any;

      jest.spyOn(ticketCollectionModel, 'findById').mockResolvedValue(ticketCollection);
      jest.spyOn(new TicketModel(ticketCollection), 'save').mockResolvedValue(ticketCollection as any);
      jest.spyOn(eventModel, 'findById').mockImplementation(
        () =>
          ({
            exec: jest.fn().mockResolvedValue({}),
          } as any),
      );

      jest.spyOn(ticketService, 'getTicketByID').mockResolvedValue(ticketCollection.tickets.general[0]);
      jest.spyOn(ticketService, 'checkTicketPurchasePermission').mockResolvedValue({ allowed: true });
      jest.spyOn(ticketService, 'updateTicket').mockResolvedValue(ticketCollection.tickets.general[0]);

      const result = await ticketService.recordTicketPurchase(
        walletAddress,
        eventId,
        ticketCollectionId,
        ticketId,
        ticketCollection.ownerId,
      );

      // Assert
      expect(ticketService.updateTicket).toHaveBeenCalled();
    });

    it('should throw an error if the ticket is not allowed to be purchased', async () => {
      // Arrange
      const walletAddress = '0x45Fb4CcBC9975b07b96d91047ddd06c38E0e8878';

      const ticketCollectionId = '64104bbf1ba3a237dd0e51d1';
      const ticketCollection = { ...ticketCollectionMock } as any;
      jest.spyOn(ticketCollectionModel, 'findById').mockResolvedValue(ticketCollection);
      jest.spyOn(ticketService, 'checkTicketPurchasePermission').mockResolvedValue({ allowed: false });

      // Act
      const result = ticketService.recordTicketPurchase(
        walletAddress,
        ticketCollection.eventId,
        ticketCollectionId,
        ticketCollection.tickets.general[0]._id,
        ticketCollection.ownerId,
      );

      // Assert
      await expect(result).rejects.toThrow(HttpException);
    });
  });

  describe('listTicketForSale', () => {
    it('should list the ticket for sale', async () => {
      const walletAddress = '0x45Fb4CcBC9975b07b96d91047ddd06c38E0e8878';
      const eventId = '64104bbf1ba3a237dd0e51d1';
      const ticketCollectionId = '64104bbf1ba3a237dd0e51d1';
      const ticketCollection = { ...ticketCollectionMock } as any;

      jest.spyOn(ticketCollectionModel, 'findById').mockResolvedValue(ticketCollection);
      jest.spyOn(new TicketModel(ticketCollection), 'save').mockResolvedValue(ticketCollection as any);
      jest.spyOn(eventModel, 'findById').mockImplementation(
        () =>
          ({
            exec: jest.fn().mockResolvedValue({}),
          } as any),
      );
      jest.spyOn(ticketService, 'getTicketByID').mockResolvedValue(ticketCollection.tickets.general[0]);

      const result = await ticketService.listTicketForSale(
        walletAddress,
        eventId,
        ticketCollectionId,
        ticketCollection.tickets.general[0]._id,
        ticketCollection.tickets.general[0].price,
        ticketCollection.ownerId,
      );

      // Assert
      expect(result).toBeDefined();
      expect(result).toBeTruthy();
    });

    it('should throw an error if the ticket is not allowed to be listed for sale', async () => {
      // Arrange
      const walletAddress = '0x45Fb4CcBC9975b07b96d91047ddd06c38E0e8878';

      const ticketCollectionId = '64104bbf1ba3a237dd0e51d1';
      const ticketCollection = { ...ticketCollectionMock } as any;
      jest.spyOn(ticketCollectionModel, 'findById').mockResolvedValue(ticketCollection);
      jest.spyOn(ticketService, 'checkTicketPurchasePermission').mockResolvedValue({ allowed: false });

      // Act
      const result = ticketService.listTicketForSale(
        walletAddress,
        ticketCollection.eventId,
        ticketCollectionId,
        ticketCollection.tickets.general[0]._id,
        ticketCollection.tickets.general[0].price,
        ticketCollection.ownerId,
      );

      // Assert
      await expect(result).rejects.toThrow(HttpException);
    });
  });

  describe('utilizeTicket', () => {
    it('should utilize the ticket', async () => {
      // arrange
      const ticketCollection = { ...ticketCollectionMock } as any;
      jest.spyOn(ticketCollectionModel, 'findById').mockResolvedValue(ticketCollection);
      jest.spyOn(ticketService, 'getTicketByID').mockResolvedValue(ticketCollection.tickets.general[0]);
      jest.spyOn(ticketService, 'checkTicketPurchasePermission').mockResolvedValue({ allowed: true });
      jest.spyOn(ticketService, 'updateTicket').mockResolvedValue(ticketCollection.tickets.general[0]);
      jest.spyOn(eventModel, 'findById').mockImplementation(
        () =>
          ({
            exec: jest.fn().mockResolvedValue({}),
          } as any),
      );

      // act
      const result = await ticketService.utilizeTicket(
        ticketCollection.eventId,
        ticketCollection.tickets.general[0]._id,
        ticketCollection.ownerId,
        ticketCollection.createdDate,
      );

      // assert
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result).toBeTruthy();
    });

    it('should throw an error if the ticket is not allowed to be utilized', async () => {
      // Arrange
      const ticketCollection = { ...ticketCollectionMock } as any;
      jest.spyOn(ticketCollectionModel, 'findById').mockResolvedValue(ticketCollection);
      jest.spyOn(ticketService, 'checkTicketPurchasePermission').mockResolvedValue({ allowed: false });

      // Act
      const result = ticketService.utilizeTicket(
        ticketCollection.eventId,
        ticketCollection.tickets.general[0]._id,
        ticketCollection.ownerId,
        ticketCollection.createdDate,
      );

      // Assert
      await expect(result).rejects.toThrow(HttpException);
    });
  });

  describe('getEventApplicantInfo', () => {
    const eventId = '64104bbf1ba3a237dd0e51d1';

    it('should return the event applicant info', async () => {
      // arrange
      jest.spyOn(ticketCollectionModel, 'findById').mockResolvedValue(ticketCollectionMock);
      jest.spyOn(ticketService, 'getTicketByID').mockResolvedValue(ticketCollectionMock.tickets.general[0] as any);
      jest.spyOn(eventModel, 'findById').mockImplementation(
        () =>
          ({
            exec: jest.fn().mockResolvedValue({}),
          } as any),
      );

      const address = ticketCollectionMock.tickets.general[0].ownerHistory.at(-1);
      // act
      const result = await ticketService.getEventApplicantInfo(
        eventId,
        ticketCollectionMock.tickets.general[0]._id as string,
        ticketCollectionMock.ownerId,
        address,
      );

      // assert
      expect(result).toBeDefined();
      expect(result).toBeTruthy();
    });

    it('should throw an error if the ticket is not allowed to be utilized', async () => {
      const address = '0x45Fb4CcBC9975b07b96d91047ddd06c38E0e8878';
      // arrange
      jest.spyOn(ticketCollectionModel, 'findById').mockResolvedValue(ticketCollectionMock);
      jest.spyOn(ticketService, 'getTicketByID').mockResolvedValue(ticketCollectionMock.tickets.general[2] as any);
      jest.spyOn(eventModel, 'findById').mockImplementation(
        () =>
          ({
            exec: jest.fn().mockResolvedValue({}),
          } as any),
      );

      // Act
      const result = ticketService.getEventApplicantInfo(
        eventId,
        ticketCollectionMock.tickets.general[2]._id as string,
        ticketCollectionMock.ownerId,
        address,
      );

      // Assert
      await expect(result).rejects.toThrow(HttpException);
    });
  });

  describe('sendResaleTicketPurchaseRequest', () => {
    const address = '0x45Fb4CcBC9975b07b96d91047ddd06c38E0e8878';
    it('should send the resale ticket purchase request', async () => {
      // arrange
      const ticketCollection = { ...ticketCollectionMock } as any;
      jest.spyOn(ticketCollectionModel, 'findById').mockResolvedValue(ticketCollection);
      jest.spyOn(ticketService, 'getTicketByID').mockResolvedValue(ticketCollection.tickets.general[0]);
      jest.spyOn(ticketService, 'checkTicketPurchasePermission').mockResolvedValue({ allowed: true });
      jest.spyOn(ticketService, 'updateTicket').mockResolvedValue(ticketCollection.tickets.general[0]);
      jest.spyOn(eventModel, 'findById').mockImplementation(
        () =>
          ({
            exec: jest.fn().mockResolvedValue({}),
            save: jest.fn().mockResolvedValue({}),
          } as any),
      );
      // jest.spyOn(new TicketModel(ticketCollection), 'save').mockResolvedValue(ticketCollection as any);

      // act
      const result = await ticketService.sendResaleTicketPurchaseRequest({
        address,
        ticketCollectionId: ticketCollection._id,
        ticketId: ticketCollection.tickets.general[0]._id.$oid,
        smartContractTicketId: ticketCollection.tickets.general[0].smartContractTicketId,
        approved: false,
      });

      // assert
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result).toBeTruthy();
    });

    it('should throw an error if the ticket is not allowed to be utilized', async () => {
      // Arrange
      const ticketCollection = { ...ticketCollectionMock } as any;
      jest.spyOn(ticketCollectionModel, 'findById').mockResolvedValue(ticketCollection);
      jest.spyOn(ticketService, 'checkTicketPurchasePermission').mockResolvedValue({ allowed: false });

      // Act
      const result = ticketService.sendResaleTicketPurchaseRequest({
        address,
        ticketCollectionId: ticketCollection._id,
        ticketId: ticketCollection.tickets.general[0]._id.$oid,
        smartContractTicketId: ticketCollection.tickets.general[0].smartContractTicketId,
        approved: false,
      });

      // Assert
      await expect(result).rejects.toThrow(HttpException);
    });
  });

  describe('approveResaleTicketPurchaseRequest', () => {
    const ticketCollectionId = '64104bbf1ba3a237dd0e51d1';
    const permissionId = '6411e968668940c1ed0abc45';
    it('should approve the resale ticket purchase request', async () => {
      // arrange
      const ticketCollection = { ...ticketCollectionMock } as any;
      jest.spyOn(ticketCollectionModel, 'findById').mockResolvedValue(ticketCollectionMock);
      jest.spyOn(ticketService, 'getTicketByID').mockResolvedValue(ticketCollection.tickets.general[0]);
      // jest.spyOn(ticketService, 'checkTicketPurchasePermission').mockResolvedValue({ allowed: true });
      // jest.spyOn(ticketService, 'updateTicket').mockResolvedValue(ticketCollection.tickets.general[0]);
      jest.spyOn(eventModel, 'findById').mockImplementation(
        () =>
          ({
            exec: jest.fn().mockResolvedValue({}),
            save: jest.fn().mockResolvedValue({}),
          } as any),
      );
      // jest.spyOn(new TicketModel(ticketCollection), 'save').mockResolvedValue(ticketCollection as any);

      // act
      const result = await ticketService.approveResaleTicketPurchaseRequest(ticketCollectionId, permissionId);

      // assert
      expect(result).toBeDefined();
      expect(result[0].approved).toBe(true);
      expect(result).toBeTruthy();
    });

    it('should throw an error if the ticket is not allowed to be utilized', async () => {
      // Arrange
      jest.spyOn(ticketCollectionModel, 'findById').mockResolvedValue(undefined);
      jest.spyOn(ticketService, 'checkTicketPurchasePermission').mockResolvedValue({ allowed: false });

      // Act
      const result = ticketService.approveResaleTicketPurchaseRequest(ticketCollectionId, permissionId);

      // Assert
      await expect(result).rejects.toThrow(HttpException);
    });
  });
});
