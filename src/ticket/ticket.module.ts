import { Module } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { TicketController } from './ticket.controller';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TicketCollectionSchema } from './ticket.schema';
import { StorageModule } from '../storage/storage.module';
import { EventModule } from '../event/event.module';
import { EventService } from '../event/event.service';
import { EventSchema } from '../event/event.schema';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    ConfigModule,
    StorageModule,
    MongooseModule.forFeature([
      { name: 'TicketCollection', schema: TicketCollectionSchema, collection: 'tickets' },
      { name: 'Event', schema: EventSchema, collection: 'events' },
    ]),
    EventModule,
    UserModule,
  ],
  providers: [TicketService, EventService],
  controllers: [TicketController],
})
export class TicketModule {}
