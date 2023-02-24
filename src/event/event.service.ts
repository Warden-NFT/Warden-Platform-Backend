import { HttpException, HttpStatus, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StorageService } from 'src/storage/storage.service';
import { EventDTO, UpdateEventDTO } from './event.dto';
import { Event } from './interfaces/event.interface';

@Injectable()
export class EventService {
  constructor(@InjectModel('Event') private eventModel: Model<Event>, private storageService: StorageService) {}

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
    try {
      const existingEvent = await this.eventModel.findById(eventId).exec();
      if (!existingEvent) {
        throw new NotFoundException(`Event #${eventId} not found`);
      }
      return existingEvent;
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

  /**
   *
   * @param {string} eventOrganizerId: event organizer ID
   * @param {boolean} unlisted: true when querying for events without a linked ticket only
   * @returns
   */
  async getEventFromEventOrganizer(eventOrganizerId: string, unlisted: boolean): Promise<Event[]> {
    try {
      let events: Event[] = await this.eventModel.find({ organizerId: eventOrganizerId }).sort({ _id: 'desc' }).exec();
      if (!events) {
        throw new NotFoundException(`Events from #${eventOrganizerId} not found`);
      }
      if (unlisted) {
        events = events.map((event) => {
          if (!event.ticketCollectionId) return event;
        });
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

  async updateEvent(dto: UpdateEventDTO, eventOrganizerId: string): Promise<Event> {
    try {
      const event: Event = await this.eventModel.findById(dto.eventId);
      const isEventOwner = event.organizerId === eventOrganizerId;
      if (!isEventOwner) throw new UnauthorizedException('You are not the event owner');
      const updatedEvent = await this.eventModel.findByIdAndUpdate(dto.eventId, dto, { new: true });
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

  async uploadEventImage(eventOrganizerId: string, eventId: string, image: Express.Multer.File) {
    try {
      const event: Event = await this.eventModel.findById(eventId);
      const isEventOwner = event.organizerId === eventOrganizerId;
      if (!isEventOwner) throw new UnauthorizedException('You are not the event owner');
      // If the user uploaded the event cover image, save it to GCS
      await this.storageService.save(`media/${eventId}/cover`, image.mimetype, image.buffer);
      const newImageUrl = `https://storage.googleapis.com/nft-generator-microservice-bucket-test/media/${eventId}/cover`;
      event.image = newImageUrl;
      const updatedEvent = await this.eventModel.findByIdAndUpdate(eventId, { image: newImageUrl }, { new: true });
      return updatedEvent.image;
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
