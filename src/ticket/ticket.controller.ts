import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AdminGuard, EventOrganizerGuard, JwtAuthGuard } from 'src/auth/jwt.guard';
import { SuccessfulMediaOperationDTO } from 'src/media/dto/media.dto';
import { DeleteResponseDTO, HttpErrorResponse, InsertManyResponseDTO } from 'src/utils/httpResponse.dto';
import { TicketDTO, TicketSetDTO, UpdateTicketDTO, UpdateTicketSetImagesDTO } from './ticket.dto';
import { Ticket, TicketSet } from './ticket.interface';
import { TicketService } from './ticket.service';

@ApiTags('Ticket')
@Controller('ticket')
export class TicketController {
  constructor(private ticketService: TicketService) {}

  @Post('/createEventTickets')
  @ApiCreatedResponse({ type: InsertManyResponseDTO })
  @ApiBadRequestResponse({ type: HttpErrorResponse, description: 'Provided data is incorrectly formatted' })
  @UseGuards(EventOrganizerGuard)
  async createTicketSet(@Body() tickets: TicketSetDTO) {
    return this.ticketService.createTicketSet(tickets);
  }

  @Get('/getTicketSet')
  @ApiOkResponse({ type: TicketSetDTO })
  @ApiBadRequestResponse({ type: HttpErrorResponse, description: 'Provided data is incorrectly formatted' })
  @UseGuards(JwtAuthGuard)
  async getTicketSet(@Query('ticketSetId') ticketSetId: string): Promise<TicketSet> {
    return this.ticketService.getTicketSetByID(ticketSetId);
  }

  @Get('/getTicket')
  @ApiOkResponse({ type: TicketDTO })
  @ApiBadRequestResponse({ type: HttpErrorResponse, description: 'Provided data is incorrectly formatted' })
  @UseGuards(JwtAuthGuard)
  async getTicket(@Query('ticketSetId') ticketSetId: string, @Query('ticketId') ticketId: string): Promise<Ticket> {
    return this.ticketService.getTicketByID(ticketSetId, ticketId);
  }

  @Get('/getTicketsOfEvent')
  @ApiOkResponse({ type: [TicketDTO] })
  @ApiBadRequestResponse({ type: HttpErrorResponse, description: 'Provided data is incorrectly formatted' })
  @UseGuards(JwtAuthGuard)
  async getTicketOfEvent(@Query('eventId') eventId: string): Promise<TicketSet[]> {
    return this.ticketService.getTicketsOfEvent(eventId);
  }

  // TODO: This endpoint should be separated into another module "sales"
  // @Get('/getTicketsOfUser')
  // @ApiOkResponse({ type: [TicketDTO] })
  // @ApiBadRequestResponse({ type: HttpErrorResponse, description: 'Provided data is incorrectly formatted' })
  // @UseGuards(JwtAuthGuard)
  // async getTicketsOfUser(@Query('id') userId: string): Promise<Ticket[]> {
  //   return this.ticketService.getTicketsOfUser(new mongoose.Types.ObjectId(userId));
  // }

  @Put('/updateTicketSet')
  @ApiOkResponse({ type: TicketDTO })
  @ApiNotFoundResponse({ description: 'Ticket not found' })
  @ApiUnauthorizedResponse({ description: 'You do not have the permission to edit this ticket' })
  @ApiBadRequestResponse({ type: HttpErrorResponse, description: 'Provided data is incorrectly formatted' })
  @UseGuards(JwtAuthGuard)
  async updateTicketSet(@Body() dto: TicketSetDTO, @Req() req) {
    return this.ticketService.updateTicketSet(dto, req.user.uid);
  }

  @Post('/saveTicketSetImages')
  @ApiOkResponse({ type: SuccessfulMediaOperationDTO })
  @ApiBadRequestResponse({ description: 'Invalid file or file size is too large' })
  @UseGuards(EventOrganizerGuard)
  @UseInterceptors(FilesInterceptor('files'))
  async saveTicketSetImages(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() dto: UpdateTicketSetImagesDTO,
    @Req() req,
  ) {
    this.ticketService.updateTicketSetImages(files, dto, req.user.uid);
  }

  @Put('/updateTicket')
  @ApiOkResponse({ type: TicketDTO })
  @ApiNotFoundResponse({ description: 'Ticket not found' })
  @ApiUnauthorizedResponse({ description: 'You do not have the permission to edit this ticket' })
  @ApiBadRequestResponse({ type: HttpErrorResponse, description: 'Provided data is incorrectly formatted' })
  @UseGuards(JwtAuthGuard)
  async updateTicket(@Body() updateTicketDTO: UpdateTicketDTO, @Req() req) {
    return this.ticketService.updateTicket(updateTicketDTO.ticket, updateTicketDTO.ticketSetId, req.user.uid);
  }

  @Delete('/deleteTicketSet')
  @ApiOkResponse({ type: DeleteResponseDTO })
  @ApiNotFoundResponse({ description: 'Ticket set not found' })
  @ApiUnauthorizedResponse({ description: 'You do not have the permission to delete this ticket' })
  @ApiBadRequestResponse({ type: HttpErrorResponse, description: 'Provided data is incorrectly formatted' })
  @UseGuards(JwtAuthGuard)
  async deleteTicket(@Query('ticketSetId') ticketSetId: string, @Req() req) {
    return this.ticketService.deleteTicket(ticketSetId, req.user.uid);
  }
}
