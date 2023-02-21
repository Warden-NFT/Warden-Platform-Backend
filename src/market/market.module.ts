import { Module } from '@nestjs/common';
import { MarketService } from './market.service';
import { MarketController } from './market.controller';
import { ConfigModule } from '@nestjs/config';
import { StorageModule } from 'src/storage/storage.module';
import { MongooseModule } from '@nestjs/mongoose';
import { MarketSchema } from './market.schema';
import { EventModule } from 'src/event/event.module';
import { EventSchema } from 'src/event/event.schema';
import { EventService } from 'src/event/event.service';
import { UserModule } from 'src/user/user.module';
import { UserService } from 'src/user/user.service';
import { AuthModule } from 'src/auth/auth.module';
import { TicketModule } from 'src/ticket/ticket.module';
import { TicketService } from 'src/ticket/ticket.service';
import { TicketCollectionSchema } from 'src/ticket/ticket.schema';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: 'Market', schema: MarketSchema, collection: 'market' },
      { name: 'Event', schema: EventSchema, collection: 'events' },
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
