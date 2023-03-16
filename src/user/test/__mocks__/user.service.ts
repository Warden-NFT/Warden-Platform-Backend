import { UserTestRepository } from '../user.repository';
import { Verification, VerificationStatus } from 'src/user/user.interface';

export const MockUserService = {
  findById: (users: UserTestRepository[], id: string): UserTestRepository | undefined => {
    const user = users.find((user) => user._id === id);
    return user;
  },
  findByPhoneNumber: (users: UserTestRepository[], phone: string) => {
    const user = users.find((user) => user.phoneNumber === phone);
    return user;
  },
  findUserByPhoneNumberOrEmail: (users: UserTestRepository[], phone: string | undefined, email: string | undefined) => {
    const user = users.find(
      (user) => (user.phoneNumber && user.phoneNumber === phone) || (user.email && user.email === email),
    );
    return user;
  },
  registerCustomerUser: (users: UserTestRepository[], user: UserTestRepository) => {
    const _user = { ...user };
    _user.accountType = 'CUSTOMER';
    return [...users, _user];
  },

  registerEventOrganizerUser: (users: UserTestRepository[], user: UserTestRepository) => {
    const _user = { ...user };
    _user.accountType = 'EVENT_ORGANIZER';
    return [...users, _user];
  },

  async login(users: UserTestRepository[], phone: string, password: string) {
    const user = users.find((user) => user.phoneNumber === phone);
    if (user && user.password === password) {
      return user;
    }
    return undefined;
  },

  setUserPhoneVerificationStatus(
    users: UserTestRepository[],
    userId: string,
    status: Verification,
  ): UserTestRepository {
    const user = this.findById(users, userId);
    if (user) {
      user.verificationStatus = status;
    }
    return user;
  },

  getUserInfo(users: UserTestRepository[], userId: string): UserTestRepository | undefined {
    const user = this.findById(users, userId);
    if (!user) {
      throw Error(`User id #${userId} not found`);
    }
    return user;
  },
};
