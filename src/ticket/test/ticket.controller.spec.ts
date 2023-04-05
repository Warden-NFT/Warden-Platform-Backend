import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { EventService } from '../../event/event.service';
import { UserService } from '../../user/user.service';
import { StorageService } from '../../storage/storage.service';
import { TicketController } from '../ticket.controller';
import { TicketService } from '../ticket.service';
import { AuthService } from '../../auth/auth.service';
import { JwtService } from '@nestjs/jwt';

describe('TicketController', () => {
  let controller: TicketController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TicketController],
      providers: [
        TicketService,
        EventService,
        UserService,
        StorageService,
        AuthService,
        JwtService,
        {
          provide: getModelToken('TicketCollection'),
          useValue: {},
        },
        {
          provide: getModelToken('Event'),
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

    controller = module.get<TicketController>(TicketController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
