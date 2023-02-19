import { Module } from '@nestjs/common';
import { MarketService } from './market.service';
import { MarketController } from './market.controller';
import { ConfigModule } from '@nestjs/config';
import { StorageModule } from 'src/storage/storage.module';
import { MongooseModule } from '@nestjs/mongoose';
import { MarketSchema } from './market.schema';
import { EventModule } from 'src/event/event.module';
import { EventSchema } from 'src/event/event.schema';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: 'Market', schema: MarketSchema, collection: 'market' },
      { name: 'Event', schema: EventSchema, collection: 'events' },
    ]),
    StorageModule,
    EventModule,
  ],
  providers: [MarketService],
  controllers: [MarketController],
})
export class MarketModule {}
