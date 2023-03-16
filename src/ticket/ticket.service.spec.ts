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

describe('TicketService', () => {
  let ticketService: TicketService;
  let ticketCollectionModel: Model<TicketCollection>;

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
    ticketCollectionModel = module.get<Model<TicketCollection>>(getModelToken('TicketCollection'));
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
      console.log(result);
      const expectedMyTickets = [ticketCollection.tickets.general[0], ticketCollection.tickets.reservedSeat[0]];
      console.log(expectedMyTickets);
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
