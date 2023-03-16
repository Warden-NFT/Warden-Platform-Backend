import { Role } from 'common/roles';
import { Verification, VerificationStatus } from '../user.interface';

export interface UserTestRepository {
  _id?: string;
  phoneNumber: string;
  email: string;
  username: string;
  password: string;
  verificationStatus: Verification;
  accountType: Role;
  profileImage: string;
  organizationName?: string;
  firstName?: string;
  lastName?: string;
}

export function getUsers(): UserTestRepository[] {
  return [
    {
      _id: '1',
      phoneNumber: '1',
      email: 'test1@email.com',
      username: 'test1',
      password: 'password',
      verificationStatus: VerificationStatus.NOT_VERIFIED,
      accountType: 'CUSTOMER',
      profileImage: 'img',
      firstName: '1',
      lastName: '1',
    },
    {
      _id: '2',
      phoneNumber: '2',
      email: 'test2@email.com',
      username: 'test2',
      password: 'password',
      verificationStatus: VerificationStatus.VERIFIED,
      accountType: 'CUSTOMER',
      profileImage: 'img',
      firstName: '2',
      lastName: '2',
    },
    {
      _id: '3',
      phoneNumber: '3',
      email: 'test3@email.com',
      username: 'test3',
      password: 'password',
      verificationStatus: VerificationStatus.VERIFIED,
      accountType: 'EVENT_ORGANIZER',
      profileImage: 'img',
      organizationName: '3',
    },
    {
      _id: '4',
      phoneNumber: '4',
      email: 'test4@email.com',
      username: 'test4',
      password: 'password',
      verificationStatus: VerificationStatus.NOT_VERIFIED,
      accountType: 'EVENT_ORGANIZER',
      profileImage: 'img',
      organizationName: '3',
    },
  ];
}
