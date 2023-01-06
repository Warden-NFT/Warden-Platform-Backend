import { Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { EventOrganizerGuard } from 'src/auth/jwt.guard';
import { EventDTO } from './event.dto';
import { EventService } from './event.service';
@ApiTags('Users')
@Controller('event')
export class EventController {
  constructor(private userService: EventService) {}

  @UseGuards(EventOrganizerGuard)
  @Post('/createEvent')
  async createEvent(dto: EventDTO) {
    return this.userService.createEvent(dto);
  }
}
