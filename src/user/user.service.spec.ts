import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model, Mongoose, ObjectId } from 'mongoose';
import { UserService } from '../user/user.service';
import { AuthService } from '../auth/auth.service';
import { VerificationStatus, Verification } from './user.interface';
import { Role } from 'common/roles';
import { StorageService } from '../storage/storage.service';
import { JwtService } from '@nestjs/jwt';
import mongoose from 'mongoose';
import { HttpException, NotFoundException } from '@nestjs/common';

interface User {
  _id: mongoose.Types.ObjectId;
  phoneNumber: string;
  email: string;
  username: string;
  password: string;
  verificationStatus: VerificationStatus;
  accountType: Role;
  profileImage: string;
  firstName?: string;
  lastName?: string;
  organizationName?: string;
}

describe('UserService', () => {
  let userService: UserService;
  let authService: AuthService;
  let userModel: Model<User>;

  let userCollection: User[] = [];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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

    userService = module.get<UserService>(UserService);
    userModel = module.get<Model<User>>(getModelToken('User'));

    userCollection = [
      {
        _id: new mongoose.Types.ObjectId(),
        phoneNumber: '1',
        email: 'test1@email.com',
        username: '1',
        password: 'password',
        verificationStatus: VerificationStatus.NOT_VERIFIED,
        accountType: 'CUSTOMER',
        profileImage: 'string',
      },
      {
        _id: new mongoose.Types.ObjectId(),
        phoneNumber: '2',
        email: 'test2@email.com',
        username: '2',
        password: 'password',
        verificationStatus: VerificationStatus.VERIFIED,
        accountType: 'CUSTOMER',
        profileImage: 'string',
      },
      {
        _id: new mongoose.Types.ObjectId(),
        phoneNumber: '3',
        email: 'test3@email.com',
        username: '3',
        password: 'password',
        verificationStatus: VerificationStatus.NOT_VERIFIED,
        accountType: 'EVENT_ORGANIZER',
        profileImage: 'string',
      },
      {
        _id: new mongoose.Types.ObjectId(),
        phoneNumber: '4',
        email: 'test4@email.com',
        username: '4',
        password: 'password',
        verificationStatus: VerificationStatus.NOT_VERIFIED,
        accountType: 'EVENT_ORGANIZER',
        profileImage: 'string',
      },
    ];
  });

  describe('get users by ID', () => {
    it('should return user of that ID', async () => {
      jest.spyOn(userModel, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue(userCollection[0]),
      } as any);

      const result = await userService.findById(userCollection[0]._id);
      expect(result._id).toBe(userCollection[0]._id);
    });

    it('should return user of that ID', async () => {
      jest.spyOn(userModel, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue(null),
      } as any);

      try {
        await userService.findById(new mongoose.Types.ObjectId());
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
      }
    });
  });

  describe('get user by phone number', () => {
    it('should return user with that phone number', async () => {
      jest.spyOn(userModel, 'findOne').mockReturnValue(userCollection[0] as any);
      const result = await userService.findByPhoneNumber('1');
      expect(result._id).toBe(userCollection[0]._id);
    });

    it('should throw error with unknown phone number', async () => {
      jest.spyOn(userModel, 'findOne').mockReturnValue(undefined);
      const result = await userService.findByPhoneNumber('-1');
      expect(result).toBe(undefined);
    });
  });

  describe('find user either by phone number or email', () => {
    it('should return user with corresponding inputs', async () => {
      jest.spyOn(userModel, 'findOne').mockReturnValue(userCollection[0] as any);
      const result1 = await userService.findUserByPhoneNumberOrEmail('1', undefined);
      const result2 = await userService.findUserByPhoneNumberOrEmail(undefined, 'test1@email.com');
      expect(result1._id).toBe(result2._id);
    });

    it('should not return user with corresponding inputs', async () => {
      jest.spyOn(userModel, 'findOne').mockReturnValue(undefined as any);
      const result1 = await userService.findUserByPhoneNumberOrEmail('-1', undefined);
      const result2 = await userService.findUserByPhoneNumberOrEmail(undefined, 'test999@email.com');
      expect(result1 && result2).toBeFalsy();
    });
  });

  describe('register customer user', () => {
    it('should create new user', async () => {
      const user: User = {
        _id: new mongoose.Types.ObjectId(),
        phoneNumber: '5',
        email: 'test5@email.com',
        username: '5',
        password: 'password',
        verificationStatus: VerificationStatus.NOT_VERIFIED,
        accountType: 'CUSTOMER',
        profileImage: 'string',
        firstName: 'Mr.5', // type OnePieceReference
        lastName: 'Gem',
      };
      userCollection.push(user);
      // authService.generateJWT(user._id, user.)
      // jest.spyOn(userModel, 'create').mockReturnValue({status: 200});
      // const result = await userService.registerCustomerUser(user as any);
      // expect(result).to
    });
  });
});
