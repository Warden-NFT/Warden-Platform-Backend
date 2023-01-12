import { Body, Controller, Delete, Get, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import mongoose from 'mongoose';
import { EventOrganizerGuard, JwtAuthGuard } from 'src/auth/jwt.guard';
import { DeleteResponseDTO, HttpErrorResponse, InsertManyResponseDTO } from 'src/utils/httpResponse.dto';
import { TicketDTO, UpdateTicketDTO } from './ticket.dto';
import { Ticket } from './ticket.interface';
import { TicketService } from './ticket.service';

@ApiTags('Ticket')
@Controller('ticket')
export class TicketController {
  constructor(private ticketService: TicketService) {}

  @Post('/createEventTickets')
  @ApiCreatedResponse({ type: InsertManyResponseDTO })
  @ApiBadRequestResponse({ type: HttpErrorResponse, description: 'Provided data is incorrectly formatted' })
  @UseGuards(EventOrganizerGuard)
  async createTickets(@Body() tickets: TicketDTO[]) {
    return this.ticketService.createTickets(tickets);
  }

  @Get('/getTicketByID')
  @ApiOkResponse({ type: TicketDTO })
  @ApiBadRequestResponse({ type: HttpErrorResponse, description: 'Provided data is incorrectly formatted' })
  @UseGuards(JwtAuthGuard)
  async getTicketByID(@Query('id') ticketId: string): Promise<Ticket> {
    return this.ticketService.getTicketByID(new mongoose.Types.ObjectId(ticketId));
  }

  @Get('/getTicketsOfEvent')
  @ApiOkResponse({ type: [TicketDTO] })
  @ApiBadRequestResponse({ type: HttpErrorResponse, description: 'Provided data is incorrectly formatted' })
  @UseGuards(JwtAuthGuard)
  async getTicketOfEvent(@Query('id') eventId: string): Promise<Ticket[]> {
    return this.ticketService.getTicketsOfEvent(new mongoose.Types.ObjectId(eventId));
  }

  @Get('/getTicketsOfUser')
  @ApiOkResponse({ type: [TicketDTO] })
  @ApiBadRequestResponse({ type: HttpErrorResponse, description: 'Provided data is incorrectly formatted' })
  @UseGuards(JwtAuthGuard)
  async getTicketsOfUser(@Query('id') userId: string): Promise<Ticket[]> {
    return this.ticketService.getTicketsOfUser(new mongoose.Types.ObjectId(userId));
  }

  @Put('/updateTicket')
  @ApiOkResponse({ type: TicketDTO })
  @ApiNotFoundResponse({ description: 'Ticket not found' })
  @ApiUnauthorizedResponse({ description: 'You do not have the permission to edit this ticket' })
  @ApiBadRequestResponse({ type: HttpErrorResponse, description: 'Provided data is incorrectly formatted' })
  @UseGuards(JwtAuthGuard)
  async updateTicket(@Body() dto: UpdateTicketDTO, @Req() req) {
    return this.ticketService.updateTicket(dto, req.user.uid);
  }

  @Delete('/updateTicket')
  @ApiOkResponse({ type: DeleteResponseDTO })
  @ApiNotFoundResponse({ description: 'Ticket not found' })
  @ApiUnauthorizedResponse({ description: 'You do not have the permission to delete this ticket' })
  @ApiBadRequestResponse({ type: HttpErrorResponse, description: 'Provided data is incorrectly formatted' })
  @UseGuards(JwtAuthGuard)
  async deleteTicket(@Query('id') ticketId: string, @Req() req) {
    return this.ticketService.deleteTicket(new mongoose.Types.ObjectId(ticketId), req.user.uid);
  }
}
