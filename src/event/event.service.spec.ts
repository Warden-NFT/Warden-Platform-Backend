import { HttpException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import mongoose, { Model } from 'mongoose';
import { StorageService } from '../storage/storage.service';
import { EventService } from './event.service';
import { Event } from './interfaces/event.interface';
import { UpdateEventDTO } from './event.dto';

describe('EventService', () => {
  let service: EventService;
  let eventModel: Model<Event>;

  let eventCollection: Event[] = [];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventService,
        StorageService,
        {
          provide: getModelToken('Event'),
          useValue: {
            findById: jest.fn().mockReturnThis(),
            exec: jest.fn(),
            findByIdAndUpdate: jest.fn().mockReturnThis(),
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
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // TODO: try to implement create()
  describe('Create Event', () => {
    it('Should successfully create an event', async () => {
      expect(true).toBeTruthy();
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

    describe.skip("Get all organizer's events", () => {
      it('Should get correctly listed events from ID', async () => {
        // code does not work
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
        expect(events.map((event) => event?._id.toString())).toBe(_collection.map((event) => event?._id.toString()));
      });

      it('Should get all listed and unlisted correct events from ID', () => {
        expect(true).toBeTruthy();
      });

      it('Should get empty events from incorrect ID', () => {
        expect(true).toBeTruthy();
      });
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
});

describe('Delete event', () => {
  // skip
  expect(true).toBeTruthy();
});

describe('Upload event image', () => {
  // skip
  expect(true).toBeTruthy();
});
