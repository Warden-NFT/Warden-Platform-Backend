import { ROLE } from '../../common/roles';
import { getUsers, UserTestRepository } from './test/user.repository';
import { MockUserService } from './test/__mocks__/user.service';
import { VerificationStatus } from './user.interface';

describe('UserService', () => {
  let users: UserTestRepository[] = [];

  beforeEach(async () => {
    users = [...getUsers()];
  });

  it('should return user with correct ID', () => {
    expect(MockUserService.findById(users, '1')).toBe(users[0]);
  });

  it('should return undefined user with wrong ID', () => {
    expect(MockUserService.findById(users, '-1')).toBe(undefined);
  });

  it('should return user with corresponding ID', () => {
    expect(MockUserService.findByPhoneNumber(users, '1')).toBe(users[0]);
  });

  it('should return user with corresponding phone number', () => {
    expect(MockUserService.findByPhoneNumber(users, '1')).toBe(users[0]);
  });

  it('should return undefined user with wrong phone number', () => {
    expect(MockUserService.findByPhoneNumber(users, '1')).toBe(users[0]);
  });

  it('should return user with corresponding phone number', () => {
    expect(MockUserService.findUserByPhoneNumberOrEmail(users, '1', undefined)).toBe(users[0]);
  });

  it('should return user with corresponding email', () => {
    expect(MockUserService.findUserByPhoneNumberOrEmail(users, undefined, 'test1@email.com')).toBe(users[0]);
  });

  it('should return user with corresponding phone number', () => {
    expect(MockUserService.findUserByPhoneNumberOrEmail(users, '1', undefined)).toBe(users[0]);
  });

  it('should return undefined user from incorrect email', () => {
    expect(MockUserService.findUserByPhoneNumberOrEmail(users, undefined, 'test999@email.com')).toBe(undefined);
  });

  it('should insert new customer user into list of users', () => {
    const user: UserTestRepository = {
      _id: '5',
      phoneNumber: '5',
      email: 'test5@email.com',
      username: 'test5',
      password: 'password',
      verificationStatus: VerificationStatus.NOT_VERIFIED,
      accountType: 'EVENT_ORGANIZER', // to see if accountType has been changed to 'CUSTOMER'
      profileImage: 'img',
    };

    const userDb = MockUserService.registerCustomerUser(users, user);
    expect(userDb).toHaveLength(5);
    expect(userDb.at(-1)._id).toBe('5');
    expect(userDb.at(-1).accountType).toBe('CUSTOMER');
  });

  it('should insert new event organizer user into list of users', () => {
    const user: UserTestRepository = {
      _id: '5',
      phoneNumber: '5',
      email: 'test5@email.com',
      username: 'test5',
      password: 'password',
      verificationStatus: VerificationStatus.NOT_VERIFIED,
      accountType: 'CUSTOMER', // to see if accountType has been changed to 'CUSTOMER'
      profileImage: 'img',
    };

    const userDb = MockUserService.registerEventOrganizerUser(users, user);
    expect(userDb).toHaveLength(5);
    expect(userDb.at(-1)._id).toBe('5');
    expect(userDb.at(-1).accountType).toBe('EVENT_ORGANIZER');
  });

  it('should return user of that login credentials', async () => {
    const user = await MockUserService.login(users, '1', 'password');
    expect(user._id).toBe('1');
  });

  it('should return user of incorect login credentials [phone]', async () => {
    expect(await MockUserService.login(users, '-1', 'password')).toBe(undefined);
  });

  it('should return user of incorect login credentials [password]', async () => {
    expect(await MockUserService.login(users, '2', 'programming_is_fun')).toBe(undefined);
  });

  it('should set phone verification status', () => {
    const user = MockUserService.setUserPhoneVerificationStatus(users, '1', VerificationStatus.VERIFIED);
    expect(user._id).toBe('1');
    expect(user.verificationStatus).toBe(VerificationStatus.VERIFIED);
  });

  it('should return user info', () => {
    const user = MockUserService.getUserInfo(users, '1');
    expect(user._id).toBe('1');
  });

  it('should return user info', () => {
    const userId = '1';
    const user = MockUserService.getUserInfo(users, userId);
    expect(user._id).toBe('1');
  });

  it('should return Error', () => {
    const userId = '-1';
    try {
      const user = MockUserService.getUserInfo(users, userId);
      expect(user).toBe(undefined);
    } catch (e) {
      expect(e.message).toBe(`User id #${userId} not found`);
    }
  });
});
