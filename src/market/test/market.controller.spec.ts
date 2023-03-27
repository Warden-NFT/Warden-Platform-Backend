import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../auth/auth.service';
import { StorageService } from '../../storage/storage.service';
import { EventService } from '../../event/event.service';
import { TicketService } from '../../ticket/ticket.service';
import { UserService } from '../../user/user.service';
import { MarketController } from '../market.controller';
import { MarketService } from '../market.service';
import { JwtService } from '@nestjs/jwt';

describe('MarketController', () => {
  let controller: MarketController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MarketController],
      providers: [
        MarketService,
        EventService,
        UserService,
        TicketService,
        AuthService,
        StorageService,
        JwtService,
        {
          provide: getModelToken('Event'),
          useValue: {},
        },
        {
          provide: getModelToken('Market'),
          useValue: {},
        },
        {
          provide: getModelToken('TicketCollection'),
          useValue: {},
        },
        {
          provide: getModelToken('User'),
          useValue: {},
        },
        {
          provide: getModelToken('Customer'),
          useValue: {},
        },
        {
          provide: getModelToken('EventOrganizer'),
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<MarketController>(MarketController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
