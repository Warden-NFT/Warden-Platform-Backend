import mongoose from 'mongoose';
export const MarketSchema = new mongoose.Schema({
  featuredEvents: [String],
});
