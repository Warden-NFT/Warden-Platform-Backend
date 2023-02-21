import { Module } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { TicketController } from './ticket.controller';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TicketCollectionSchema } from './ticket.schema';
import { StorageModule } from 'src/storage/storage.module';
import { EventModule } from 'src/event/event.module';
import { EventService } from 'src/event/event.service';
import { EventSchema } from 'src/event/event.schema';

@Module({
  imports: [
    ConfigModule,
    StorageModule,
    MongooseModule.forFeature([
      { name: 'TicketCollection', schema: TicketCollectionSchema, collection: 'tickets' },
      { name: 'Event', schema: EventSchema, collection: 'events' },
    ]),
    EventModule,
  ],
  providers: [TicketService, EventService],
  controllers: [TicketController],
})
export class TicketModule {}
