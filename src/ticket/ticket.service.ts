import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as moment from 'moment';
import { Model } from 'mongoose';
import { EventService } from '../event/event.service';
import { MarketEventTicketPreviewsDTO } from '../market/dto/market.dto';
import { StorageService } from '../storage/storage.service';
import { throwBadRequestError } from '../utils/httpError';
import { DeleteResponseDTO } from '../utils/httpResponse.dto';
import {
  TicketDTO,
  TicketCollectionDTO,
  updateTicketCollectionImagesDTO,
  VIPTicketDTO,
  TicketQuotaCheckResultDTO,
  ResaleTicketPurchasePermissionDTO,
  RequestResaleTicketPurchasePermissionResult,
  PriceDTO,
} from './dto/ticket.dto';
import { MyTicketsDTO, TicketTransactionPermissionDTO, UpdateTicketOwnershipDTO } from './dto/ticketTransaction.dto';
import { Ticket, TicketCollection, TicketTypeKeyName, TicketTypeKeys } from './interface/ticket.interface';
import { UserService } from '../user/user.service';
import { TICKET_UTILIZE_TIME_LIMIT_SEC } from '../utils/constants';
import { CustomerUser } from '../user/user.interface';

@Injectable()
export class TicketService {
  constructor(
    private storageService: StorageService,
    private eventService: EventService,
    private userService: UserService,
  ) {}
  @InjectModel('TicketCollection') private ticketCollectionModel: Model<TicketCollection>;

