import { Role } from 'common/roles';
import * as mongoose from 'mongoose';

export type Verification = 'NotVerified' | 'Verified';

export enum VerificationStatus {
  NOT_VERIFIED = 'NotVerified',
  VERIFIED = 'Verified',
}

export interface User extends mongoose.Document {
  phoneNumber: string;
  email: string;
  username: string;
  password: string;
  verificationStatus: Verification;
  accountType: Role;
  profileImage: string;
}

export interface CustomerUser extends User {
  firstName: string;
  lastName: string;
  accountType: Role;
}

export interface EventOrganizerUser extends User {
  organizationName: string;
  accountType: Role;
}

export interface UserGeneralInfo {
  phoneNumber: string;
  email: string;
  username: string;
  verificationStatus: Verification;
  accountType: Role;
  firstName?: string;
  lastName?: string;
  organizationName?: string;
}
