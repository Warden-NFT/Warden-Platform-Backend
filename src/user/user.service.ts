import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model, Types } from 'mongoose';
import { AuthService } from '../auth/auth.service';
import {
  CreateCustomerUserDTO,
  CreateEventOrganizerUserDTO,
  SuccessfulUserModificationDTO,
  SuccessfulVerificationDTO,
  UserGeneralInfoDTO,
  updateAssociatedWalletAddressDTO,
} from './dto/user.dto';
import { CustomerUser, EventOrganizerUser, User, Verification, VerificationStatus } from './user.interface';
import * as bcrypt from 'bcrypt';
import { DuplicateElementException } from './user.exception';
import { Role, ROLE } from '../../common/roles';
import { throwBadRequestError } from '../utils/httpError';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('User') private userModel: Model<User>,
    @InjectModel('Customer') private customerModel: Model<CustomerUser>,
    @InjectModel('EventOrganizer') private eventOrganizerModel: Model<EventOrganizerUser>,

    private authService: AuthService,
    private storageService: StorageService,
  ) {}

  async findById(id: Types.ObjectId | string, select?: string): Promise<User | EventOrganizerUser | CustomerUser> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid Id');
    }
    const user = await this.userModel.findById(id).select(select);
    if (user == null) {
      throw new HttpException(
        {
          reason: 'USER_NOT_FOUND',
          message: 'User not found',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return user;
  }

  async findByPhoneNumber(phoneNumber: string): Promise<User> {
    const user = await this.userModel.findOne({ phoneNumber });
    return user;
  }

  async findUserByPhoneNumberOrEmail(phone: string, email: string) {
    const existingUser = await this.userModel.findOne({
      $or: [{ phoneNumber: phone }, { email: email }],
    });

    return existingUser;
  }

  async registerCustomerUser(
    user: CreateCustomerUserDTO,
    profileImage?: Express.Multer.File,
  ): Promise<SuccessfulUserModificationDTO> {
    // Check duplicate phone number
    const existingUser = await this.findUserByPhoneNumberOrEmail(user.phoneNumber, user.email);
    if (existingUser) throw new DuplicateElementException('Phone number or email');

    const userInfo = {
      ...user,
      accountType: ROLE.CUSTOMER as Role,
      verificationStatus: VerificationStatus.NOT_VERIFIED,
    };
    delete userInfo.password;

    try {
      // Create a new user
      const newUser = new this.customerModel(user);
      newUser.accountType = ROLE.CUSTOMER as Role;
      newUser.verificationStatus = VerificationStatus.NOT_VERIFIED;
      newUser.password = await this.authService.hashPassword(user.password);

      if (profileImage) {
        const uploadProfileImageRes = await this.storageService.saveFiles([
          {
            path: `profile/${newUser._id}/profileImage`,
            contentType: profileImage.mimetype,
            media: profileImage.buffer,
            metadata: undefined,
          },
        ]);
        if (uploadProfileImageRes.success) {
          const profileImageURL = `https://storage.googleapis.com/nft-generator-microservice-bucket-test/profile/${newUser._id}/profileImage`;
          userInfo.profileImage = profileImageURL;
          newUser.profileImage = profileImageURL;
        }
      }

      const [createdUser, jwt] = [
        await newUser.save(),
        this.authService.generateJWT(newUser._id, ROLE.CUSTOMER as Role),
      ];

      if (createdUser && createdUser.password) delete createdUser.password;

      return {
        status: HttpStatus.CREATED,
        message: 'The user has been created successfully',
        jwt,
        user: createdUser,
      };
    } catch (err) {
      if (err.code === 11000) {
        const duplicateKey = Object.keys(err.keyPattern)[0];
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: duplicateKey + ' is already used',
            duplicateKey,
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      throwBadRequestError(err);
    }
  }

  async registerEventOrganizerUser(user: CreateEventOrganizerUserDTO, profileImage?: Express.Multer.File) {
    // Check duplicate phone number
    const existingUser = await this.findUserByPhoneNumberOrEmail(user.phoneNumber, user.email);
    if (existingUser) throw new DuplicateElementException('Phone number or email');

    const userInfo = {
      ...user,
      accountType: ROLE.EVENT_ORGANIZER as Role,
      verificationStatus: VerificationStatus.NOT_VERIFIED,
    };
    delete userInfo.password;

    try {
      // Create a new user
      const newUser = new this.eventOrganizerModel(user);
      newUser.verificationStatus = VerificationStatus.NOT_VERIFIED;
      newUser.password = await this.authService.hashPassword(user.password);

      if (profileImage) {
        const uploadProfileImageRes = await this.storageService.saveFiles([
          {
            path: `profile/${newUser._id}/profileImage`,
            contentType: profileImage.mimetype,
            media: profileImage.buffer,
            metadata: undefined,
          },
        ]);
        if (uploadProfileImageRes.success) {
          const profileImageURL = `https://storage.googleapis.com/nft-generator-microservice-bucket-test/profile/${newUser._id}/profileImage`;
          userInfo.profileImage = profileImageURL;
          newUser.profileImage = profileImageURL;
        }
      }

      const [createdUser, jwt] = [
        await newUser.save(),
        this.authService.generateJWT(newUser._id, ROLE.EVENT_ORGANIZER as Role),
      ];

      if (createdUser && createdUser.password) delete createdUser.password;

      return {
        status: HttpStatus.CREATED,
        message: 'The user has been created successfully',
        jwt: jwt,
        user: createdUser,
      };
    } catch (err) {
      if (err.code === 11000) {
        const duplicateKey = Object.keys(err.keyPattern)[0];
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: duplicateKey + ' is already used',
            duplicateKey,
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      throwBadRequestError(err);
    }
  }

  async login(phoneNumber: string, password: string): Promise<SuccessfulUserModificationDTO> {
    const user: User | CustomerUser | EventOrganizerUser = await this.findByPhoneNumber(phoneNumber);
    const isPasswordMatch = user && (await bcrypt.compare(password, user.password));
    if (!user || !isPasswordMatch) {
      throw new HttpException(
        {
          statusCode: HttpStatus.UNAUTHORIZED,
          message: 'Incorrect username or password',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
    const userInfo = { ...user };
    delete userInfo.password;
    const jwt = await this.authService.generateJWT(user._id, user.accountType);
    return {
      status: HttpStatus.CREATED,
      message: 'Login successful',
      jwt,
      user,
    };
  }

  async setUserPhoneVerificationStatus(userId: string, status: Verification): Promise<SuccessfulVerificationDTO> {
    try {
      const user = await this.findById(userId);
      if (!user) throw new NotFoundException(`User id #${userId} not found`);
      user.verificationStatus = status;
      await user.save();
      return {
        status: HttpStatus.CREATED,
        message: 'The user has been created successfully',
      };
    } catch (error) {
      throwBadRequestError(error);
    }
  }

  async getUserInfo(userId: string): Promise<UserGeneralInfoDTO> {
    try {
      const user = await this.findById(userId);
      if (!user) throw new NotFoundException(`User id #${userId} not found`);
      return user;
    } catch (error) {
      throwBadRequestError(error);
    }
  }

  async updateAssociatedWalletAddress(
    userId: string,
    walletAddress: string,
  ): Promise<updateAssociatedWalletAddressDTO> {
    try {
      const user = await this.findById(userId);
      if (!user) throw new NotFoundException(`User id #${userId} not found`);

      // Check if the wallet address is already associated with the user
      // If yes, don't do anything
      // If no, add the wallet address to the associatedWallet array
      if (user.associatedWallet.includes(walletAddress))
        return {
          status: HttpStatus.NOT_MODIFIED,
          message: 'No changes made to the associated wallets list',
        };
      else {
        user.associatedWallet = [...user.associatedWallet, walletAddress];
      }

      await user.save();
      return {
        status: HttpStatus.CREATED,
        message: 'The user has been created successfully',
      };
    } catch (error) {
      throwBadRequestError(error);
    }
  }
}
