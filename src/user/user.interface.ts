import { Role, ROLE } from 'common/roles';
import * as mongoose from 'mongoose';

export type Verification = 'NotVerified' | 'Verified';

export interface User extends mongoose.Document {
  phoneNumber: string;
  email: string;
  username: string;
  password: string;
  verificationStatus: Verification;
  accountType: Role;
}

export interface CustomerUser extends User {
  firstName: string;
  lastName: string;
  accountType: ROLE.CUSTOMER;
}

export interface EventOrganizerUser extends User {
  organizationName: string;
  accountType: ROLE.EVENT_ORGANIZER;
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
