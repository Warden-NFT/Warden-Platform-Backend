import { HttpException, HttpStatus, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StorageService } from 'src/storage/storage.service';
import { throwBadRequestError } from 'src/utils/httpError';
import { DeleteResponseDTO } from 'src/utils/httpResponse.dto';
import { TicketDTO, TicketSetDTO, UpdateTicketSetImagesDTO, VIPTicketDTO } from './ticket.dto';
import { Ticket, TicketSet } from './ticket.interface';

@Injectable()
export class TicketService {
  constructor(private storageService: StorageService) {}
  @InjectModel('TicketSet') private ticketSetModel: Model<TicketSet>;

  // Create a record of tickets generated
  async createTicketSet(ticketSet: TicketSetDTO): Promise<TicketSet> {
    try {
      await new this.ticketSetModel(ticketSet).validate();
      const newTicket = await new this.ticketSetModel(ticketSet);
      return newTicket.save();
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
  async getTicketSetByID(ticketSetId: string): Promise<TicketSet> {
    try {
      const ticketSet = await this.ticketSetModel.findById(ticketSetId);
      if (!ticketSet) throw new NotFoundException(`Ticket set #${ticketSetId} not found`);
      return ticketSet;
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
  async getTicketByID(ticketSetId: string, ticketId: string): Promise<Ticket> {
    try {
      const ticketSet = await this.ticketSetModel.findById(ticketSetId);
      if (!ticketSet) throw new NotFoundException(`Ticket #${ticketSetId} not found`);
      return ticketSet.tickets.find((ticket) => ticket._id === ticketId);
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
  async getTicketsOfEvent(eventId: string): Promise<TicketSet[]> {
    try {
      const tickets = await this.ticketSetModel.find({ subjectOf: eventId });
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
  async updateTicketSet(ticketSet: TicketSetDTO, ownerId: string): Promise<TicketSet> {
    try {
      const ticketSetToBeUpdated = await this.ticketSetModel.findById(ticketSet._id);
      if (!ticketSetToBeUpdated) {
        throw new NotFoundException(`Ticket #${ticketSet._id} not found`);
      }
      if (ticketSetToBeUpdated.ownerId.toString() !== ownerId) {
        throw new UnauthorizedException(`You do not have the permission to edit this ticket set`);
      }
      const a = await this.ticketSetModel.findByIdAndUpdate(ticketSet._id, ticketSet, { new: true });
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
  async updateTicketSetImages(
    files: Express.Multer.File[],
    mediaUploadPayload: UpdateTicketSetImagesDTO,
    ownerId: string,
  ) {
    const { folder, metadata, ticketSetId } = mediaUploadPayload;
    try {
      const ticketSetToBeUpdated = await this.ticketSetModel.findById(ticketSetId);
      if (ticketSetToBeUpdated && ticketSetToBeUpdated.ownerId.toString() !== ownerId) {
        throw new UnauthorizedException(`You do not have the permission to edit this ticket set`);
      }
      if (!ticketSetToBeUpdated) {
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
    ticketSetId: string,
    ownerId: string,
  ): Promise<TicketDTO | VIPTicketDTO> {
    try {
      const ticketToBeUpdated = await this.ticketSetModel.findById(ticketSetId);
      if (!ticketToBeUpdated) {
        throw new NotFoundException(`Ticket set #${ticketSetId} not found`);
      }
      if (ticketToBeUpdated.ownerId.toString() !== ownerId) {
        throw new UnauthorizedException(`You do not have the permission to edit this ticket`);
      }
      const updatedTicketSet = await this.ticketSetModel.findOneAndUpdate(
        { _id: ticketSetId, 'tickets._id': ticket._id },
        { ticket },
      );
      return updatedTicketSet.tickets.find((item) => item._id === ticket._id);
    } catch (error) {
      throwBadRequestError(error);
    }
  }

  // Delete an eventset with the specified ID
  async deleteTicket(ticketSetId: string, ownerId: string): Promise<DeleteResponseDTO> {
    const ticketSetToBeDeleted = await this.ticketSetModel.findById(ticketSetId);
    if (!ticketSetToBeDeleted) {
      throw new NotFoundException(`Ticket set #${ticketSetId} not found`);
    }
    if (ticketSetToBeDeleted.ownerId.toString() !== ownerId) {
      throw new UnauthorizedException(`You do not have the permission to delete this ticket set`);
    }
    try {
      return await this.ticketSetModel.findByIdAndDelete(ticketSetId);
    } catch (error) {
      throwBadRequestError(error);
    }
  }
}
