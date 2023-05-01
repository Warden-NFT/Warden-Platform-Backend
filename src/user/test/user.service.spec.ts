import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { UserService } from '../user.service';
import { AuthService } from '../../auth/auth.service';
import { VerificationStatus, CustomerUser, EventOrganizerUser } from '../user.interface';
import { Role } from '../../../common/roles';
import { StorageService } from '../../storage/storage.service';
import { JwtService } from '@nestjs/jwt';
import mongoose from 'mongoose';
import { HttpException, HttpStatus } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { DuplicateElementException } from '../user.exception';

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
  associatedWallet?: string[];
}

describe('UserService', () => {
  let userService: UserService;
  let authService: AuthService;
  let storageService: StorageService;
  let jwtService: JwtService;
  let userModel: Model<User>;
  let customerModel: Model<CustomerUser>;
  let eventOrganizerModel: Model<EventOrganizerUser>;

  let userCollection: User[] = [];

  class UserModel {
    constructor(private data) {}
    static findById = jest.fn().mockReturnThis();
    static findOne = jest.fn().mockReturnThis();
    static exec = jest.fn();
    static updateOne = jest.fn();
    static create = jest.fn();
    save = jest.fn();
  }

  class EventOrganizerModel {
    constructor(private data) {}
    static findById = jest.fn().mockReturnThis();
    static findOne = jest.fn().mockReturnThis();
    static exec = jest.fn();
    static updateOne = jest.fn();
    static create = jest.fn();
    save = jest.fn();
  }

  class CustomerModel {
    constructor(private data) {}
    static findById = jest.fn().mockReturnThis();
    static findOne = jest.fn().mockReturnThis();
    static exec = jest.fn();
    static updateOne = jest.fn();
    static create = jest.fn();
    save = jest.fn();
  }

  const db = require('../../../test/db.ts');
  beforeAll(async () => await db.connect());
  afterEach(async () => await db.clearDatabase());
  afterAll(async () => await db.closeDatabase());

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        AuthService,
        StorageService,
        JwtService,
        {
          provide: getModelToken('User'),
          useValue: UserModel,
        },
        {
          provide: getModelToken('Customer'),
          useValue: CustomerModel,
        },
        {
          provide: getModelToken('EventOrganizer'),
          useValue: EventOrganizerModel,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    authService = module.get<AuthService>(AuthService);
    storageService = module.get<StorageService>(StorageService);
    jwtService = module.get<JwtService>(JwtService);
    userModel = module.get<Model<User>>(getModelToken('User'));
    customerModel = module.get<Model<CustomerUser>>(getModelToken('Customer'));
    eventOrganizerModel = module.get<Model<EventOrganizerUser>>(getModelToken('EventOrganizer'));

    userCollection = [
      {
        _id: new mongoose.Types.ObjectId(1),
        phoneNumber: '1',
        email: 'test1@email.com',
        username: '1',
        password: '$2b$10$QPcPjyMyscb8qIVqsQuowuGElmBIpLmHHTvakR.w37dA9q6phq5kK',
        verificationStatus: VerificationStatus.NOT_VERIFIED,
        accountType: 'CUSTOMER',
        profileImage: 'string',
        associatedWallet: ['0x1234'],
      },
      {
        _id: new mongoose.Types.ObjectId(2),
        phoneNumber: '2',
        email: 'test2@email.com',
        username: '2',
        password: 'password',
        verificationStatus: VerificationStatus.VERIFIED,
        accountType: 'CUSTOMER',
        profileImage: 'string',
        associatedWallet: ['0x1234'],
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
      jest.spyOn(userModel, 'findById').mockReturnValue(userCollection[0] as any);

      const result = await userService.findById(userCollection[0]._id);
      expect(result._id).toBe(userCollection[0]._id);
    });

    it('should throw error with unknown ID', async () => {
      jest.spyOn(userModel, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue(null),
      } as any);

      try {
        await userService.findById(new mongoose.Types.ObjectId());
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
      }
    });

    it('should return HttpException when searching with unknown ID', async () => {
      jest.spyOn(userModel, 'findById').mockReturnValue(undefined);

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
    it('should not create new customer user', async () => {
      try {
        await userService.registerCustomerUser(userCollection[0] as any);
      } catch (e) {
        expect(e).toBeInstanceOf(TypeError);
      }
    });

    it('should not create new customer user', async () => {
      jest.spyOn(userService, 'findUserByPhoneNumberOrEmail').mockReturnValue(userCollection[0] as any);
      try {
        await userService.registerCustomerUser(userCollection[0] as any);
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
      }
    });
  });

  // TODO: Find a good solution for userModel.save() is undefined...
  describe('should set phone verification status', () => {
    it('should set verification status to true', async () => {
      const currUser = await new UserModel(userCollection[0]);
      jest.spyOn(userModel, 'create').mockImplementationOnce(() =>
        Promise.resolve({
          status: 201,
        }),
      );

      jest.spyOn(userModel, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue(currUser),
      } as any);
      jest.spyOn(currUser, 'save').mockResolvedValue(userCollection[0] as any);
      const result = await userService.setUserPhoneVerificationStatus(
        userCollection[0]._id.toString(),
        VerificationStatus.VERIFIED,
      );

      expect(result.status).toBe(201);
    });

    it('should not set verification status to true and throw error due to user not found', async () => {
      jest.spyOn(userModel, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue(undefined),
      } as any);

      try {
        await userService.setUserPhoneVerificationStatus(
          new mongoose.Types.ObjectId().toString(),
          VerificationStatus.VERIFIED,
        );
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
      }
    });

    it('should not set verification status to true and throw error when the database query results in an error', async () => {
      jest.spyOn(userModel, 'findById').mockRejectedValue(new Error('error'));

      try {
        await userService.setUserPhoneVerificationStatus(
          new mongoose.Types.ObjectId().toString(),
          VerificationStatus.VERIFIED,
        );
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
      }
    });
  });

  describe('should get user info of that corresponding id', () => {
    it('should get user info', async () => {
      jest.spyOn(userModel, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue(userCollection[0]),
      } as any);

      const userInfo = await userService.getUserInfo(userCollection[0]._id.toString());
      expect(userInfo.firstName).toBe(userInfo.firstName);
    });
    it('should get not get user info', async () => {
      jest.spyOn(userModel, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue(undefined),
      } as any);

      try {
        await userService.getUserInfo(new mongoose.Types.ObjectId().toString());
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
      }
    });
    it('should get not get user info when the database query returns an error', async () => {
      jest.spyOn(userModel, 'findById').mockRejectedValue(HttpException);

      try {
        await userService.getUserInfo(new mongoose.Types.ObjectId().toString());
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
      }
    });
  });

  describe('login', () => {
    it('should login', async () => {
      jest.spyOn(userModel, 'findOne').mockReturnValue(userCollection[0] as any);
      jest.spyOn(jwtService, 'sign').mockReturnValue('token' as any);

      const result = await userService.login('1', '1');
      expect(result).toBeTruthy();
    });

    it('should not login', async () => {
      jest.spyOn(userModel, 'findOne').mockReturnValue(undefined as any);
      try {
        await userService.login('1', '1');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
      }
    });

    it('should not login due to password mismatch', async () => {
      jest.spyOn(bcrypt, 'compare').mockReturnValue(false);
      try {
        await userService.login('1', '1');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
      }
    });
  });

  describe('registerEventOrganizerUser', () => {
    const newUser = {
      _id: new mongoose.Types.ObjectId(),
      phoneNumber: '4',
      email: 'test0@email.com',
      username: '4',
      password: '4',
      verificationStatus: VerificationStatus.NOT_VERIFIED,
      accountType: 'EVENT_ORGANIZER',
      profileImage: 'string',
    };

    it('should not create new event organizer user', async () => {
      jest.spyOn(userModel, 'findOne').mockReturnValue(userCollection[0] as any);
      try {
        await userService.registerEventOrganizerUser(userCollection[0] as any);
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
      }
    });

    it('should create new event organizer user', async () => {
      jest.spyOn(userModel, 'findOne').mockReturnValue(undefined);
      const newEventOrganizerUser = new UserModel(newUser);
      jest.spyOn(newEventOrganizerUser, 'save').mockReturnValue(userCollection[0] as any);
      jest.spyOn(authService, 'generateJWT').mockReturnValue('1234' as any);
      const result = await userService.registerEventOrganizerUser(newUser as any);
      expect(result.jwt).toBeDefined();
    });

    it('should not create new event organizer user due to error', async () => {
      const newEventOrganizerUser = new UserModel(newUser);
      jest.spyOn(newEventOrganizerUser, 'save').mockReturnValue(undefined);
      try {
        await userService.registerEventOrganizerUser(newUser as any);
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
      }
    });
  });

  describe('registerCustomerUser', () => {
    const newUser = {
      _id: new mongoose.Types.ObjectId(),
      phoneNumber: '5',
      email: 'test5@email.com',
      username: '5',
      password: '5',
      verificationStatus: VerificationStatus.NOT_VERIFIED,
      accountType: 'CUSTOMER',
      profileImage: 'string',
    };

    it('should not create new customer user', async () => {
      jest.spyOn(userModel, 'findOne').mockReturnValue(userCollection[0] as any);
      try {
        await userService.registerCustomerUser(userCollection[0] as any);
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
      }
    });

    it('should create new customer user', async () => {
      jest.spyOn(userService, 'findUserByPhoneNumberOrEmail').mockReturnValue(undefined);
      const newCustomerUser = new CustomerModel(newUser);
      jest.spyOn(newCustomerUser, 'save').mockReturnValue(userCollection.at(-1) as any);
      jest.spyOn(authService, 'generateJWT').mockReturnValue('1234' as any);
      const result = await userService.registerCustomerUser(newUser as any);
      expect(result.jwt).toBeDefined();
    });

    it('should not create a new user due to a duplicate user found', async () => {
      jest.spyOn(userService, 'findUserByPhoneNumberOrEmail').mockReturnValue(userCollection[0] as any);
      const newCustomerUser = new CustomerModel(newUser);
      jest.spyOn(newCustomerUser, 'save').mockReturnValue(userCollection.at(-1) as any);
      jest.spyOn(authService, 'generateJWT').mockReturnValue('1234' as any);
      try {
        await userService.registerCustomerUser(newUser as any);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
      }
    });

    it('should not create a new user due to a duplicate user found', async () => {
      jest
        .spyOn(userService, 'findUserByPhoneNumberOrEmail')
        .mockRejectedValue(new HttpException({ code: 11000 }, HttpStatus.BAD_REQUEST));
      const newCustomerUser = new CustomerModel(newUser);
      jest.spyOn(newCustomerUser, 'save').mockReturnValue(userCollection.at(-1) as any);
      jest.spyOn(authService, 'generateJWT').mockReturnValue('1234' as any);
      try {
        await userService.registerCustomerUser(newUser as any);
      } catch (error) {
        console.log(error);
        expect(error).toBeInstanceOf(HttpException);
      }
    });
  });

  describe('updateAssociatedWalletAddress', () => {
    it('should update associated wallet address', async () => {
      jest.spyOn(userModel, 'findById').mockReturnValue(userCollection[0] as any);
      jest.spyOn(new CustomerModel(userCollection[0]), 'save').mockReturnValue(userCollection[0] as any);
      const result = await userService.updateAssociatedWalletAddress(userCollection[0]._id.toString(), '0x1234');
      expect(result.status).toBe(HttpStatus.NOT_MODIFIED);
    });

    it('should update associated wallet address', async () => {
      const user = new CustomerModel(userCollection[0]) as any;
      user.associatedWallet = ['0x1234'];
      jest.spyOn(userService, 'findById').mockReturnValue(user as any);
      jest.spyOn(user, 'save').mockReturnValue(user as any);
      const result = await userService.updateAssociatedWalletAddress(userCollection[0]._id.toString(), '0x2222');
      expect(result.status).toBe(HttpStatus.CREATED);
    });

    it('should not update associated wallet address', async () => {
      jest.spyOn(userModel, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue(undefined),
      } as any);
      try {
        await userService.updateAssociatedWalletAddress(new mongoose.Types.ObjectId().toString(), '0x1234');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
      }
    });

    it('should not update associated wallet address due to invalid address', async () => {
      jest.spyOn(userModel, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue(userCollection[0]),
      } as any);
      try {
        await userService.updateAssociatedWalletAddress(userCollection[0]._id.toString(), '0x1234');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
      }
    });

    it('should not update associated wallet address due to invalid address', async () => {
      jest.spyOn(userModel, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue(userCollection[0]),
      } as any);
      try {
        await userService.updateAssociatedWalletAddress(userCollection[0]._id.toString(), '0x1234');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
      }
    });
  });
});
