import { forwardRef, Global, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AuthModule } from 'src/auth/auth.module';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { CustomerSchema, EventOrganizerSchema, UserSchema } from './user.schema';
import { ConfigModule } from '@nestjs/config';
import { StorageModule } from '../storage/storage.module';
import { StorageService } from '../storage/storage.service';

const customerProviderFactory = {
  provide: getModelToken('Customer'),
  useFactory: (userModel) => userModel.discriminator('CUSTOMER', CustomerSchema),
  inject: [getModelToken('User')],
};
const eventOrganizerProviderFactory = {
  provide: getModelToken('EventOrganizer'),
  useFactory: (userModel) => userModel.discriminator('EVENT_ORGANIZER', EventOrganizerSchema),
  inject: [getModelToken('User')],
};
@Global()
@Module({
  imports: [
    ConfigModule,
    forwardRef(() => AuthModule),
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema, collection: 'users' }]),
    StorageModule,
  ],
  controllers: [UserController],
  providers: [customerProviderFactory, eventOrganizerProviderFactory, UserService, StorageService],
  exports: [
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema, collection: 'users' }]),
    customerProviderFactory,
    eventOrganizerProviderFactory,
    UserService,
  ],
})
export class UserModule {}
