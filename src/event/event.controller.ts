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
import { TEN_MEGABYTES } from 'src/utils/constants';
import { DeleteResponseDTO, HttpErrorResponse } from 'src/utils/httpResponse.dto';
import { EventDTO, UpdateEventDTO } from './event.dto';
import { EventService } from './event.service';

@ApiTags('Event')
@Controller('event')
export class EventController {
  constructor(private userService: EventService) {}

  @Post('/createEvent')
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ type: EventDTO })
  @ApiBadRequestResponse({ type: HttpErrorResponse, description: 'Provided data is incorrectly formatted' })
  @UseGuards(EventOrganizerGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      limits: {
        files: 1,
        fileSize: TEN_MEGABYTES,
      },
    }),
  )
  async createEvent(@Body() dto: EventDTO, @UploadedFile() image: Express.Multer.File) {
    return this.userService.createEvent(dto, image);
  }

  @Get('getEvent')
  @ApiOkResponse({ type: EventDTO })
  @ApiNotFoundResponse({ description: 'Event #${eventId} not found' })
  @ApiBadRequestResponse({ type: HttpErrorResponse, description: 'Provided data is incorrectly formatted' })
  @UseGuards(EventOrganizerGuard)
  async getEvent(@Query('id') eventId: string) {
    return this.userService.getEvent(eventId);
  }

  @Get('/getEventFromOrganizer')
  @ApiOkResponse({ type: [EventDTO] })
  @ApiNotFoundResponse({ description: 'Event #${eventId} not found' })
  @ApiBadRequestResponse({ type: HttpErrorResponse, description: 'Provided data is incorrectly formatted' })
  @UseGuards(EventOrganizerGuard)
  async getEventFromOrganizer(@Req() req: any) {
    return this.userService.getEventFromEventOrganizer(req.user.uid);
  }

  @Put('/updateEvent')
  @ApiOkResponse({ type: EventDTO })
  @ApiBadRequestResponse({ type: HttpErrorResponse, description: 'Provided data is incorrectly formatted' })
  @UseGuards(EventOrganizerGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      limits: {
        files: 1,
        fileSize: TEN_MEGABYTES,
      },
    }),
  )
  async updateEvent(@Body() dto: UpdateEventDTO, @UploadedFile() image: Express.Multer.File, @Req() req: any) {
    return this.userService.updateEvent(dto, req.user.uid, image);
  }

  @Delete('/deleteEvent')
  @ApiOkResponse({ type: DeleteResponseDTO })
  @ApiBadRequestResponse({ type: HttpErrorResponse, description: 'Provided data is incorrectly formatted' })
  @UseGuards(EventOrganizerGuard)
  async deleteEvent(@Query('id') eventId: string, @Req() req: any) {
    return this.userService.deleteEvent(eventId, req.user.uid);
  }
}
