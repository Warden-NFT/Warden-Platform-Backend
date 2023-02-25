import { Expose } from 'class-transformer';
import { Event } from 'src/event/interfaces/event.interface';
import { TicketPriceDTO } from 'src/ticket/ticket.dto';
import { Ticket, TicketCollection } from 'src/ticket/ticket.interface';
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
export class Market {
  featuredEvents: string[];
}

@Expose()
export class MarketEventDTO {
  organizerInfo: EventOrganizerUser;
  events: Event[];
  eventTicketPreviews: MarketEventTicketPreviewsDTO[];
}

@Expose()
export class MarketEventTicketPreviewsDTO {
  tickets: { general: Ticket[]; vip: Ticket[]; reservedSeat: Ticket[] };
  ticketPrice: TicketPriceDTO;
}

@Expose()
export class MarketTicketDTO {
  organizerInfo: EventOrganizerUser;
  event: Event;
  ticketCollection: TicketCollection;
}

@Expose()
export class TicketListingInfoDTO {
  organizerInfo: EventOrganizerUser;
  event: Event;
  ticket: Ticket;
}
