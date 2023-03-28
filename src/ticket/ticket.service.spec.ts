import { HttpException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { UserService } from '../user/user.service';
import { EventService } from '../event/event.service';
import { StorageService } from '../storage/storage.service';
import { TicketCollection } from './interface/ticket.interface';
import { TicketService } from './ticket.service';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { Event } from '../event/interfaces/event.interface';
import * as moment from 'moment';
import { EventDB, TicketDB } from './ticket.mock';

describe('TicketService', () => {
  let ticketService: TicketService;
  let ticketCollectionModel: Model<TicketCollection>;
  let eventModel: Model<Event>;

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
            findById: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getModelToken('Event'),
          useValue: {
            find: jest.fn(),
            exec: jest.fn(),
            findById: jest.fn(),
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
    ticketCollectionModel = module.get<Model<TicketCollection>>(getModelToken('TicketCollection'));
    eventModel = module.get<Model<Event>>(getModelToken('Event'));
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

  describe('Ticket Utilization', () => {
    it('should throw exception from unknown eventId', async () => {
      jest.spyOn(ticketCollectionModel, 'findById').mockReturnValue(undefined as any);
      try {
        await ticketService.utilizeTicket('1', '-1', '1', new Date());
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
      }
    });

    it('should throw exception from unknown ticketId', async () => {
      jest.spyOn(eventModel, 'findById').mockReturnValue(undefined as any);
      try {
        await ticketService.utilizeTicket('-1', '1', '1', new Date());
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
      }
    });

    it('should have QR code time exceed', async () => {
      const time = moment().add(16, 'second');
      try {
        await ticketService.utilizeTicket('-1', '-1', '-1', time.toDate());
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.response.message).toBe('qr_code_time_exceed');
      }
    });

    it('should have succesfully utilize ticket', async () => {
      const ticketCollectionDoc = {
        ...TicketDB[0],
        save: jest.fn().mockReturnValue(TicketDB[0]),
      };

      jest.spyOn(eventModel, 'findById').mockReturnValue({
        exec: jest.fn().mockReturnValue(EventDB[0]),
      } as any);

      jest.spyOn(ticketCollectionModel, 'findById').mockReturnValue(ticketCollectionDoc as any);
      jest.spyOn(ticketCollectionDoc, 'save').mockReturnValue(TicketDB[0]);

      const time = moment();
      const result = await ticketService.utilizeTicket('1', '1', '1', time.toDate());
      expect(ticketCollectionModel.findById).toBeCalled();
      expect(eventModel.findById).toBeCalled();
      expect(result.success).toBeTruthy();
    });

    it('should have unsuccessfully utilize ticket', async () => {
      const ticketCollectionDoc = {
        ...TicketDB[0],
        save: jest.fn().mockReturnValue(TicketDB[0]),
      };

      jest.spyOn(eventModel, 'findById').mockReturnValue({
        exec: jest.fn().mockReturnValue(EventDB[0]),
      } as any);

      jest.spyOn(ticketCollectionModel, 'findById').mockReturnValue(ticketCollectionDoc as any);
      jest.spyOn(ticketCollectionDoc, 'save').mockReturnValue(TicketDB[0]);

      const time = moment();
      try {
        await ticketService.utilizeTicket('1', '2', '1', time.toDate());
        expect(ticketCollectionModel.findById).toBeCalled();
        expect(eventModel.findById).toBeCalled();
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.response.message).toBe('ticket_already_used');
      }
    });
  });
});
