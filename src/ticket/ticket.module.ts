import { Module } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { TicketController } from './ticket.controller';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TicketSetSchema } from './ticket.schema';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([{ name: 'TicketSet', schema: TicketSetSchema, collection: 'tickets' }]),
  ],
  providers: [TicketService],
  controllers: [TicketController],
})
export class TicketModule {}
