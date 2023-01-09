import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { EventOrganizerGuard } from 'src/auth/jwt.guard';
import { TEN_MEGABYTES } from 'src/utils/constants';
import { EventDTO, UpdateEventDTO } from './event.dto';
import { EventService } from './event.service';
@ApiTags('Event')
@Controller('event')
export class EventController {
  constructor(private userService: EventService) {}

  @UseGuards(EventOrganizerGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      limits: {
        files: 1,
        fileSize: TEN_MEGABYTES,
      },
    }),
  )
  @Post('/createEvent')
  async createEvent(@Body() dto: EventDTO, @UploadedFile() image: Express.Multer.File) {
    return this.userService.createEvent(dto, image);
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
  @UseInterceptors(
    FileInterceptor('image', {
      limits: {
        files: 1,
        fileSize: TEN_MEGABYTES,
      },
    }),
  )
  @Put('/updateEvent')
  async updateEvent(@Body() dto: UpdateEventDTO, @UploadedFile() image: Express.Multer.File, @Req() req: any) {
    return this.userService.updateEvent(dto, req.user.uid, image);
  }

  @UseGuards(EventOrganizerGuard)
  @Delete('/updateEvent')
  async deleteEvent(@Query('id') eventId: string, @Req() req: any) {
    return this.userService.deleteEvent(eventId, req.user.uid);
  }
}
