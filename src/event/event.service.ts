import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventDTO } from './event.dto';
import { Event } from './event.interface';

@Injectable()
export class EventService {
  constructor(@InjectModel('Event') private eventModel: Model<Event>) {}

  async createEvent(dto: EventDTO) {
    //: Promise<Event>
    console.log('HI');
    return 'HI';
  }
}
