import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsBoolean, IsString } from 'class-validator';
import { User } from 'src/user/user.interface';
import { Ticket } from '../interface/ticket.interface';

@Expose()
export class TicketTransactionPermissionDTO {
  @ApiProperty()
  @IsBoolean()
  allowed: boolean;

  @ApiProperty()
  @IsString()
  reason?: string;
}

@Expose()
export class UpdateTicketOwnershipDTO {
  @ApiProperty()
  @IsBoolean()
  success: boolean;

  @ApiProperty()
  @IsString()
  reason?: string;
}

@Expose()
export class MyTicketsDTO {
  myTickets: Ticket[];
  myTicketListing: Ticket[];
}

@Expose()
export class AdmissionDetailDTO {
  event: Event;
  user: User;
  ticket: Ticket;
}
