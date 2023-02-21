import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ROLE } from 'common/roles';
import mongoose, { Model } from 'mongoose';
import { EventService } from 'src/event/event.service';
import { Event } from 'src/event/interfaces/event.interface';
import { TicketService } from 'src/ticket/ticket.service';
import { EventOrganizerUser } from 'src/user/user.interface';
import { UserService } from 'src/user/user.service';
import { throwBadRequestError } from 'src/utils/httpError';
import { EventSearchDTO, MarketEventDTO, MarketTicketDTO, TicketListingInfoDTO } from './dto/market.dto';
import { Market } from './interface/market.interface';

@Injectable()
export class MarketService {
  constructor(
    @InjectModel('Event') private eventModel: Model<Event>,
    @InjectModel('Market') private marketModel: Model<Market>,
    private eventService: EventService,
    private userService: UserService,
    private ticketService: TicketService,
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

  // Get market events (event organizer information and events)
  async getMarketEvents(organizerId: string): Promise<MarketEventDTO> {
    try {
      // Get event organizer info
      const _organizerInfo = await this.userService.findById(organizerId);
      const organizerInfo = _organizerInfo as EventOrganizerUser;
      if (organizerInfo.accountType !== ROLE.EVENT_ORGANIZER) {
        throw new NotFoundException('Event organizer with ID does not exist');
      }

      // Get event info
      const events = await this.eventService.getEventFromEventOrganizer(organizerId, false);

      // Get ticket previews for each event
      const eventTicketPreviews = await Promise.all(
        events.map(async (_event) => {
          return await this.ticketService.getTicketPreviews(_event._id.toString());
        }),
      );

      const marketEvents = {
        organizerInfo,
        events,
        eventTicketPreviews,
      };
      return marketEvents;
    } catch (error) {
      throwBadRequestError(error);
    }
  }

  // Get get market tickets (event organizer, event, tickets)
  async getMarketTickets(eventId: string): Promise<MarketTicketDTO> {
    try {
      // Event Info
      const event = await this.eventModel.findById(eventId);
      // Event Organizer Info
      const _organizerInfo = await this.userService.findById(event.organizerId);
      const organizerInfo = _organizerInfo as EventOrganizerUser;
      // Ticket set
      const ticketCollection = await this.ticketService.getTicketsOfEvent(eventId);

      return {
        organizerInfo,
        event,
        ticketCollection,
      };
    } catch (error) {
      throwBadRequestError(error);
    }
  }

  // Get ticket listing details
  async getTicketListingDetails(
    eventId: string,
    ticketCollectionId: string,
    ticketId: string,
  ): Promise<TicketListingInfoDTO> {
    // Event Info
    const event = await this.eventService.getEvent(eventId);

    // Event Organizer Info
    const _organizerInfo = await this.userService.findById(event.organizerId);
    const organizerInfo = _organizerInfo as EventOrganizerUser;

    // Ticket Info
    const ticket = await this.ticketService.getTicketByID(ticketCollectionId, ticketId);

    return {
      organizerInfo,
      event,
      ticket,
    };
  }
}
