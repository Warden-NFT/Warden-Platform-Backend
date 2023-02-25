import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventService } from 'src/event/event.service';
import { MarketEventTicketPreviewsDTO } from 'src/market/dto/market.dto';
import { StorageService } from 'src/storage/storage.service';
import { throwBadRequestError } from 'src/utils/httpError';
import { DeleteResponseDTO } from 'src/utils/httpResponse.dto';
import { TicketDTO, TicketCollectionDTO, updateTicketCollectionImagesDTO, VIPTicketDTO } from './ticket.dto';
import { Ticket, TicketCollection, TicketTypeKeys } from './ticket.interface';

@Injectable()
export class TicketService {
  constructor(private storageService: StorageService, private eventService: EventService) {}
  @InjectModel('TicketCollection') private ticketCollectionModel: Model<TicketCollection>;

  // Create a record of tickets generated
  async createTicketCollection(
    ticketCollection: TicketCollectionDTO,
    eventOrganizerId: string,
  ): Promise<TicketCollection> {
    try {
      await new this.ticketCollectionModel(ticketCollection).validate();
      const newTicketCollection = await new this.ticketCollectionModel(ticketCollection);
      const event = await this.eventService.getEvent(newTicketCollection.subjectOf);
      if (!event) throw new BadRequestException('Invalid event ID');
      if (event.ticketCollectionId) throw new ConflictException('This event already has a ticket set associated.');

      // Save the ticket
      const savedTicketCollection = await newTicketCollection.save();

      // Save the event
      event.ticketCollectionId = savedTicketCollection._id.toString();
      const updateEventPayload = {
        ...event,
        eventId: savedTicketCollection.subjectOf,
        eventOrganizerId,
      };
      await this.eventService.updateEvent(updateEventPayload, eventOrganizerId);

      // Return the ticket set created
      return savedTicketCollection;
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

  // Get the ticket set information by ID
  async getTicketCollectionByID(ticketCollectionId: string): Promise<TicketCollection> {
    try {
      const ticketCollection = await this.ticketCollectionModel.findById(ticketCollectionId);
      if (!ticketCollection) throw new NotFoundException(`Ticket set #${ticketCollectionId} not found`);
      return ticketCollection;
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

  // Get the ticket information by ID
  async getTicketByID(ticketCollectionId: string, ticketId: string): Promise<Ticket> {
    try {
      const ticketCollection = await this.ticketCollectionModel.findById(ticketCollectionId);
      if (!ticketCollection) throw new NotFoundException(`Ticket #${ticketCollectionId} not found`);
      let matchedTicket;
      TicketTypeKeys.forEach((key) => {
        const matchingTicket = ticketCollection.tickets[key].find((ticket) => ticket._id.toString() === ticketId);
        if (matchingTicket) {
          matchedTicket = matchingTicket;
        }
      });
      if (!matchedTicket) {
        throw new NotFoundException(`Ticket #${ticketId} not found`);
      }
      return matchedTicket;
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

  // Get all tickets belonging to an event
  async getTicketsOfEvent(eventId: string): Promise<TicketCollection> {
    try {
      const tickets = await this.ticketCollectionModel.findOne({ subjectOf: eventId });
      return tickets;
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

  // Get all tickets belonging to an event
  async getTicketPreviews(eventId: string): Promise<MarketEventTicketPreviewsDTO> {
    try {
      const ticketCollection = await this.ticketCollectionModel.findOne({ subjectOf: eventId }).sort('desc');
      const ticketPreviews = {
        vip: ticketCollection.tickets.vip.slice(0, 1),
        general: ticketCollection.tickets.general.slice(0, 1),
        reservedSeat: ticketCollection.tickets.reservedSeat.slice(0, 1),
      };
      return { tickets: ticketPreviews, ticketPrice: ticketCollection.ticketPrice };
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

  // TODO: This endpoint should be separated into another module "sales"
  // // Get all tickets belonging to a person
  // async getTicketsOfUser(userId: Types.ObjectId): Promise<Ticket[]> {
  //   try {
  //     const tickets = await this.ticketModel.find({ ownerId: userId });
  //     return tickets;
  //   } catch (error) {
  //     throwBadRequestError(error);
  //   }
  // }

  // Update ticket set details
  async updateTicketCollection(ticketCollection: TicketCollectionDTO, ownerId: string): Promise<TicketCollection> {
    try {
      const ticketCollectionToBeUpdated = await this.ticketCollectionModel.findById(ticketCollection._id);
      if (!ticketCollectionToBeUpdated) {
        throw new NotFoundException(`Ticket #${ticketCollection._id} not found`);
      }
      if (ticketCollectionToBeUpdated.ownerId.toString() !== ownerId) {
        throw new UnauthorizedException(`You do not have the permission to edit this ticket set`);
      }
      const a = await this.ticketCollectionModel.findByIdAndUpdate(ticketCollection._id, ticketCollection, {
        new: true,
      });
      return a;
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

  // Update ticket set images
  async updateTicketCollectionImages(
    files: Express.Multer.File[],
    mediaUploadPayload: updateTicketCollectionImagesDTO,
    ownerId: string,
  ) {
    const { folder, metadata, ticketCollectionId } = mediaUploadPayload;
    try {
      const ticketCollectionToBeUpdated = await this.ticketCollectionModel.findById(ticketCollectionId);
      if (ticketCollectionToBeUpdated && ticketCollectionToBeUpdated.ownerId.toString() !== ownerId) {
        throw new UnauthorizedException(`You do not have the permission to edit this ticket set`);
      }
      if (!ticketCollectionToBeUpdated) {
        const filesData = files.map((file) => {
          return {
            path: `media/${folder}/${file.originalname}`,
            contentType: file.mimetype,
            media: file.buffer,
            metadata: JSON.parse(metadata),
          };
        });

        return this.storageService.saveFiles(filesData);
      }
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

  // Update ticket details
  async updateTicket(
    ticket: TicketDTO | VIPTicketDTO,
    ticketCollectionId: string,
    ownerId: string,
  ): Promise<TicketDTO | VIPTicketDTO> {
    try {
      const ticketToBeUpdated = await this.ticketCollectionModel.findById(ticketCollectionId);
      if (!ticketToBeUpdated) {
        throw new NotFoundException(`Ticket set #${ticketCollectionId} not found`);
      }
      if (ticketToBeUpdated.ownerId.toString() !== ownerId) {
        throw new UnauthorizedException(`You do not have the permission to edit this ticket`);
      }
      const ticketCollectionToBeUpdated = await this.ticketCollectionModel.findById(ticketCollectionId);
      const ticketTypes = Object.keys(ticketCollectionToBeUpdated.tickets);
      let _key = '';
      let _index = 0;
      ticketTypes.forEach((key) => {
        ticketCollectionToBeUpdated.tickets[key].forEach((item, index) => {
          if (item._id === ticket._id) {
            ticketCollectionToBeUpdated.tickets[key][index] = {
              ...ticketCollectionToBeUpdated.tickets[key][index],
              ...ticket,
            };
            _key = key;
            _index = index;
          }
        });
      });
      const savedTicketCollection = await ticketCollectionToBeUpdated.save();
      if (savedTicketCollection) {
        return savedTicketCollection.tickets[_key][_index];
      }
    } catch (error) {
      throwBadRequestError(error);
    }
  }

  // Delete an eventset with the specified ID
  async deleteTicket(ticketCollectionId: string, ownerId: string): Promise<DeleteResponseDTO> {
    const ticketCollectionToBeDeleted = await this.ticketCollectionModel.findById(ticketCollectionId);
    if (!ticketCollectionToBeDeleted) {
      throw new NotFoundException(`Ticket set #${ticketCollectionId} not found`);
    }
    if (ticketCollectionToBeDeleted.ownerId.toString() !== ownerId) {
      throw new UnauthorizedException(`You do not have the permission to delete this ticket set`);
    }
    try {
      return await this.ticketCollectionModel.findByIdAndDelete(ticketCollectionId);
    } catch (error) {
      throwBadRequestError(error);
    }
  }
}
