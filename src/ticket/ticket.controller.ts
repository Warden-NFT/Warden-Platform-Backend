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
  ApiForbiddenResponse,
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
  TicketTransactionDTO,
  TicketUtilizeDTO,
  TicketQuotaCheckResultDTO,
  ResaleTicketPurchasePermission,
} from './dto/ticket.dto';
import {
  AdmissionDetailDTO,
  MyTicketsDTO,
  TicketTransactionPermissionDTO,
  UpdateTicketOwnershipDTO,
} from './dto/ticketTransaction.dto';
import { Ticket, TicketCollection } from './interface/ticket.interface';
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
  async getTicketCollection(@Query('collectionId') collectionId: string): Promise<TicketCollection> {
    return this.ticketService.getTicketCollectionByID(collectionId);
  }

  @Get('/single')
  @ApiOkResponse({ schema: { anyOf: refs(TicketDTO, VIPTicketDTO) } })
  @ApiBadRequestResponse({ type: HttpErrorResponse, description: 'Provided data is incorrectly formatted' })
  async getTicket(@Query('eventId') eventId: string, @Query('ticketId') ticketId: string): Promise<Ticket> {
    return this.ticketService.getTicketByID(eventId, ticketId);
  }

  @Get('/multiple')
  @ApiOkResponse({ type: TicketDTO })
  @ApiBadRequestResponse({ type: HttpErrorResponse, description: 'Provided data is incorrectly formatted' })
  async getTicketOfEvent(@Query('eventId') eventId: string): Promise<TicketCollection> {
    return this.ticketService.getTicketsOfEvent(eventId);
  }

  @Get('/metadata')
  @ApiOkResponse({ type: TicketsMetadataDTO })
  @ApiBadRequestResponse({ type: HttpErrorResponse, description: 'Provided data is incorrectly formatted' })
  async getTicketMetadat(@Query('path') _path: string, @Query('ticketId') ticketId: string) {
    const path = _path.split(',').reduce((prev, curr) => `${prev}/${curr}`);
    // the path is in the format of <eventId>/<ticketName>
    const eventId = path.split('/')[0];
    const ticket = await this.ticketService.getTicketByID(eventId, ticketId);
    const { attributes, description, image, name } = ticket.ticketMetadata[0];
    return { attributes, description, image, name };
  }

  @Get('/user/:walletAddress')
  @ApiOkResponse({ type: [TicketDTO] })
  @ApiBadRequestResponse({ type: HttpErrorResponse, description: 'Provided data is incorrectly formatted' })
  async getTicketsOfUser(@Param('walletAddress') walletAddress: string): Promise<MyTicketsDTO> {
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

  @Post('/transaction/permission')
  @ApiOkResponse({ type: TicketTransactionPermissionDTO })
  @ApiBadRequestResponse({ description: 'Unable to get the ticket transaction permission' })
  async checkTicketPurchasePermission(@Body() dto: TicketTransactionDTO) {
    return this.ticketService.checkTicketPurchasePermission(
      dto.walletAddress,
      dto.eventId,
      dto.ticketCollectionId,
      dto.ticketId,
    );
  }

  @Post('/transaction/record-purchase')
  @ApiOkResponse({ type: UpdateTicketOwnershipDTO })
  @ApiForbiddenResponse({ description: 'You do not have sufficient permission to purchase this ticket' })
  @ApiBadRequestResponse({ description: 'Unable to record the ticket purchase.' })
  @UseGuards(JwtAuthGuard)
  async recordTicketPurchase(@Body() dto: TicketTransactionDTO, @Req() req) {
    return this.ticketService.recordTicketPurchase(
      dto.walletAddress,
      dto.eventId,
      dto.ticketCollectionId,
      dto.ticketId,
      req.user.uid,
    );
  }

  @Post('/transaction/list')
  @ApiOkResponse({ type: UpdateTicketOwnershipDTO })
  @ApiForbiddenResponse({ description: 'You do not have sufficient permission to list this ticket for sale' })
  @ApiBadRequestResponse({ description: 'Unable to record the ticket purchase.' })
  @UseGuards(JwtAuthGuard)
  async listTicketForSale(@Body() dto: TicketTransactionDTO, @Req() req) {
    return this.ticketService.listTicketForSale(
      dto.walletAddress,
      dto.eventId,
      dto.ticketCollectionId,
      dto.ticketId,
      req.user.uid,
    );
  }

  @Put('/utilize')
  @ApiOkResponse({ type: UpdateTicketOwnershipDTO })
  @ApiForbiddenResponse({ description: 'You do not have sufficient permission to admit user' })
  @UseGuards(EventOrganizerGuard)
  async ticketAdmission(@Body() dto: TicketUtilizeDTO, @Req() req) {
    return await this.ticketService.utilizeTicket(dto.eventId, dto.ticketId, dto.userId);
  }

  @Get('/admission/check')
  @ApiOkResponse({ type: AdmissionDetailDTO })
  @ApiForbiddenResponse({ description: 'This ticket is not belong to this wallet address' })
  @UseGuards(EventOrganizerGuard)
  async checkUserAdmission(@Query() dto: TicketUtilizeDTO, @Req() req) {
    return await this.ticketService.getEventApplicantInfo(dto.eventId, dto.ticketId, dto.userId, dto.walletAddress);
  }

  @Get('/quota/check')
  @ApiOkResponse({ type: TicketQuotaCheckResultDTO })
  @ApiBadRequestResponse({ description: 'Unable to check for ticket quota for this user' })
  @UseGuards(JwtAuthGuard)
  async checkTicketPurchaseQuota(
    @Query('address') address: string,
    @Query('ticketCollectionId') ticketCollectionId: string,
    @Query('ticketType') ticketType: string,
  ) {
    return await this.ticketService.checkTicketPurchaseQuota(address, ticketCollectionId, ticketType);
  }

  @Post('/permission/buy-resale')
  @ApiOkResponse({ type: ResaleTicketPurchasePermission })
  @UseGuards(JwtAuthGuard)
  async sendResaleTicketPurchaseRequest(@Body() dto: ResaleTicketPurchasePermission) {
    return this.ticketService.sendResaleTicketPurchaseRequest(dto);
  }
}
