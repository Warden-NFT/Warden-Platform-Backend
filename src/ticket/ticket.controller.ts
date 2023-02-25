import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
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
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  refs,
} from '@nestjs/swagger';
import { EventOrganizerGuard, JwtAuthGuard } from 'src/auth/jwt.guard';
import { SuccessfulMediaOperationDTO } from 'src/media/dto/media.dto';
import { StorageService } from 'src/storage/storage.service';
import { DeleteResponseDTO, HttpErrorResponse, InsertManyResponseDTO } from 'src/utils/httpResponse.dto';
import {
  TicketDTO,
  TicketCollectionDTO,
  TicketsMetadataDTO,
  UpdateTicketDTO,
  updateTicketCollectionImagesDTO,
  VIPTicketDTO,
} from './ticket.dto';
import { Ticket, TicketCollection } from './ticket.interface';
import { TicketService } from './ticket.service';

@ApiTags('Ticket')
@Controller('ticket')
export class TicketController {
  constructor(private ticketService: TicketService, private storageService: StorageService) {}

  @Post('collection')
  @ApiCreatedResponse({ type: InsertManyResponseDTO })
  @ApiConflictResponse({ description: 'This event already has a ticket set associated.' })
  @ApiBadRequestResponse({ type: HttpErrorResponse, description: 'Provided data is incorrectly formatted' })
  @UseGuards(EventOrganizerGuard)
  async createTicketCollection(@Body() tickets: TicketCollectionDTO, @Req() req) {
    return this.ticketService.createTicketCollection(tickets, req.user.uid);
  }

  @Get()
  @ApiOkResponse({ type: TicketCollectionDTO })
  @ApiBadRequestResponse({ type: HttpErrorResponse, description: 'Provided data is incorrectly formatted' })
  @UseGuards(JwtAuthGuard)
  async getTicketCollection(@Query('collectionId') collectionId: string): Promise<TicketCollection> {
    return this.ticketService.getTicketCollectionByID(collectionId);
  }

  @Get('/single')
  @ApiOkResponse({ schema: { anyOf: refs(TicketDTO, VIPTicketDTO) } })
  @ApiBadRequestResponse({ type: HttpErrorResponse, description: 'Provided data is incorrectly formatted' })
  @UseGuards(JwtAuthGuard)
  async getTicket(@Query('collectionId') collectionId: string, @Query('ticketId') ticketId: string): Promise<Ticket> {
    return this.ticketService.getTicketByID(collectionId, ticketId);
  }

  @Get('/multiple')
  @ApiOkResponse({ type: TicketDTO })
  @ApiBadRequestResponse({ type: HttpErrorResponse, description: 'Provided data is incorrectly formatted' })
  @UseGuards(JwtAuthGuard)
  async getTicketOfEvent(@Query('eventId') eventId: string): Promise<TicketCollection> {
    return this.ticketService.getTicketsOfEvent(eventId);
  }

  @Get('/metadata')
  @ApiOkResponse({ type: TicketsMetadataDTO })
  @ApiBadRequestResponse({ type: HttpErrorResponse, description: 'Provided data is incorrectly formatted' })
  async getTicketMetadat(@Query('path') _path: string) {
    const path = _path.split(',').reduce((prev, curr) => `${prev}/${curr}`);
    const { metadata } = await this.storageService.getMetadata(`media/${path}`);
    return metadata;
  }

  @Get('/user/:walletAddress')
  @ApiOkResponse({ type: [TicketDTO] })
  @ApiBadRequestResponse({ type: HttpErrorResponse, description: 'Provided data is incorrectly formatted' })
  @UseGuards(JwtAuthGuard)
  async getTicketsOfUser(@Param('walletAddress') walletAddress: string): Promise<Ticket[]> {
    return this.ticketService.getTicketsOfUser(walletAddress);
  }

  @Put('/collection')
  @ApiOkResponse({ schema: { anyOf: refs(TicketDTO, VIPTicketDTO) } })
  @ApiNotFoundResponse({ description: 'Ticket not found' })
  @ApiUnauthorizedResponse({ description: 'You do not have the permission to edit this ticket' })
  @ApiBadRequestResponse({ type: HttpErrorResponse, description: 'Provided data is incorrectly formatted' })
  @UseGuards(JwtAuthGuard)
  async updateTicketCollection(@Body() dto: TicketCollectionDTO, @Req() req) {
    return this.ticketService.updateTicketCollection(dto, req.user.uid);
  }

  @Post('/collection/assets')
  @ApiOkResponse({ type: SuccessfulMediaOperationDTO })
  @ApiBadRequestResponse({ description: 'Invalid file or file size is too large' })
  @UseGuards(EventOrganizerGuard)
  @UseInterceptors(FilesInterceptor('files'))
  async saveTicketCollectionImages(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() dto: updateTicketCollectionImagesDTO,
    @Req() req,
  ) {
    this.ticketService.updateTicketCollectionImages(files, dto, req.user.uid);
  }

  @Put('/single')
  @ApiOkResponse({ schema: { anyOf: refs(TicketDTO, VIPTicketDTO) } })
  @ApiNotFoundResponse({ description: 'Ticket not found' })
  @ApiUnauthorizedResponse({ description: 'You do not have the permission to edit this ticket' })
  @ApiBadRequestResponse({ type: HttpErrorResponse, description: 'Provided data is incorrectly formatted' })
  @UseGuards(JwtAuthGuard)
  async updateTicket(@Body() updateTicketDTO: UpdateTicketDTO, @Req() req) {
    return this.ticketService.updateTicket(updateTicketDTO.ticket, updateTicketDTO.ticketCollectionId, req.user.uid);
  }

  @Delete('/collection')
  @ApiOkResponse({ type: DeleteResponseDTO })
  @ApiNotFoundResponse({ description: 'Ticket set not found' })
  @ApiUnauthorizedResponse({ description: 'You do not have the permission to delete this ticket' })
  @ApiBadRequestResponse({ type: HttpErrorResponse, description: 'Provided data is incorrectly formatted' })
  @UseGuards(JwtAuthGuard)
  async deleteTicket(@Query('collectionId') collectionId: string, @Req() req) {
    return this.ticketService.deleteTicket(collectionId, req.user.uid);
  }
}
