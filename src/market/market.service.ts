import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ROLE } from 'common/roles';
import mongoose, { Model } from 'mongoose';
import { EventService } from 'src/event/event.service';
import { Event } from 'src/event/interfaces/event.interface';
import { StorageService } from 'src/storage/storage.service';
import { EventOrganizerUser } from 'src/user/user.interface';
import { UserService } from 'src/user/user.service';
import { throwBadRequestError } from 'src/utils/httpError';
import { EventSearchDTO, MarketEveventDTO } from './dto/market.dto';
import { Market } from './interface/market.interface';

@Injectable()
export class MarketService {
  constructor(
    @InjectModel('Event') private eventModel: Model<Event>,
    @InjectModel('Market') private marketModel: Model<Market>,
    private eventService: EventService,
    private userService: UserService,
    private storageService: StorageService,
  ) {}

  // Set the featured Events ID array
  async setFeaturedEvents(featuredEventIds): Promise<Market> {
    try {
      const res = await this.marketModel.findOne();
      if (res) {
        res.featuredEvents = featuredEventIds;
        res.save();
      } else {
        const newFeaturedEvents = new this.marketModel(featuredEventIds);
        return await newFeaturedEvents.save();
      }
    } catch (error) {
      throwBadRequestError(error);
    }
  }

  // Get the featured events detail
  async getFeaturedEvents(): Promise<Event[]> {
    try {
      const res = await this.marketModel.findOne();
      const featuredEventIds = res.featuredEvents;
      const featuredEvents = this.eventModel.find({
        _id: {
          $in: featuredEventIds.map((id) => new mongoose.Types.ObjectId(id)),
        },
      });
      return featuredEvents;
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_IMPLEMENTED,
          message: error.message,
        },
        HttpStatus.NOT_IMPLEMENTED,
      );
    }
  }

  // Get the n latest events
  async getLatestEvents(limit: number, createdOnBefore?: string): Promise<Event[]> {
    try {
      if (createdOnBefore) {
        const latestEvents = await this.eventModel
          .find({ _id: { $gt: new mongoose.Types.ObjectId(createdOnBefore) } })
          .sort({ _id: 'asc' })
          .limit(limit);
        return latestEvents;
      } else {
        const latestEvents = await this.eventModel.find().sort({ _id: 'asc' }).limit(limit);
        return latestEvents;
      }
    } catch (error) {
      throwBadRequestError(error);
    }
  }

  // Search events
  async searchEvents(eventSearchDTO: EventSearchDTO): Promise<Event[]> {
    const { searchTerm, startDate, endDate, location } = eventSearchDTO;
    try {
      // Create the search query
      const searchQuery = {
        $or: [],
      };
      if (searchTerm) {
        // Search event name
        searchQuery.$or.push({ name: { $regex: searchTerm, $options: 'i' } });
        // Search event description
        searchQuery.$or.push({ description: { $regex: searchTerm, $options: 'i' } });
        // Search for events which keywords contains the search term
        searchQuery.$or.push({ eventKeywords: { $in: [searchTerm] } });
      }
      if (startDate) searchQuery.$or.push({ startDate: { $gte: startDate, $lte: endDate } });
      if (endDate) searchQuery.$or.push({ endDate: { $gte: startDate, $lte: endDate } });
      if (location) searchQuery.$or.push({ 'location.description': { $regex: location, $options: 'i' } });
      const scoreWeights = {
        name: 5,
        eventKeywords: 3,
        description: 2,
        startDate: 2,
        endDate: 2,
        location: 1,
      };

      // Find the event
      const events = await this.eventModel.find(searchQuery).lean().exec();

      // Rank the events based on the score
      events.forEach((event) => {
        let score = 0;
        Object.keys(scoreWeights).forEach((key) => {
          if (event[key]) {
            score += scoreWeights[key];
          }
        });
        event.score = score;
      });
      events.sort((a, b) => b.score - a.score);

      return events;
    } catch (error) {
      throwBadRequestError(error);
    }
  }

  async getMarketEvents(organizerId: string): Promise<MarketEveventDTO> {
    try {
      const _organizerInfo = await this.userService.findById(organizerId);
      const organizerInfo = _organizerInfo as EventOrganizerUser;
      if (organizerInfo.accountType !== ROLE.EVENT_ORGANIZER) {
        throw new NotFoundException('Event organizer with ID does not exist');
      }
      const events = await this.eventService.getEventFromEventOrganizer(organizerId);

      const marketEvents = {
        organizerInfo,
        events,
      };
      return marketEvents;
    } catch (error) {
      throwBadRequestError(error);
    }
  }
}
