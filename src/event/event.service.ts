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

  async updateEvent(
    dto: UpdateEventDTO,
    eventOrganizerId: string,
    image: Express.Multer.File | undefined,
  ): Promise<Event> {
    try {
      const event: Event = await this.eventModel.findById(dto.eventId);
      const isEventOwner = event.organizerId === eventOrganizerId;
      if (!isEventOwner) throw new UnauthorizedException('You are not the event owner');
      if (image) {
        await this.storageService.save(`media/${event._id}/cover`, image.mimetype, image.buffer, [
          { mediaId: 'cover' },
        ]);
      }
      dto.image = `https://storage.googleapis.com/nft-generator-microservice-bucket-test/media/${event._id}/cover`;
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
      console.log({ event });
      const isEventOwner = event.organizerId === eventOrganizerId;
      if (!isEventOwner) throw new UnauthorizedException('You are not the event owner');
      // If the user uploaded the event cover image, save it to GCS
      await this.storageService.save(`media/${eventId}/cover`, image.mimetype, image.buffer, [{ mediaId: 'cover' }]);
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
