import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Document, Types, Connection, PipelineStage } from 'mongoose';
import { Event, EventDocument, EventStatus, EventConditionType } from './schemas/event.schema';
import { Reward, RewardDocument, RewardHistory, RewardHistoryDocument, RewardType, RewardHistoryStatus } from './schemas/reward.schema';
import { Friend, FriendDocument } from './schemas/friend.schema';
import { Attendance, AttendanceDocument } from './schemas/attendance.schema';
import { 
  EventNotFoundException,
  EventInactiveException,
  EventPeriodException,
  RewardAlreadyClaimedException,
  RewardHistoryNotFoundException
} from '../common/exceptions/app-exception';
import { CreateEventDto, UpdateEventDto, EventResponseDto } from './dto/event.dto';
import { 
  CreateRewardDto, 
  UpdateRewardDto, 
  RewardResponseDto, 
  RequestRewardDto,
  RewardHistoryResponseDto,
  EventRewardHistoryResponseDto,
  UpdateRewardHistoryStatusDto
} from './dto/reward.dto';
import { FriendInviteRequestDto, FriendInviteResponseDto } from './dto/friend.dto';
import { AttendanceResponseDto } from './dto/attendance.dto';
import { UserRole } from '../interfaces/user.interface';
import { ConfigService } from '@nestjs/config';
import {
  parseToUTCDate,
  getNowUtcDate,
  formatDateKst,
  getApplicationTimezone,
} from '../utils/date.util';

interface BaseDocument extends Document {
  id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

type EventDocumentWithTimestamps = EventDocument & BaseDocument;
type RewardDocumentWithTimestamps = RewardDocument & BaseDocument;
type FriendDocumentWithTimestamps = FriendDocument & BaseDocument;
type AttendanceDocumentWithTimestamps = AttendanceDocument & BaseDocument;

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<EventDocumentWithTimestamps>,
    @InjectModel(Reward.name) private rewardModel: Model<RewardDocumentWithTimestamps>,
    @InjectModel(RewardHistory.name) private rewardHistoryModel: Model<RewardHistoryDocument>,
    @InjectModel(Friend.name) private friendModel: Model<FriendDocumentWithTimestamps>,
    @InjectModel(Attendance.name) private attendanceModel: Model<AttendanceDocumentWithTimestamps>,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  // 이벤트 목록 조회
  async getEventsList(userRole?: UserRole, status?: string): Promise<EventResponseDto[]> {
    const query: Record<string, any> = {};
    
    if (userRole === UserRole.USER) {
      query.status = { $nin: [EventStatus.INACTIVE, EventStatus.CANCELED] };
    }

    if (status && Object.values(EventStatus).includes(status as EventStatus)) {
      query.status = status;
    }

    const events = await this.eventModel.find(query).sort({ createdAt: -1 }).exec();
    return events.map(event => this.mapEventToDto(event));
  }

  // 이벤트 상세 정보 조회
  async getEventDetail(eventId: string): Promise<EventResponseDto> {
    const event = await this.findEventById(eventId);
    const rewards = await this.rewardModel.find({ eventId: eventId }).exec();
    const eventObj = event instanceof Document && typeof event.toObject === 'function' 
      ? event.toObject() 
      : event;
    return this.mapEventToDto({ ...eventObj, rewards });
  }
  
  async createEvent(eventData: CreateEventDto, operatorId: string): Promise<EventResponseDto> {
    this.validateEventDateRange(eventData.startDate, eventData.endDate);

    const savedEvent = await new this.eventModel({
      ...eventData,
      createdBy: operatorId,
      status: this.getEventStatusFromDates(eventData.startDate, eventData.endDate),
    }).save();
    
    return this.mapEventToDto(savedEvent);
  }

  // 이벤트 수정
  async updateEvent(eventId: string, eventData: UpdateEventDto, operatorId: string): Promise<EventResponseDto> {
    const event = await this.findEventById(eventId);
    if(eventData.startDate && eventData.endDate) {
      this.validateEventDateRange(eventData.startDate, eventData.endDate);
    }

    const updateData = Object.fromEntries(
      Object.entries(eventData).filter(([key]) => key !== 'eventId')
    );

    Object.assign(event, {
      ...updateData,
      updatedBy: operatorId,
    });
    
    const updatedEvent = await event.save();
    return this.mapEventToDto(updatedEvent);
  }

