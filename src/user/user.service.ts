import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuthService } from 'src/auth/auth.service';
import {
  CreateCustomerUserDTO,
  CreateEventOrganizerUserDTO,
  SuccessfulLoginDTO,
  SuccessfulRegisterDTO,
} from './dto/user.dto';
import { Account, CustomerUser, EventOrganizerUser, User } from './user.interface';
import * as bcrypt from 'bcrypt';
import { DuplicateElementException } from './user.exception';
import { Role } from 'common/roles';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('User') private userModel: Model<User>,
    @InjectModel('Customer') private customerModel: Model<CustomerUser>,
    @InjectModel('EventOrganizer') private eventOrganizerModel: Model<EventOrganizerUser>,

    private authService: AuthService,
  ) {}

  async find(filter, select?: string, accountType?: Account): Promise<User[]> {
    let model: Model<User> | Model<CustomerUser> | Model<EventOrganizerUser>;
    switch (accountType) {
      case Account.Customer:
        model = this.customerModel;
        break;
      case Account.EventOrganizer:
        model = this.eventOrganizerModel;
        break;
      default:
        model = this.userModel;
        break;
    }
    return await (model as Model<User>).find(filter).select(select);
  }

  async findByPhoneNumber(phoneNumber: string): Promise<User> {
    const user = await this.userModel.findOne({ phoneNumber });
    return user;
  }

  async registerCustomerUser(user: CreateCustomerUserDTO): Promise<SuccessfulRegisterDTO> {
    // Check duplicate phone number
    const existingUser = await this.userModel.findOne({
      $or: [{ phoneNumber: user.phoneNumber }, { email: user.email }],
    });
    if (existingUser) throw new DuplicateElementException('Phone number or email');

    try {
      // Create a new user
      const newUser = new this.customerModel(user);
      newUser.password = await this.authService.hashPassword(user.password);
      const [createdUser, jwt] = [await newUser.save(), this.authService.generateJWT(newUser._id, 'Customer')];
      await createdUser.save();
      return {
        status: HttpStatus.CREATED,
        message: 'The user has been created successfully',
        jwt,
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
    }
  }

  async registerEventOrganizerUser(user: CreateEventOrganizerUserDTO): Promise<SuccessfulRegisterDTO> {
    // Check duplicate phone number
    const existingUser = await this.userModel.findOne({
      $or: [{ phoneNumber: user.phoneNumber }, { email: user.email }],
    });
    if (existingUser) throw new DuplicateElementException('Phone number or email');

    try {
      // Create a new user
      const newUser = new this.eventOrganizerModel(user);
      newUser.password = await this.authService.hashPassword(user.password);
      const [createdUser, jwt] = [await newUser.save(), this.authService.generateJWT(newUser._id, 'Customer')];
      await createdUser.save();
      return {
        status: HttpStatus.CREATED,
        message: 'The user has been created successfully',
        jwt,
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
    }
  }

  async login(phoneNumber: string, password: string): Promise<SuccessfulLoginDTO> {
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
    const role: Role = user['organizationName'] ? Account.EventOrganizer : Account.Customer;
    const jwt = await this.authService.generateJWT(user._id, role);
    return {
      status: HttpStatus.CREATED,
      message: 'Login successful',
      jwt,
    };
  }
}
