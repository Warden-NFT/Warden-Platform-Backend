import mongoose, { Types } from 'mongoose';

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
  ticketMetadata: Object,
  ownerAddress: String,
});
