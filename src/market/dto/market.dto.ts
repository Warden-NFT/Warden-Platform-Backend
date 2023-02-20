import { Expose } from 'class-transformer';

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
