import { Body, Controller, Get, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse } from '@nestjs/swagger';
import { AdminGuard, JwtAuthGuard } from 'src/auth/jwt.guard';
import { EventService } from 'src/event/event.service';
import { EventSearchDTO, FeaturedEventIdsDTO, Market, MarketEveventDTO } from './dto/market.dto';
import { MarketService } from './market.service';

@Controller('market')
export class MarketController {
  constructor(private marketService: MarketService, private eventService: EventService) {}

  // Featured Events

  @Get('featured')
  @ApiOkResponse({ type: [Event] })
  @ApiBadRequestResponse({ description: 'Unable to get the featured events' })
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
  async getLatestEvents(@Query('limit') limit: string, @Query('startTimeStamp') startTimeStamp: string) {
    return this.marketService.getLatestEvents(parseInt(limit) ?? 10, startTimeStamp);
  }

  // Event search

  @Post('search')
  @ApiOkResponse({ type: [Event] })
  @ApiBadRequestResponse({ description: 'Unable to get search for the events' })
  @UseGuards(JwtAuthGuard)
  async searchEvents(@Body() eventSearchDTO: EventSearchDTO) {
    return this.marketService.searchEvents(eventSearchDTO);
  }

  // Market Event

  @Get('events')
  @ApiOkResponse({ type: MarketEveventDTO })
  @ApiBadRequestResponse({ description: 'Unable to get search for the market events' })
  @UseGuards(JwtAuthGuard)
  async getMarketEvents(@Query('organizerId') organizerId: string) {
    return this.marketService.getMarketEvents(organizerId);
  }
}
