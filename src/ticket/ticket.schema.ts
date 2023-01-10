import mongoose, { Types } from 'mongoose';
import { TicketsMetadataDTO } from 'src/event/event.dto';

export const TicketSchema = new mongoose.Schema({
  dateIssued: Date,
  issuedBy: Types.ObjectId,
  priceCurrency: String,
  ticketNumber: Number,
  ticketSeat: String,
  totalPrice: Number,
  ownerId: Types.ObjectId,
  description: String,
  name: String,
  subjectOf: Types.ObjectId, // Event ID
  smartContractAddress: String,
  ticketMetadata: TicketsMetadataDTO,
  ownerAddress: String,
});
