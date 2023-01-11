import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { throwBadRequestError } from 'src/utils/httpError';
import { DeleteResponseDTO, InsertManyResponseDTO } from 'src/utils/httpResponse.dto';
import { TicketDTO, updateTicketDTO } from './ticket.dto';
import { Ticket } from './ticket.interface';

@Injectable()
export class TicketService {
  @InjectModel('Ticket') private ticketModel: Model<Ticket>;

  // Create a record of tickets generated
  async createTickets(tickets: TicketDTO[]) {
    // TODO: add return type
    try {
      const response = await this.ticketModel.insertMany(tickets);
      return response;
    } catch (error) {
      throwBadRequestError(error);
    }
  }

  // Get the ticket information by ID
  async getTicketByID(ticketId: Types.ObjectId): Promise<Ticket> {
    try {
      const ticket = await this.ticketModel.findById(ticketId);
      if (!ticket) throw new NotFoundException(`Ticket #${ticketId} not found`);
      return ticket;
    } catch (error) {
      throwBadRequestError(error);
    }
  }

  // Get all tickets belonging to an event
  async getTicketsOfEvent(eventId: Types.ObjectId): Promise<Ticket[]> {
    try {
      const tickets = await this.ticketModel.find({ subjectOf: eventId });
      return tickets;
    } catch (error) {
      throwBadRequestError(error);
    }
  }

  // Get all tickets belonging to a person
  async getTicketsOfUser(userId: Types.ObjectId): Promise<Ticket[]> {
    try {
      const tickets = await this.ticketModel.find({ ownerId: userId });
      return tickets;
    } catch (error) {
      throwBadRequestError(error);
    }
  }

  // Update ticket details
  async updateTicket(ticket: updateTicketDTO) {
    try {
      const updatedTicket = await this.ticketModel.findByIdAndUpdate(ticket._id);
      return updatedTicket;
    } catch (error) {
      throwBadRequestError(error);
    }
  }

  // Delete an event with the specified ID
  async deleteTicket(ticketId: Types.ObjectId): Promise<DeleteResponseDTO> {
    try {
      return await this.ticketModel.findByIdAndDelete(ticketId);
    } catch (error) {
      throwBadRequestError(error);
    }
  }
}