  // Create a record of tickets generated
  async createTicketCollection(
    ticketCollection: TicketCollectionDTO,
    eventOrganizerId: string,
  ): Promise<TicketCollection> {
    try {
      await new this.ticketCollectionModel(ticketCollection).validate();
      const event = await this.eventService.getEvent(ticketCollection.subjectOf);
      if (!event) throw new BadRequestException('Invalid event ID');
      if (event.ticketCollectionId) throw new ConflictException('This event already has a ticket set associated.');

      // Save the ticket
      const savedTicketCollection = await this.ticketCollectionModel.create(ticketCollection);

      // Save the event
      event.ticketCollectionId = savedTicketCollection._id?.toString();
      const updateEventPayload = {
        ...event,
        eventId: savedTicketCollection.subjectOf,
        eventOrganizerId,
      };
      await this.eventService.updateEvent(updateEventPayload, eventOrganizerId);

      // Return the ticket set created
      return savedTicketCollection;
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Get the ticket set information by ID
  async getTicketCollectionByID(ticketCollectionId: string): Promise<TicketCollection> {
    try {
      const ticketCollection = await this.ticketCollectionModel.findById(ticketCollectionId);
      if (!ticketCollection) throw new NotFoundException(`Ticket set #${ticketCollectionId} not found`);
      return ticketCollection;
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Get the ticket information by ID
  async getTicketByID(eventId: string, ticketId: string): Promise<Ticket> {
    const event = await this.eventService.getEvent(eventId);
    if (!event) {
      throw new NotFoundException(`Event with _id: ${eventId} cannot be found`);
    }
    const ticketCollectionId = event.ticketCollectionId;
    try {
      const ticketCollection = await this.getTicketCollectionByID(ticketCollectionId);
      let matchedTicket: Ticket;
      TicketTypeKeys.forEach((key) => {
        if (ticketCollection.tickets[key]) {
          const matchingTicket = ticketCollection.tickets[key].find((ticket) => ticket._id.toString() === ticketId);
          if (matchingTicket) {
            matchedTicket = matchingTicket;
          }
        }
      });
      if (!matchedTicket) {
        throw new NotFoundException(`Ticket #${ticketId} not found`);
      }
      return matchedTicket;
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Get all tickets belonging to an event
  async getTicketsOfEvent(eventId: string): Promise<TicketCollection> {
    try {
      const tickets = await this.ticketCollectionModel.findOne({ subjectOf: eventId });
      return tickets;
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Get all tickets belonging to an event
  async getTicketPreviews(eventId: string): Promise<MarketEventTicketPreviewsDTO> {
    try {
      const ticketCollection = await this.ticketCollectionModel.findOne({ subjectOf: eventId });
      const ticketPreviews = {
        vip: ticketCollection.tickets.vip.slice(0, 1),
        general: ticketCollection.tickets.general.slice(0, 1),
        reservedSeat: ticketCollection.tickets.reservedSeat.slice(0, 1),
      };
      return { tickets: ticketPreviews, ticketPrice: ticketCollection.ticketPrice };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Get all tickets belonging to a person including those they own and those they are selling
  async getTicketsOfUser(walletAddress: string): Promise<MyTicketsDTO> {
    try {
      const ticketCollections = await this.ticketCollectionModel.find().exec();
      const allTickets = ticketCollections.flatMap((tc) => [
        ...tc.tickets.general,
        ...tc.tickets.vip,
        ...tc.tickets.reservedSeat,
      ]);

      // this array contains all the tickets the user currently owns
      const myTickets = allTickets.filter((ticket) => {
        const ownerHistory = ticket.ownerHistory;
        if (ownerHistory && ownerHistory.length > 0) {
          return ownerHistory[ownerHistory.length - 1] === walletAddress;
        }
        return false;
      });

      // this array contains all the tickets the user currnely lists for sale
      const myTicketListing = allTickets.filter((ticket) => {
        const ownerHistory = ticket.ownerHistory;
        if (ownerHistory && ownerHistory.length > 0) {
          return (
            ownerHistory[ownerHistory.length - 1] === ownerHistory[0] &&
            ownerHistory[ownerHistory.length - 2] === walletAddress
          );
        }
        return false;
      });
      return {
        myTickets,
        myTicketListing,
      };
    } catch (error) {
      throwBadRequestError(error);
    }
  }

  // Get all tickets belonging to a person including those they own and those they are selling
  async getTicketsOfUserFromMultipleWalletAddresses(walletAddressList: string[]): Promise<MyTicketsDTO> {
    try {
      const ticketCollections = await this.ticketCollectionModel.find().exec();
      const allTickets = ticketCollections.flatMap((tc) => [
        ...tc.tickets.general,
        ...tc.tickets.vip,
        ...tc.tickets.reservedSeat,
      ]);

      let myTickets = [];
      let myTicketListing = [];

      walletAddressList.forEach((walletAddress) => {
        // this array contains all the tickets the user currently owns
        const _myTickets = allTickets.filter((ticket) => {
          const ownerHistory = ticket.ownerHistory;
          if (ownerHistory && ownerHistory.length > 0) {
            return ownerHistory[ownerHistory.length - 1] === walletAddress;
          }
          return false;
        });

        // this array contains all the tickets the user currnely lists for sale
        const _myTicketListing = allTickets.filter((ticket) => {
          const ownerHistory = ticket.ownerHistory;
          if (ownerHistory && ownerHistory.length > 0) {
            return (
              ownerHistory[ownerHistory.length - 1] === ownerHistory[0] &&
              ownerHistory[ownerHistory.length - 2] === walletAddress
            );
          }
          return false;
        });

        myTickets = [...myTickets, ..._myTickets];
        myTicketListing = [...myTicketListing, ..._myTicketListing];
      });

      // remove all duplicates in myTickets
      myTickets = myTickets.filter((ticket, index, self) => {
        return self.findIndex((t) => t._id.toString() === ticket._id.toString()) === index;
      });
      // remove all duplicates in myTicketListing
      myTicketListing = myTicketListing.filter((ticket, index, self) => {
        return self.findIndex((t) => t._id.toString() === ticket._id.toString()) === index;
      });

      return {
        myTickets,
        myTicketListing,
      };
    } catch (error) {
      throwBadRequestError(error);
    }
  }

  // Update ticket set details
  async updateTicketCollection(ticketCollection: TicketCollectionDTO, ownerId: string): Promise<TicketCollection> {
    try {
      const ticketCollectionToBeUpdated = await this.ticketCollectionModel.findById(ticketCollection._id);
      if (!ticketCollectionToBeUpdated) {
        throw new NotFoundException(`Ticket set #${ticketCollection._id} not found`);
      }
      if (ticketCollectionToBeUpdated.ownerId.toString() !== ownerId) {
        throw new UnauthorizedException(`You do not have the permission to edit this ticket set`);
      }
      const a = await this.ticketCollectionModel.findByIdAndUpdate(ticketCollection._id, ticketCollection, {
        new: true,
      });
      return a;
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Update ticket set images
  async updateTicketCollectionImages(
    files: Express.Multer.File[],
    mediaUploadPayload: updateTicketCollectionImagesDTO,
    ownerId: string,
  ) {
    const { folder, metadata, ticketCollectionId } = mediaUploadPayload;
    try {
      const ticketCollectionToBeUpdated = await this.ticketCollectionModel.findById(ticketCollectionId);
      if (ticketCollectionToBeUpdated && ticketCollectionToBeUpdated.ownerId.toString() !== ownerId) {
        throw new UnauthorizedException(`You do not have the permission to edit this ticket set`);
      }
      if (!ticketCollectionToBeUpdated) {
        const filesData = files.map((file) => {
          return {
            path: `media/${folder}/${file.originalname}`,
            contentType: file.mimetype,
            media: file.buffer,
            metadata: JSON.parse(metadata),
          };
        });

        return this.storageService.saveFiles(filesData);
      }
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Update ticket details
  async updateTicket(
    ticket: TicketDTO | VIPTicketDTO,
    ticketCollectionId: string,
    ownerId: string,
    isTransactionUpdate?: boolean,
    walletAddress?: string,
  ): Promise<TicketDTO | VIPTicketDTO> {
    // Update the wallet address associated to the user
    try {
      if (walletAddress) {
        this.userService.updateAssociatedWalletAddress(ownerId, walletAddress);
      }
    } catch (error) {
      throwBadRequestError(error);
    }

    try {
      const ticketToBeUpdated = await this.ticketCollectionModel.findById(ticketCollectionId);
      if (!ticketToBeUpdated) {
        throw new NotFoundException(`Ticket set #${ticketCollectionId} not found`);
      }

      //TODO: Debug this statement
      // if (!isTransactionUpdate && ticketToBeUpdated.ownerId.toString() !== ownerId) {
      //   throw new UnauthorizedException(`You do not have the permission to edit this ticket`);
      // }

      const ticketCollectionToBeUpdated = await this.ticketCollectionModel.findById(ticketCollectionId);
      const ticketTypes = Object.keys(ticketCollectionToBeUpdated.tickets);
      let _key = '';
      let _index = 0;
      ticketTypes.forEach((key) => {
        ticketCollectionToBeUpdated.tickets[key].forEach((item, index) => {
          if (item._id.toString() === ticket._id.toString()) {
            ticketCollectionToBeUpdated.tickets[key][index] = Object.assign(
              ticketCollectionToBeUpdated.tickets[key][index],
              ticket,
            );
            _key = key;
            _index = index;
          }
        });
      });
      const savedTicketCollection = await this.ticketCollectionModel.updateOne(
        { _id: ticketCollectionId },
        ticketCollectionToBeUpdated,
      );
      if (savedTicketCollection) {
        return ticketCollectionToBeUpdated.tickets[_key][_index];
      }
    } catch (error) {
      throwBadRequestError(error);
    }
  }

  // Delete an eventset with the specified ID
  async deleteTicket(ticketCollectionId: string, ownerId: string): Promise<DeleteResponseDTO> {
    const ticketCollectionToBeDeleted = await this.ticketCollectionModel.findById(ticketCollectionId);
    if (!ticketCollectionToBeDeleted) {
      throw new NotFoundException(`Ticket set #${ticketCollectionId} not found`);
    }
    if (ticketCollectionToBeDeleted.ownerId.toString() !== ownerId) {
      throw new UnauthorizedException(`You do not have the permission to delete this ticket set`);
    }
    try {
      return await this.ticketCollectionModel.findByIdAndDelete(ticketCollectionId);
    } catch (error) {
      throwBadRequestError(error);
    }
  }

  /**
   * This service is called when the user buys a ticket from the market, either directly or from a resale ticket listing
   *
   * Parameters:
   * - walletAddress
   *
   * Checks:
   * It checks if the ticket is actually on sale (from the smart contract in the frontend)
   * It checks if the user is currently the owner of the ticket (if so, throw error)
   *
   * Next step:
   * - the client shall execute the buy function of the smart contract call the buy function of the smart contract
   * - ensure that the ticket status in the smart contract isSold is true
   */
  async checkTicketPurchasePermission(
    walletAddress: `0x${string}`,
    eventId: string,
    ticketCollectionId: string,
    ticketId: string,
    userId: string,
  ): Promise<TicketTransactionPermissionDTO> {
    try {
      const _ticket = await this.getTicketByID(eventId, ticketId);
      if (_ticket.ownerHistory.at(-1) === walletAddress) {
        return { allowed: false, reason: 'You cannot purchase your own ticket' };
      }

      const _ticketQuotaCheckResult = await this.checkTicketPurchaseQuota(
        walletAddress,
        ticketCollectionId,
        TicketTypeKeyName[_ticket.ticketType],
        userId,
      );
      if (!_ticketQuotaCheckResult.allowPurchase) {
        return { allowed: false, reason: 'Maximum ticket quota reached' };
      }

      const _event = await this.eventService.getEvent(eventId);
      if (moment(new Date(_event.startDate)).add(-7, 'hours') < moment()) {
        return { allowed: false, reason: 'The event has already begun' };
      }

      return {
        allowed: true,
        reason: '',
      };
    } catch (error) {
      throwBadRequestError(error);
    }
  }

  /**
   * this service is called after the user successfully bought a ticket via smart contract interaction
   *
   * Parameters:
   * - walletAddress
   * - eventId
   * - ticketCollectionId
   * - ticketId
   *
   * Operations:
   * - add the walletAddress to the ticket
   * - add the user's wallet address to the ticket's owner history array
   */
  async recordTicketPurchase(
    walletAddress: `0x${string}`,
    eventId: string,
    ticketCollectionId: string,
    ticketId: string,
    userId: string,
  ): Promise<void> {
    const permission = await this.checkTicketPurchasePermission(
      walletAddress,
      eventId,
      ticketCollectionId,
      ticketId,
      userId,
    );
    if (!permission.allowed) {
      throw new ForbiddenException(permission.reason);
    }
    try {
      const _ticket = await this.getTicketByID(eventId, ticketId);
      const _event = await this.eventService.getEvent(eventId);
      _ticket?.ownerHistory.push(walletAddress);
      await this.updateTicket(_ticket, ticketCollectionId, userId, true);
    } catch (error) {
      throwBadRequestError(error);
    }
  }

  // Sell ticket
  async listTicketForSale(
    walletAddress: `0x${string}`,
    eventId: string,
    ticketCollectionId: string,
    ticketId: string,
    price: PriceDTO,
    userId: string,
  ): Promise<UpdateTicketOwnershipDTO> {
    const _ticket = await this.getTicketByID(eventId, ticketId);
    if (_ticket.ownerHistory.at(-1) !== walletAddress) {
      throw new ForbiddenException('You can only sell your own ticket');
    }
    _ticket.ownerHistory.push(_ticket.ownerHistory[0]);
    _ticket.price = price;
    await this.updateTicket(_ticket, ticketCollectionId, userId);
    return {
      success: true,
    };
  }

  // Update ticket's hasUsed status
  async utilizeTicket(eventId: string, ticketId: string, ownerId: string, generateSince: Date) {
    const now = moment();
    const limit = moment(now).add(TICKET_UTILIZE_TIME_LIMIT_SEC, 'seconds');
    const timeDiff = moment.duration(limit.diff(generateSince)).asSeconds();

    if (timeDiff <= 0) {
      throw new BadRequestException({
        message: 'qr_code_time_exceed',
      });
    }

    const _ticket = await this.getTicketByID(eventId, ticketId);
    const event = await this.eventService.getEvent(eventId);

    if (!_ticket.hasUsed) {
      _ticket.hasUsed = true;
    } else {
      throw new BadRequestException({
        message: 'ticket_already_used',
      });
    }

    await this.updateTicket(_ticket, event.ticketCollectionId, ownerId, false);
    return { success: true };
  }

  async getEventApplicantInfo(eventId: string, ticketId: string, userId: string, address: string) {
    const event = await this.eventService.getEvent(eventId);
    const ticket = await this.getTicketByID(eventId, ticketId);
    const user = await this.userService.getUserInfo(userId);

    if (ticket.ownerHistory.at(-1) !== address) {
      throw new BadRequestException('This ticket is not belong to this wallet address');
    }

    return { event, ticket, user };
  }

  // Check the user's ticket purchase quota
  async checkTicketPurchaseQuota(
    address: string,
    ticketCollectionId: string,
    ticketType: string,
    userId: string,
    smartContractTicketId?: number,
  ): Promise<TicketQuotaCheckResultDTO> {
    // Get the associated wallets of the user
    const user: CustomerUser = (await this.userService.findById(userId)) as CustomerUser;
    const associatedWalletAddresses = user.associatedWallet;

    const ownedTicketsResponse: MyTicketsDTO = await this.getTicketsOfUserFromMultipleWalletAddresses(
      associatedWalletAddresses,
    );
    const { myTickets, myTicketListing } = ownedTicketsResponse;

    const ticketCollection: TicketCollection = await this.getTicketCollectionByID(ticketCollectionId);
    const allTickets = [
      ...ticketCollection.tickets.general.map((ticket) => ticket._id.toString()),
      ...ticketCollection.tickets.vip.map((ticket) => ticket._id.toString()),
      ...ticketCollection.tickets.reservedSeat.map((ticket) => ticket._id.toString()),
    ];

    // Count owned tickets
    let ownedTicketsCount = 0;
    const _myTickets = myTickets.filter((ticket) => {
      return allTickets.includes(ticket._id.toString()) && TicketTypeKeyName[ticket.ticketType] === ticketType;
    });
    const _myTicketListing = myTicketListing.filter((ticket) => {
      return allTickets.includes(ticket._id.toString()) && TicketTypeKeyName[ticket.ticketType] === ticketType;
    });
    ownedTicketsCount = _myTickets.length + _myTicketListing.length;

    const quota = ticketCollection.ticketQuota[ticketType] ?? ticketCollection.ticketQuota['general'];

    // Check if there are any pending resale ticket purchase approvals
    let resalePurchaseApproved = false;
    let resalePurchasePendingApproval = false;
    if (smartContractTicketId !== undefined) {
      const permissionRequest = ticketCollection.resaleTicketPurchasePermission.find((request) => {
        return request.address === address && request.smartContractTicketId === smartContractTicketId;
      });
      resalePurchasePendingApproval = Boolean(permissionRequest && !Boolean(permissionRequest.approved));
      resalePurchaseApproved = Boolean(permissionRequest && permissionRequest.approved);
    }

    return {
      ownedTicketsCount,
      quota,
      allowPurchase: ownedTicketsCount < quota,
      resalePurchaseApproved,
      resalePurchasePendingApproval,
    };
  }

  // Request purchase ticket from event
  // Save the list of addresses that wants the permission to buy a resale ticket in an array
  async sendResaleTicketPurchaseRequest(
    permissionRequest: ResaleTicketPurchasePermissionDTO,
  ): Promise<RequestResaleTicketPurchasePermissionResult> {
    try {
      const ticketCollection = await this.ticketCollectionModel.findById(permissionRequest.ticketCollectionId);
      if (!ticketCollection) {
        throw new NotFoundException(`TicketCollection with ID ${permissionRequest.ticketCollectionId} not found`);
      }

      const matchingPermissionRequest = ticketCollection.resaleTicketPurchasePermission.find(
        (request) =>
          request.address === permissionRequest.address &&
          request.smartContractTicketId === permissionRequest.smartContractTicketId,
      );
      if (matchingPermissionRequest) {
        throw new ConflictException('The request has already been made');
      }

      ticketCollection.resaleTicketPurchasePermission.push(permissionRequest);
      await this.ticketCollectionModel.updateOne({ _id: permissionRequest.ticketCollectionId }, ticketCollection);
      return { success: true };
    } catch (error) {
      throwBadRequestError(error);
    }
  }

  // Approve the resale ticket purchase request
  async approveResaleTicketPurchaseRequest(
    ticketCollectionId: string,
    permissionId: string,
  ): Promise<ResaleTicketPurchasePermissionDTO[]> {
    const ticketCollection = await this.ticketCollectionModel.findById(ticketCollectionId);
    if (!ticketCollection) {
      throw new NotFoundException(`TicketCollection with ID ${ticketCollectionId} not found`);
    }

    // Finds the matching request and set approved to true
    ticketCollection.resaleTicketPurchasePermission = ticketCollection.resaleTicketPurchasePermission.map(
      (permission: ResaleTicketPurchasePermissionDTO) => {
        return {
          ...permission,
          approved: permission._id?.toString() == permissionId,
        };
      },
    );
    try {
      await this.ticketCollectionModel.updateOne({ _id: ticketCollectionId }, ticketCollection);
      return ticketCollection.resaleTicketPurchasePermission;
    } catch (error) {
      throwBadRequestError(error);
    }
  }
}
