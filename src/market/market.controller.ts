import { Body, Controller, Get, Put, Query, UseGuards } from '@nestjs/common';
import { AdminGuard, JwtAuthGuard } from 'src/auth/jwt.guard';
import { EventService } from 'src/event/event.service';
import { FeaturedEventIdsDTO } from './dto/market.dto';
import { MarketService } from './market.service';

@Controller('market')
export class MarketController {
  constructor(private marketService: MarketService, private eventService: EventService) {}

  // Featured Events

  @Get('featured')
  @UseGuards(JwtAuthGuard)
  async getFeaturedEvents() {
    return this.marketService.getFeaturedEvents();
  }

  @Put('featured')
  @UseGuards(AdminGuard)
  async setFeaturedEvents(@Body() dto: FeaturedEventIdsDTO) {
    return this.marketService.setFeaturedEvents(dto.featuredEvents);
  }

  // Latest Events

  @Get('latest')
  @UseGuards(JwtAuthGuard)
  async getLatestEvents(@Query('limit') limit: string, @Query('startTimeStamp') startTimeStamp: string) {
    return this.marketService.getLatestEvents(parseInt(limit) ?? 10, startTimeStamp);
  }
}
