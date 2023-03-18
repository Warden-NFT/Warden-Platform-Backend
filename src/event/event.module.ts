import { Module } from '@nestjs/common';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { EventSchema } from './event.schema';
import { StorageModule } from '../storage/storage.module';
import { UserSchema } from '../user/user.schema';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: 'Event', schema: EventSchema, collection: 'events' },
      { name: 'User', schema: UserSchema, collection: 'users' },
    ]),
    StorageModule,
    UserModule,
  ],
  providers: [EventService],
  controllers: [EventController],
  exports: [EventService],
})
export class EventModule {}
