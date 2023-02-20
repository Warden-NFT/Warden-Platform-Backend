import { Expose } from 'class-transformer';
import { Event } from 'src/event/interfaces/event.interface';
import { EventOrganizerUser } from 'src/user/user.interface';

@Expose()
export class FeaturedEventIdsDTO {
  featuredEvents: string[];
}

@Expose()
export class EventSearchDTO {
  searchTerm?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
}

@Expose()
export class MarketEveventDTO {
  organizerInfo: EventOrganizerUser;
  events: Event[];
}

@Expose()
export class Market {
  featuredEvents: string[];
}
