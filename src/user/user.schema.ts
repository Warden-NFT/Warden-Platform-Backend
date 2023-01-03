import { HttpException, HttpStatus } from '@nestjs/common';
import * as mongoose from 'mongoose';

const verificationSchemaType = {
  type: String,
  enum: ['NotVerified', 'Verified'],
};

class UserSchemaClass extends mongoose.Schema {
  constructor(definition?: mongoose.SchemaDefinition) {
    super(definition, { discriminatorKey: 'accountType' });
    this.add({
      phoneNumber: String,
      email: String,
      username: String,
      password: String,
      verificationStatus: verificationSchemaType,
    });

    this.methods.editAccountInfo = function (updt): void {
      // TODO: Add type
      this.email = updt.email ?? this.email;
      this.phoneNumber = updt.phoneNumber ?? this.phoneNumber;
    };

    this.methods.setPassword = function (hashedPassword: string) {
      this.password = hashedPassword;
    };

    this.methods.getPassword = function () {
      if (this.password) return this.password;
      else throw new HttpException('password does not exist', HttpStatus.INTERNAL_SERVER_ERROR);
    };
  }
}

export const UserSchema = new UserSchemaClass();
UserSchema.index({ username: 1 }, { unique: true });

class CustomerSchemaClass extends UserSchemaClass {
  constructor() {
    super({
      firstName: String,
      lastName: String,
    }); // TODO: TBA when there are more details
  }
}

export const CustomerSchema = new CustomerSchemaClass();

class EventOrganizerSchemaClass extends UserSchemaClass {
  constructor() {
    super({
      organizationName: String,
    }); // TODO: TBA when there are more details
  }
}

export const EventOrganizerSchema = new EventOrganizerSchemaClass();
