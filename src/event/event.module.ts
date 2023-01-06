import { Module } from '@nestjs/common';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { EventSchema } from './event.schema';

@Module({
  imports: [ConfigModule, MongooseModule.forFeature([{ name: 'User', schema: EventSchema, collection: 'users' }])],
  providers: [EventService],
  controllers: [EventController],
  exports: [EventService],
})
export class EventModule {}
