import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Event } from 'src/event/interfaces/event.interface';
import { StorageService } from 'src/storage/storage.service';
import { throwBadRequestError } from 'src/utils/httpError';
import { Market } from './interface/market.interface';

@Injectable()
export class MarketService {
  constructor(
    @InjectModel('Event') private eventModel: Model<Event>,
    @InjectModel('Market') private marketModel: Model<Market>,
    private storageService: StorageService,
  ) {}

  // Set the featured Events ID array
  async setFeaturedEvents(featuredEventIds) {
    try {
      const res = await this.marketModel.findOne();
      if (res) {
        res.featuredEvents = featuredEventIds;
        res.save();
      } else {
        const newFeaturedEvents = new this.marketModel(featuredEventIds);
        return await newFeaturedEvents.save();
      }
    } catch (error) {
      throwBadRequestError(error);
    }
  }

  // Get the featured events detail
  async getFeaturedEvents() {
    try {
      const res = await this.marketModel.findOne();
      const featuredEventIds = res.featuredEvents;
      const featuredEvents = this.eventModel.find({
        _id: {
          $in: featuredEventIds.map((id) => new mongoose.Types.ObjectId(id)),
        },
      });
      return featuredEvents;
    } catch (error) {
      throwBadRequestError(error);
    }
  }

  // Get the n latest events
  async getLatestEvents(limit: number, createdOnBefore?: string) {
    try {
      if (createdOnBefore) {
        const latestEvents = await this.eventModel
          .find({ _id: { $gt: new mongoose.Types.ObjectId(createdOnBefore) } })
          .sort({ _id: 'asc' })
          .limit(limit);
        return latestEvents;
      } else {
        const latestEvents = await this.eventModel.find().sort({ _id: 'asc' }).limit(limit);
        return latestEvents;
      }
    } catch (error) {
      throwBadRequestError(error);
    }
  }
}
