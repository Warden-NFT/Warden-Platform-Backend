import { HttpException, HttpStatus, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventDTO } from './event.dto';
import { Event } from './event.interface';

@Injectable()
export class EventService {
  constructor(@InjectModel('Event') private eventModel: Model<Event>) {}

  async createEvent(dto: EventDTO): Promise<Event> {
    try {
      await new this.eventModel(dto).validate();
      const newEvent = await new this.eventModel(dto);
      return newEvent.save();
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getEvent(eventId: string): Promise<Event> {
    const existingEvent = await this.eventModel.findById(eventId).exec();
    if (!existingEvent) {
      throw new NotFoundException(`Event #${eventId} not found`);
    }
    return existingEvent;
  }

  async getEventFromEventOrganizer(eventOrgagnizerId: string): Promise<Event[]> {
    try {
      const events: Event[] = await this.eventModel.find({ organizerId: eventOrgagnizerId }).exec();
      if (!events) {
        throw new NotFoundException(`Events from #${eventOrgagnizerId} not found`);
      }
      return events;
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async updateEvent(newEvent: EventDTO, eventId: string, eventOrganizerId: string): Promise<Event> {
    try {
      const event: Event = await this.eventModel.findById(eventId);
      const isEventOwner = event.organizerId === eventOrganizerId;
      if (!isEventOwner) throw new UnauthorizedException('You are not the event owner');
      const updatedEvent = await this.eventModel.findByIdAndUpdate(eventId, newEvent, { new: true });
      return updatedEvent;
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async deleteEvent(eventId: string, eventOrganizerId: string) {
    try {
      return await this.eventModel.deleteOne({ _id: eventId, organizerId: eventOrganizerId });
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
