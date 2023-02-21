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
import { EventOrganizerGuard } from 'src/auth/jwt.guard';
import { FILE_SIZES } from 'src/utils/constants';
import { DeleteResponseDTO, HttpErrorResponse } from 'src/utils/httpResponse.dto';
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
  @UseGuards(EventOrganizerGuard)
  async getEvent(@Query('id') eventId: string) {
    return this.eventService.getEvent(eventId);
  }

  @Get('/organizer')
  @ApiOkResponse({ type: [EventDTO] })
  @ApiNotFoundResponse({ description: 'Event #${eventId} not found' })
  @ApiBadRequestResponse({ type: HttpErrorResponse, description: 'Provided data is incorrectly formatted' })
  @UseGuards(EventOrganizerGuard)
  async getEventsFromOrganizer(@Req() req: any, @Query('unlisted') unlisted: boolean) {
    return this.eventService.getEventFromEventOrganizer(req.user.uid, unlisted);
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
