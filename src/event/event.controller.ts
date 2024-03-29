import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { EventOrganizerGuard } from '../auth/jwt.guard';
import { UserGeneralInfoDTO } from '../user/dto/user.dto';
import { FILE_SIZES } from '../utils/constants';
import { DeleteResponseDTO, HttpErrorResponse } from '../utils/httpResponse.dto';
import { EventDTO, UpdateEventDTO } from './event.dto';
import { EventService } from './event.service';

@ApiTags('Event')
@Controller('event')
export class EventController {
  constructor(private eventService: EventService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ type: EventDTO })
  @ApiBadRequestResponse({ type: HttpErrorResponse, description: 'Provided data is incorrectly formatted' })
  @UseGuards(EventOrganizerGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      limits: {
        files: 1,
        fileSize: FILE_SIZES.TEN_MEGABYTES,
      },
    }),
  )
  async createEvent(@Body() dto: EventDTO) {
    return this.eventService.createEvent(dto);
  }

  @Get()
  @ApiOkResponse({ type: EventDTO })
  @ApiNotFoundResponse({ description: 'Event #${eventId} not found' })
  @ApiBadRequestResponse({ type: HttpErrorResponse, description: 'Provided data is incorrectly formatted' })
  async getEvent(@Query('id') eventId: string) {
    return this.eventService.getEvent(eventId);
  }

  @Get('/organizer')
  @ApiOkResponse({ type: [EventDTO] })
  @ApiNotFoundResponse({ description: 'Event #${eventId} not found' })
  @ApiBadRequestResponse({ type: HttpErrorResponse, description: 'Provided data is incorrectly formatted' })
  async getEventsFromOrganizer(@Query('id') eventOragnizerId: string, @Query('unlisted') unlisted: boolean) {
    return this.eventService.getEventFromEventOrganizer(eventOragnizerId, unlisted);
  }

  @Get('/organizer/info')
  @ApiOkResponse({ type: UserGeneralInfoDTO })
  @ApiNotFoundResponse({ description: 'The event organizer with the given _id is not found.' })
  @ApiBadRequestResponse({ description: 'The provided data is incorrectly formatted' })
  async getEventOrganizerInfo(@Query('id') eventOragnizerId: string) {
    return this.eventService.getEventOrganizerInfo(eventOragnizerId);
  }

  @Put()
  @ApiOkResponse({ type: EventDTO })
  @ApiBadRequestResponse({ type: HttpErrorResponse, description: 'Provided data is incorrectly formatted' })
  @UseGuards(EventOrganizerGuard)
  async updateEvent(@Body() dto: UpdateEventDTO, @Req() req: any) {
    return this.eventService.updateEvent(dto, req.user.uid);
  }

  @Delete()
  @ApiOkResponse({ type: DeleteResponseDTO })
  @ApiBadRequestResponse({ type: HttpErrorResponse, description: 'Provided data is incorrectly formatted' })
  @UseGuards(EventOrganizerGuard)
  async deleteEvent(@Query('id') eventId: string, @Req() req: any) {
    return this.eventService.deleteEvent(eventId, req.user.uid);
  }

  @Post('image')
  @UseGuards(EventOrganizerGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      limits: {
        files: 1,
        fileSize: FILE_SIZES.TEN_MEGABYTES,
      },
    }),
  )
  async uploadEventImage(@Body() dto, @UploadedFile() image: Express.Multer.File, @Req() req: any) {
    return this.eventService.uploadEventImage(req.user.uid, dto.eventId, image);
  }
}
