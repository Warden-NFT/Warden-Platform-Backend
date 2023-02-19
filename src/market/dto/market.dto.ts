import { Expose } from 'class-transformer';

@Expose()
export class FeaturedEventIdsDTO {
  featuredEvents: string[];
}
