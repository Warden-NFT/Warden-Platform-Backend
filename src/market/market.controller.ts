import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from 'src/auth/jwt.guard';
import { EventService } from 'src/event/event.service';
import {
  EventSearchDTO,
  FeaturedEventIdsDTO,
  Market,
  MarketEventDTO,
  MarketTicketDTO,
  TicketListingInfoDTO,
} from './dto/market.dto';
import { MarketService } from './market.service';

@ApiTags('Market')
@Controller('market')
export class MarketController {
  constructor(private marketService: MarketService, private eventService: EventService) {}

  // Featured Events

  @Get('featured')
  @ApiOkResponse({ type: [Event] })
  @ApiBadRequestResponse({ description: 'Unable to get the featured events' })
  async getFeaturedEvents() {
    return this.marketService.getFeaturedEvents();
  }

  @Put('featured')
  @ApiOkResponse({ type: Market })
  @ApiBadRequestResponse({ description: 'Unable to set the featured events' })
  @UseGuards(AdminGuard)
  async setFeaturedEvents(@Body() dto: FeaturedEventIdsDTO) {
    return this.marketService.setFeaturedEvents(dto.featuredEvents);
  }

  // Latest Events

  @Get('latest')
  @ApiOkResponse({ type: [Event] })
  @ApiBadRequestResponse({ description: 'Unable to get the latest events' })
  async getLatestEvents(@Query('limit') limit: string, @Query('startTimeStamp') startTimeStamp: string) {
    return this.marketService.getLatestEvents(parseInt(limit) ?? 10, startTimeStamp);
  }

  // Event search

  @Post('search')
  @ApiOkResponse({ type: [Event] })
  @ApiBadRequestResponse({ description: 'Unable to get search for the events' })
  async searchEvents(@Body() eventSearchDTO: EventSearchDTO) {
    return this.marketService.searchEvents(eventSearchDTO);
  }

  // Market Event

  @Get('events')
  @ApiOkResponse({ type: MarketEventDTO })
  @ApiBadRequestResponse({ description: 'Unable to search for the market events' })
  async getMarketEvents(@Query('organizerId') organizerId: string) {
    return this.marketService.getMarketEvents(organizerId);
  }

  // Market Ticket

  @Get('tickets')
  @ApiOkResponse({ type: MarketTicketDTO })
  @ApiBadRequestResponse({ description: 'Unable to search for the market tickets' })
  async getMarketTickets(@Query('eventId') eventId: string) {
    return this.marketService.getMarketTickets(eventId);
  }

  // Owned Market Ticket
  @Get('tickets/owned')
  @ApiOkResponse({ type: MarketTicketDTO })
  @ApiBadRequestResponse({ description: 'Unable to search for the market tickets' })
  async getOwnedTicketsFromEventId(@Query('eventId') eventId: string, @Query('walletAddress') walletAddress: string) {
    return this.marketService.getOwnedTicketsFromEventId(eventId, walletAddress);
  }

  // Ticket Listing
  @Get(':eventId/:ticketCollectionId/:ticketId')
  @ApiOkResponse({ type: TicketListingInfoDTO })
  @ApiBadRequestResponse({ description: 'Unable to find the ticket' })
  async getTicketListing(
    @Param('eventId') eventId: string,
    @Param('ticketCollectionId') ticketCollectionId: string,
    @Param('ticketId') ticketId: string,
  ) {
    return this.marketService.getTicketListingDetails(eventId, ticketCollectionId, ticketId);
  }

  // Ticket Listing from ticketId
  @Get('ticket/:ticketId')
  @ApiOkResponse({ type: TicketListingInfoDTO })
  @ApiBadRequestResponse({ description: 'Unable to find the ticket' })
  async getTicketListingFromTicketId(@Param('ticketId') ticketId: string) {
    return this.marketService.getTicketListingDetailsFromTicketId(ticketId);
  }
}
