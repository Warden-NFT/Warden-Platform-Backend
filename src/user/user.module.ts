import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AuthModule } from 'src/auth/auth.module';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { CustomerSchema, EventOrganizerSchema, UserSchema } from './user.schema';
import { ConfigModule } from '@nestjs/config';

const customerProviderFactory = {
  provide: getModelToken('Customer'),
  useFactory: (userModel) => userModel.discriminator('Customer', CustomerSchema),
  inject: [getModelToken('User')],
};
const eventOrganizerProviderFactory = {
  provide: getModelToken('EventOrganizer'),
  useFactory: (userModel) => userModel.discriminator('EventOrganizer', EventOrganizerSchema),
  inject: [getModelToken('User')],
};

@Module({
  imports: [
    ConfigModule,
    forwardRef(() => AuthModule),
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema, collection: 'users' }]),
  ],
  controllers: [UserController],
  providers: [customerProviderFactory, eventOrganizerProviderFactory, UserService],
  exports: [
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema, collection: 'users' }]),
    customerProviderFactory,
    eventOrganizerProviderFactory,
    UserService,
  ],
})
export class UserModule {}
