import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../auth/auth.service';
import { StorageService } from '../../storage/storage.service';
import { UserController } from '../user.controller';
import { UserService } from '../user.service';

describe('UserController', () => {
  let controller: UserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        UserService,
        AuthService,
        StorageService,
        JwtService,
        {
          provide: getModelToken('User'),
          useValue: {
            findById: jest.fn().mockReturnThis(),
            findOne: jest.fn().mockReturnThis(),
            updateOne: jest.fn(),
            exec: jest.fn(),
          },
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

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
