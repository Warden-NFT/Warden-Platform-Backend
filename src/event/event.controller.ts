import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { EventOrganizerGuard } from 'src/auth/jwt.guard';
import { AuthUser } from 'src/user/user.decorator';
import { EventDTO, UpdateEventDTO } from './event.dto';
import { EventService } from './event.service';
@ApiTags('Event')
@Controller('event')
export class EventController {
  constructor(private userService: EventService) {}

  @UseGuards(EventOrganizerGuard)
  @Post('/createEvent')
  async createEvent(@Body() dto: EventDTO) {
    return this.userService.createEvent(dto);
  }

  @UseGuards(EventOrganizerGuard)
  @Get('getEvent')
  async getEvent(@Query('id') eventId: string) {
    return this.userService.getEvent(eventId);
  }

  @UseGuards(EventOrganizerGuard)
  @Get('/getEventFromOrganizer')
  async getEventFromOrganizer(@Query('id') eventOrganizerId: string) {
    return this.userService.getEventFromEventOrganizer(eventOrganizerId);
  }

  @UseGuards(EventOrganizerGuard)
  @Put('/updateEvent')
  async updateEvent(@Body() dto: UpdateEventDTO) {
    const { event, eventId, eventOrganizerId } = dto;
    return this.userService.updateEvent(event, eventId, eventOrganizerId);
  }

  @UseGuards(EventOrganizerGuard)
  @Delete('/updateEvent')
  async deleteEvent(@Query('id') eventId: string, @Req() req: any) {
    return this.userService.deleteEvent(eventId, req.user.uid);
  }
}