  // 보상 생성
  async createReward(
    eventId: string, 
    rewardData: CreateRewardDto | CreateRewardDto[], 
    operatorId: string
  ): Promise<RewardResponseDto[]> {
    await this.findEventById(eventId);
    
    const rewardArray = Array.isArray(rewardData) ? rewardData : [rewardData];

    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const rewards: RewardDocumentWithTimestamps[] = [];

      for (const reward of rewardArray) {
        const newReward = new this.rewardModel({
          ...reward,
          eventId,
          createdBy: operatorId,
        });
        
        const savedReward = await newReward.save({ session });
        rewards.push(savedReward);
      }
      
      await session.commitTransaction();
      session.endSession();
      
      const responseRewards = rewards.map(reward => this.mapRewardToDto(reward));
      return responseRewards;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  // 보상 수정
  async updateReward(rewardId: string, rewardData: UpdateRewardDto, operatorId: string): Promise<RewardResponseDto> {
    const reward = await this.findRewardById(rewardId);
    
    Object.assign(reward, {
      ...rewardData,
      updatedBy: operatorId,
    });
    
    const updatedReward = await reward.save();
    return this.mapRewardToDto(updatedReward);
  }

  // 이벤트의 보상 목록 조회
  async getEventRewards(eventId: string): Promise<RewardResponseDto[]> {
    await this.findEventById(eventId);
    
    const rewards = await this.rewardModel.find({ eventId }).exec();
    return rewards.map(reward => this.mapRewardToDto(reward));
  }

  async updateRewardHistoryStatus(
    historyId: string, 
    updateData: UpdateRewardHistoryStatusDto,
    operatorId: string
  ): Promise<RewardHistoryResponseDto> {
    const history = await this.findRewardHistoryById(historyId);

    history.status = updateData.status;
    if (updateData.status === RewardHistoryStatus.SUCCESS) {
      history.rewardAt = new Date();
    } else {
      history.rewardAt = null;
    }

    const updatedHistory = await history.save();
    return this.mapRewardHistoryToDto(updatedHistory);
  }

  async getRewardHistory(
    userId: string | null,
    userRole: UserRole,
    eventId?: string,
  ): Promise<EventRewardHistoryResponseDto[]> {
    if (userRole === UserRole.USER && !userId) {
      throw new BadRequestException('사용자 ID가 필요합니다.');
    }
    if (eventId && !Types.ObjectId.isValid(eventId)) {
      throw new BadRequestException('유효하지 않은 이벤트 ID입니다.');
    }

    const match: Record<string, any> = {};
    if (userId) match.userId = new Types.ObjectId(userId);
    if (eventId) match.eventId = new Types.ObjectId(eventId);

    const pipeline: PipelineStage[] = [
      { $match: match },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: 'rewards',
          localField: 'rewardId',
          foreignField: '_id',
          as: 'rewardDetails',
        },
      },
      { $unwind: '$rewardDetails' },
      {
        $lookup: {
          from: 'events',
          localField: 'eventId',
          foreignField: '_id',
          as: 'eventDetails',
        },
      },
      { $unwind: '$eventDetails' },
      {
        $project: {
          _id: 1,
          userId: 1,
          eventId: 1,
          rewardId: 1,
          status: 1,
          rewardAt: 1,
          createdAt: 1,
          reward: {
            id: '$rewardDetails._id',
            name: '$rewardDetails.name',
            type: '$rewardDetails.type',
            quantity: '$rewardDetails.quantity',
            description: '$rewardDetails.description',
            unitValue: '$rewardDetails.unitValue',
          },
          eventTitle: '$eventDetails.title',
        },
      },
      {
        $group: {
          _id: '$eventId',
          eventTitle: { $first: '$eventTitle' },
          rewards: {
            $push: {
              id: '$_id',
              userId: '$userId',
              rewardId: '$rewardId',
              status: '$status',
              rewardAt: '$rewardAt',
              createdAt: '$createdAt',
              rewardDetails: '$reward',
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          eventId: { $toString: '$_id' },
          eventTitle: 1,
          rewards: {
            $map: {
              input: '$rewards',
              as: 'r',
              in: {
                historyId: { $toString: '$$r.id' },
                userId: { $toString: '$$r.userId' },
                rewardId: { $toString: '$$r.rewardId' },
                status: '$$r.status',
                rewardAt: '$$r.rewardAt',
                createdAt: '$$r.createdAt',
                rewardDetails: {
                  rewardId: { $toString: '$$r.rewardDetails.id' },
                  name: '$$r.rewardDetails.name',
                  type: '$$r.rewardDetails.type',
                  quantity: '$$r.rewardDetails.quantity',
                  description: '$$r.rewardDetails.description',
                  unitValue: '$$r.rewardDetails.unitValue',
                },
              },
            },
          },
        },
      },
    ];

    const raw = await this.rewardHistoryModel.aggregate(pipeline);
    return raw as EventRewardHistoryResponseDto[];
  }

  private async findEventById(eventId: string): Promise<EventDocumentWithTimestamps> {
    if (!Types.ObjectId.isValid(eventId)) {
      throw new BadRequestException('유효하지 않은 이벤트 ID입니다.');
    }
    
    const event = await this.eventModel.findById(eventId).exec();
    if (!event) {
      throw new EventNotFoundException();
    }
    
    return event;
  }

  private async findRewardById(rewardId: string): Promise<RewardDocumentWithTimestamps> {
    if (!Types.ObjectId.isValid(rewardId)) {
      throw new BadRequestException('유효하지 않은 보상 ID입니다.');
    }
    
    const reward = await this.rewardModel.findById(rewardId).exec();
    if (!reward) {
      throw new NotFoundException('보상을 찾을 수 없습니다.');
    }
    
    return reward;
  }

  private async findRewardHistoryById(historyId: string): Promise<RewardHistoryDocument> {
    if (!Types.ObjectId.isValid(historyId)) {
      throw new BadRequestException('유효하지 않은 보상 히스토리 ID입니다.');
    }
    const history = await this.rewardHistoryModel.findById(historyId).exec();
    if (!history) {
      throw new RewardHistoryNotFoundException();
    }
    return history;
  }

  private mapEventToDto(event: EventDocumentWithTimestamps): EventResponseDto {
    const eventObj = event instanceof Document && typeof event.toObject === 'function' 
      ? event.toObject() 
      : event;
      
    const { condition, ...eventData } = eventObj;
    
    return {
      eventId: event.id,
      title: event.title,
      description: event.description,
      status: event.status,
      startDate: event.startDate,
      endDate: event.endDate,
      condition: condition ? {
        type: condition.type,
        value: condition.value,
        description: condition.description
      } : undefined
    };
  }

  private mapRewardToDto(reward: RewardDocumentWithTimestamps): RewardResponseDto {
    return {
      rewardId: reward.id.toString(),
      eventId: reward.eventId.toString(),
      name: reward.name,
      type: reward.type,
      quantity: reward.quantity,
      description: reward.description,
      unitValue: reward.unitValue,
      createdAt: reward.createdAt,
      updatedAt: reward.updatedAt,
    };
  }

  private mapRewardHistoryToDto(history: RewardHistoryDocument): RewardHistoryResponseDto {
    return {
      historyId: history.id.toString(),
      userId: history.userId.toString(),
      eventId: history.eventId.toString(),
      rewardId: history.rewardId.toString(),
      status: history.status,
      rewardAt: history.rewardAt,
      createdAt: history.createdAt!,
    };
  }

  private validateEventDateRange(startDateInput: Date | string, endDateInput: Date | string): void {
    const startDate = parseToUTCDate(startDateInput);
    const endDate = parseToUTCDate(endDateInput);

    if (startDate.getTime() >= endDate.getTime()) {
      throw new EventPeriodException('시작 시간은 마감 시간보다 앞서야 합니다.');
    }
  }

  private getEventStatusFromDates(startDateInput: Date | string, endDateInput: Date | string): EventStatus {
    const startDateUtc = parseToUTCDate(startDateInput);
    const endDateUtc = parseToUTCDate(endDateInput);
    const nowUtc = getNowUtcDate();

    if (endDateUtc.getTime() <= nowUtc.getTime()) {
      return EventStatus.ENDED;
    }

    if (startDateUtc.getTime() <= nowUtc.getTime() && nowUtc.getTime() <= endDateUtc.getTime()) {
      return EventStatus.ONGOING;
    }

    return EventStatus.UPCOMING;
  }
}
