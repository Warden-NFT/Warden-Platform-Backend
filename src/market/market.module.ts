import { Module } from '@nestjs/common';
import { MarketService } from './market.service';
import { MarketController } from './market.controller';
import { ConfigModule } from '@nestjs/config';
import { StorageModule } from '../storage/storage.module';
import { MongooseModule } from '@nestjs/mongoose';
import { MarketSchema } from './market.schema';
import { EventModule } from '../event/event.module';
import { EventSchema } from '../event/event.schema';
import { EventService } from '../event/event.service';
import { UserModule } from '../user/user.module';
import { UserService } from '../user/user.service';
import { AuthModule } from '../auth/auth.module';
import { TicketModule } from '../ticket/ticket.module';
import { TicketService } from '../ticket/ticket.service';
import { TicketCollectionSchema } from '../ticket/ticket.schema';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: 'Market', schema: MarketSchema, collection: 'market' },
      { name: 'Event', schema: EventSchema, collection: 'events' },
      { name: 'TicketCollection', schema: TicketCollectionSchema, collection: 'tickets' },
    ]),
    StorageModule,
    EventModule,
    UserModule,
    AuthModule,
    TicketModule,
  ],
  providers: [MarketService, EventService, UserService, TicketService],
  controllers: [MarketController],
})
export class MarketModule {}
