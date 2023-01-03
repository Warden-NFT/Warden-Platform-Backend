import * as mongoose from 'mongoose';

export enum Account {
  Customer = 'Customer',
  EventOrganizer = 'EventOrganizer',
}

export type Verification = 'NotVerified' | 'Verified';

export interface User extends mongoose.Document {
  phoneNumber: string;
  email: string;
  username: string;
  password: string;
  verificationStatus: Verification;
  accountType: Account;
}

export interface CustomerUser extends User {
  firstName: string;
  lastName: string;
  accountType: Account.Customer;
}

export interface EventOrganizerUser extends User {
  organizationName: string;
  accountType: Account.EventOrganizer;
}
