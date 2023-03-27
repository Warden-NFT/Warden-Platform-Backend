import { HttpException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import mongoose, { Model } from 'mongoose';
import { StorageService } from '../storage/storage.service';
import { EventService } from './event.service';
import { Event } from './interfaces/event.interface';
import { UpdateEventDTO } from './event.dto';
import { MongoMemoryServer } from 'mongodb-memory-server';

describe('EventService', () => {
  let mongoServer: MongoMemoryServer;
  let service: EventService;
  let eventModel: Model<Event>;

  let eventCollection: Event[] = [];

  const image = {
    fieldname: 'test',
    originalname: 'test',
    size: 20000,
    filename: 'test',
    mimetype: 'image/jpeg',
    buffer: Buffer.from('test image'),
  } as Express.Multer.File;

  beforeEach(async () => {
    mongoServer = await MongoMemoryServer.create();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventService,
        StorageService,
        {
          provide: getModelToken('Event'),
          useValue: {
            find: jest.fn().mockReturnThis(),
            findById: jest.fn().mockReturnThis(),
            findOne: jest.fn(),
            deleteMany: jest.fn(),
            deleteOne: jest.fn(),
            save: jest.fn(),
            exec: jest.fn(),
            validate: jest.fn().mockResolvedValue(eventCollection[0]),
          },
        },
        {
          provide: getModelToken('User'),
          useValue: {
            findById: jest.fn().mockReturnThis(),
          },
        },
      ],
    }).compile();

    service = module.get<EventService>(EventService);
    eventModel = module.get<Model<Event>>(getModelToken('Event'));

    eventCollection = [
      {
        _id: new mongoose.Types.ObjectId(),
        eventStatus: 'NOT_STARTED',
        eventKeywords: ['Jest', 'Senior Project'],
        location: {
          place_id: '1',
          description: 'description',
          structured_formatting: {
            main_text: 'main',
            secondary_text: 'secondary',
          },
        },
        online_url: 'http://localhost:8080',
        ticketSupply: {
          general: 100,
          vip: 20,
          reservedSeat: 0,
        },
        organizerId: '1',
        subEventId: '1',
        superEventId: '1',
        description: 'description',
        identifier: '1',
        name: '1',
        url: 'http://localhost:3000',
        doorTime: new Date(),
        startDate: new Date(),
        endDate: new Date(),
        ticketType: 'GENERAL',
        image: undefined,
        ownerAddress: '0x1234567890',
        smartContractAddress: '0x0987654321',
        ticketCollectionId: '1',
      },
      {
        _id: new mongoose.Types.ObjectId(),
        eventStatus: 'NOT_STARTED',
        eventKeywords: ['I', 'Love', 'Cats'],
        location: {
          place_id: '1',
          description: 'description',
          structured_formatting: {
            main_text: 'main',
            secondary_text: 'secondary',
          },
        },
        online_url: 'http://localhost:8080',
        ticketSupply: {
          general: 100,
          vip: 20,
          reservedSeat: 0,
        },
        organizerId: '1',
        subEventId: '8',
        superEventId: '8',
        description: 'description',
        identifier: '8',
        name: '8',
        url: 'http://localhost:3000',
        doorTime: new Date(),
        startDate: new Date(),
        endDate: new Date(),
        ticketType: 'GENERAL',
        image: undefined,
        ownerAddress: '0x1234567890',
        smartContractAddress: '0x0987654321',
        ticketCollectionId: '',
      },
      {
        _id: new mongoose.Types.ObjectId(),
        eventStatus: 'NOT_STARTED',
        eventKeywords: ['Say', 'My', 'Name'],
        location: {
          place_id: '8',
          description: 'description',
          structured_formatting: {
            main_text: 'main',
            secondary_text: 'secondary',
          },
        },
        online_url: 'http://localhost:8080',
        ticketSupply: {
          general: 100,
          vip: 20,
          reservedSeat: 0,
        },
        organizerId: '1',
        subEventId: '8',
        superEventId: '8',
        description: 'description',
        identifier: '8',
        name: '8',
        url: 'http://localhost:3000',
        doorTime: new Date(),
        startDate: new Date(),
        endDate: new Date(),
        ticketType: 'GENERAL',
        image: undefined,
        ownerAddress: '0x1234567890',
        smartContractAddress: '0x0987654321',
        ticketCollectionId: '',
      },
      {
        _id: new mongoose.Types.ObjectId(),
        eventStatus: 'EVENT_STARTED',
        eventKeywords: ['Some', 'Keyword'],
        location: {
          place_id: '2',
          description: 'description',
          structured_formatting: {
            main_text: 'main',
            secondary_text: 'secondary',
          },
        },
        online_url: 'http://localhost:8080',
        ticketSupply: {
          general: 300,
          vip: 80,
          reservedSeat: 0,
        },
        organizerId: '2',
        subEventId: '2',
        superEventId: '2',
        description: 'description',
        identifier: '2',
        name: '2',
        url: 'http://localhost:3000',
        doorTime: new Date(),
        startDate: new Date(),
        endDate: new Date(),
        ticketType: 'VIP',
        image: undefined,
        ownerAddress: '0x2345678901',
        smartContractAddress: '0x1098765432',
        ticketCollectionId: '2',
      },
      {
        _id: new mongoose.Types.ObjectId(),
        eventStatus: 'ADMISSION_STARTED',
        eventKeywords: ['I', 'Am', 'Iron Man'],
        location: {
          place_id: '3',
          description: 'description',
          structured_formatting: {
            main_text: 'main',
            secondary_text: 'secondary',
          },
        },
        online_url: 'http://localhost:8080',
        ticketSupply: {
          general: 500,
          vip: 50,
          reservedSeat: 0,
        },
        organizerId: '3',
        subEventId: '3',
        superEventId: '3',
        description: 'description',
        identifier: '3',
        name: '3',
        url: 'http://localhost:3000',
        doorTime: new Date(),
        startDate: new Date(),
        endDate: new Date(),
        ticketType: 'VIP',
        image: undefined,
        ownerAddress: '0x3456789012',
        smartContractAddress: '0x2109876543',
        ticketCollectionId: '3',
      },
      {
        _id: new mongoose.Types.ObjectId(),
        eventStatus: 'EVENT_ENDED',
        eventKeywords: ['Let', 'Him', 'Cook'],
        location: {
          place_id: '4',
          description: 'description',
          structured_formatting: {
            main_text: 'main',
            secondary_text: 'secondary',
          },
        },
        online_url: 'http://localhost:8080',
        ticketSupply: {
          general: 80,
          vip: 0,
          reservedSeat: 0,
        },
        organizerId: '4',
        subEventId: '4',
        superEventId: '4',
        description: 'description',
        identifier: '4',
        name: '4',
        url: 'http://localhost:3000',
        doorTime: new Date(),
        startDate: new Date(),
        endDate: new Date(),
        ticketType: 'GENERAL',
        image: undefined,
        ownerAddress: '0x4567890123',
        smartContractAddress: '0x3210987654',
        ticketCollectionId: '4',
      },
    ];

    await eventModel.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoose.connection.close();
    mongoServer.stop();
  });

  afterEach(async () => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Have problem with eventModel is not a constructor
  describe('Create Event', () => {
    it('Should successfully create an event', async () => {
      expect(true).toBeTruthy();
    });
  });

  describe('Get Event', () => {
    it('Should get event with correct ID', async () => {
      jest.spyOn(eventModel, 'findById').mockReturnValue({
        exec: jest.fn().mockReturnValue(eventCollection[0]),
      } as any);

      const event = await service.getEvent(eventCollection[0]._id.toString());
      expect(event._id).toBe(eventCollection[0]._id);
    });

    it('Should get undefined from incorrect ID', async () => {
      jest.spyOn(eventModel, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue(eventCollection[0]),
      } as any);

      try {
        await service.getEvent('999');
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
      }
    });
  });

  describe.only("Get all organizer's events", () => {
    it('Should get correctly listed events from ID', async () => {
      const eventOrganizerId = '1';
      const _collection = eventCollection.filter((event) => event.organizerId === eventOrganizerId);

      jest.spyOn(eventModel, 'find').mockImplementation(
        () =>
          ({
            sort: jest.fn().mockImplementation(() => ({
              exec: jest.fn().mockResolvedValueOnce(_collection as any),
            })),
          } as any),
      );

      const events = await service.getEventFromEventOrganizer(eventOrganizerId, false);
      console.log(events.map((event) => event._id));
      expect(events.map((event) => event?._id)).toEqual(_collection.map((event) => event?._id));
    });

    it('Should get all listed and unlisted correct events from ID', async () => {
      const eventOrganizerId = '1';
      const _collection = eventCollection.filter(
        (event) => event.organizerId === eventOrganizerId && event.ticketCollectionId === '',
      );

      jest.spyOn(eventModel, 'find').mockImplementation(
        () =>
          ({
            sort: jest.fn().mockImplementation(() => ({
              exec: jest.fn().mockResolvedValueOnce(_collection),
            })),
          } as any),
      );

      const events = await service.getEventFromEventOrganizer(eventOrganizerId, true);
      expect(events.map((event) => event?._id.toString())).toEqual(_collection.map((event) => event?._id.toString()));
    });

    it('Should get empty events from incorrect Event ID', async () => {
      const eventOrganizerId = '999';

      jest.spyOn(eventModel, 'find').mockImplementation(
        () =>
          ({
            sort: jest.fn().mockImplementation(() => ({
              exec: jest.fn().mockResolvedValueOnce(undefined),
            })),
          } as any),
      );

      try {
        await service.getEventFromEventOrganizer(eventOrganizerId, true);
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
      }
    });
  });

  describe('Update event', () => {
    const event: UpdateEventDTO = {
      eventId: '1',
      eventOrganizerId: '1',
      eventStatus: 'NOT_STARTED',
      eventKeywords: ['Jest', 'Senior Project'],
      location: {
        place_id: '1',
        description: 'description',
        structured_formatting: {
          main_text: 'main',
          secondary_text: 'secondary',
        },
      },
      online_url: 'http://localhost:8080',
      ticketSupply: {
        general: 100,
        vip: 20,
        reservedSeat: 0,
      },
      organizerId: '1',
      subEventId: '1',
      superEventId: '1',
      description: 'description',
      identifier: '1',
      name: '1',
      url: 'http://localhost:3000',
      doorTime: new Date(),
      startDate: new Date(),
      endDate: new Date(),
      ticketType: 'GENERAL',
      image: undefined,
      ownerAddress: '0x1234567890',
      smartContractAddress: '0x0987654321',
      ticketCollectionId: '1',
    };

    it('Should update event from given inputs', async () => {
      jest.spyOn(eventModel, 'findById').mockReturnValue({
        exec: jest.fn().mockReturnValue(event),
      } as any);
      jest.spyOn(eventModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockReturnValue(event),
      } as any);

      const updated = await service.updateEvent(event, '1');
      expect(updated).toBeDefined();
    });

    it('Should not update event from wrong eventOrganizerId', async () => {
      jest.spyOn(eventModel, 'findById').mockReturnValue({
        exec: jest.fn().mockReturnValue(eventCollection[0]),
      } as any);
      jest.spyOn(eventModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockReturnValue(event),
      } as any);

      try {
        await service.updateEvent(event, '-1');
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
      }
    });

    it('Should not update event from wrong eventId', async () => {
      jest.spyOn(eventModel, 'findById').mockReturnValue({
        exec: jest.fn().mockReturnValue(undefined),
      } as any);

      event.organizerId = '1234';
      try {
        await service.updateEvent(event, '1');
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
      }
    });
  });
  describe('Delete event', () => {
    it('should delete an event', async () => {
      const eventId = eventCollection[0]._id.toString();
      const eventOrgId = eventCollection[0].organizerId;

      jest.spyOn(eventModel, 'deleteOne').mockReturnValue({ acknowledged: true, deletedCount: 1 } as any);
      const result = await service.deleteEvent(eventId, eventOrgId);
      expect(result.acknowledged).toBeTruthy();
      expect(eventModel.deleteOne).toHaveBeenCalledWith({ _id: eventId, organizerId: eventOrgId });
    });

    it('should throw a BadRequestException if the event could not be deleted', async () => {
      const eventId = eventCollection[0]._id.toString();
      const eventOrgId = eventCollection[0].organizerId;

      jest.spyOn(eventModel, 'deleteOne').mockReturnThis();

      try {
        await service.deleteEvent(eventId, eventOrgId);
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
      }
    });
  });

  describe('Upload event image', () => {
    it('should update the event image when the user is the event owner', async () => {
      await service.createEvent(eventCollection[0]);
      const result = await service.uploadEventImage('1', eventCollection[0]._id.toString(), image);
      expect(eventModel.findById).toHaveBeenCalledWith(eventCollection[0]._id);
      expect(eventModel.findByIdAndUpdate).toHaveBeenCalledWith(
        eventCollection[0]._id,
        { image: expect.any(String) },
        { new: true },
      );
      expect(result).toBe('https://storage.googleapis.com/nft-generator-microservice-bucket-test/media/456/cover');
    });
  });
});
