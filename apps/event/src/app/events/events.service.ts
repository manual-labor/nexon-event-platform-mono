import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Document, Types, Connection } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import { Event, EventDocument, EventStatus, EventConditionType } from './schemas/event.schema';
import { Reward, RewardDocument, RewardHistory, RewardHistoryDocument } from './schemas/reward.schema';
import { Friend, FriendDocument } from './schemas/friend.schema';
import { Attendance, AttendanceDocument } from './schemas/attendance.schema';
import { 
  EventNotFoundException,
  EventInactiveException,
  EventPeriodException,
  RewardAlreadyClaimedException,
} from '../common/exceptions/app-exception';
import { CreateEventDto, UpdateEventDto, EventResponseDto } from './dto/event.dto';
import { CreateRewardDto, UpdateRewardDto, RewardResponseDto, RequestRewardDto } from './dto/reward.dto';
import { FriendInviteRequestDto, FriendInviteResponseDto } from './dto/friend.dto';
import { AttendanceResponseDto } from './dto/attendance.dto';

interface BaseDocument extends Document {
  _id: Types.ObjectId;
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
  async getEventsList(): Promise<EventResponseDto[]> {
    const events = await this.eventModel.find({}).sort({ createdAt: -1 }).exec();
    return events.map(event => this.mapEventToDto(event));
  }

  // 이벤트 상세 정보 조회
  async getEventDetail(eventId: string): Promise<EventResponseDto> {
    const event = await this.findEventById(eventId);
    return this.mapEventToDto(event);
  }

  // 이벤트 생성
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
    
    Object.assign(event, {
      ...eventData,
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

  // 친구 초대
  async inviteFriend(inviteData: FriendInviteRequestDto, userId: string, userEmail: string): Promise<FriendInviteResponseDto> {
    // 자기 자신을 초대하는 경우 방지
    if (inviteData.inviteeEmail === userEmail) {
      throw new BadRequestException('자기 자신을 초대할 수 없습니다.');
    }
    
    // 이미 초대된 이메일인지 확인
    const existingInvite = await this.friendModel.findOne({ 
      inviteeEmail: inviteData.inviteeEmail,
    }).exec();
    
    if (existingInvite) {
      throw new ConflictException('이미 초대된 이메일입니다.');
    }
    
    const newInvite = new this.friendModel({
      inviterId: userId,
      inviteeEmail: inviteData.inviteeEmail,
    });
    
    const savedInvite = await newInvite.save();
    return this.mapFriendToDto(savedInvite);
  }

  // 출석 체크
  async checkAttendance(userId: string): Promise<AttendanceResponseDto> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // 오늘 이미 출석했는지 확인
    const existingAttendance = await this.attendanceModel.findOne({
      userId,
      attendanceDate: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
    }).exec();
    
    if (existingAttendance) {
      throw new ConflictException('오늘은 이미 출석했습니다.');
    }
    
    // 어제 출석했는지 확인하여 연속 출석 일수 계산
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const yesterdayAttendance = await this.attendanceModel.findOne({
      userId,
      attendanceDate: {
        $gte: yesterday,
        $lt: today,
      },
    }).sort({ createdAt: -1 }).exec();
    
    let consecutiveDays = 1;
    if (yesterdayAttendance) {
      consecutiveDays = yesterdayAttendance.consecutiveDays + 1;
    }
    
    const newAttendance = new this.attendanceModel({
      userId,
      attendanceDate: today,
      consecutiveDays,
    });
    
    const savedAttendance = await newAttendance.save();
    return this.mapAttendanceToDto(savedAttendance);
  }

  // 보상 신청
  async requestReward(requestData: RequestRewardDto, userId: string) {
    const { eventId, rewardId } = requestData;
    
    // 이벤트와 보상이 존재하는지 확인
    const event = await this.findEventById(eventId);
    const reward = await this.findRewardById(rewardId);
    
    // 이벤트가 활성 상태인지 확인
    if (event.status !== EventStatus.ONGOING) {
      throw new EventInactiveException();
    }
    
    // 이벤트 기간이 유효한지 확인
    const now = new Date().getTime();
    if (now < event.startDate.getTime() || now > event.endDate.getTime()) {
      throw new EventPeriodException();
    }
    
    // 이미 보상을 받았는지 확인
    const existingHistory = await this.rewardHistoryModel.findOne({
      userId,
      eventId,
      rewardId,
    }).exec();
    
    if (existingHistory) {
      throw new RewardAlreadyClaimedException();
    }
    
    // 조건을 충족했는지 확인
    await this.validateEventConditions(event, userId);

    // 세션 시작 및 트랜잭션 설정
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      // 보상 내역 생성
      const newHistory = new this.rewardHistoryModel({
        userId,
        eventId,
        rewardId,
        claimed: true,
        claimedAt: new Date(),
      });
      
      await newHistory.save({ session });
      
      // 트랜잭션 커밋
      await session.commitTransaction();
      session.endSession();
      
      return {
        success: true,
        message: '보상이 성공적으로 지급되었습니다.',
        reward: this.mapRewardToDto(reward),
      };
    } catch (error) {
      // 에러 발생 시 롤백
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  // 이벤트 조건 검증
  private async validateEventConditions(event: EventDocumentWithTimestamps, userId: string): Promise<void> {
    for (const condition of event.conditions) {
      switch (condition.type) {
        case EventConditionType.CONSECUTIVE_ATTENDANCE:
          await this.validateConsecutiveAttendance(userId, condition.value);
          break;
        case EventConditionType.FRIEND_INVITE:
          await this.validateFriendInvites(userId, condition.value);
          break;
        default:
          // 다른 조건 타입이 추가될 경우 여기에 구현
          break;
      }
    }
  }

  // 연속 출석 조건 검증
  private async validateConsecutiveAttendance(userId: string, requiredDays: number): Promise<void> {
    const latestAttendance = await this.attendanceModel.findOne({ userId })
      .sort({ createdAt: -1 })
      .exec();
    
    if (!latestAttendance || latestAttendance.consecutiveDays < requiredDays) {
      throw new BadRequestException(`연속 출석 조건(${requiredDays}일)을 충족하지 않았습니다.`);
    }
  }

  // 친구 초대 조건 검증
  private async validateFriendInvites(userId: string, requiredInvites: number): Promise<void> {
    const inviteCount = await this.friendModel.countDocuments({ inviterId: userId });
    
    if (inviteCount < requiredInvites) {
      throw new BadRequestException(`친구 초대 조건(${requiredInvites}명)을 충족하지 않았습니다.`);
    }
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

  private mapEventToDto(event: EventDocumentWithTimestamps): EventResponseDto {
    return {
      id: event._id.toString(),
      title: event.title,
      description: event.description,
      status: event.status,
      startDate: event.startDate,
      endDate: event.endDate,
      conditions: event.conditions,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    };
  }

  private mapRewardToDto(reward: RewardDocumentWithTimestamps): RewardResponseDto {
    return {
      id: reward._id.toString(),
      eventId: reward.eventId.toString(),
      name: reward.name,
      type: reward.type,
      quantity: reward.quantity,
      description: reward.description,
      createdAt: reward.createdAt,
      updatedAt: reward.updatedAt,
    };
  }

  private mapFriendToDto(friend: FriendDocumentWithTimestamps): FriendInviteResponseDto {
    return {
      id: friend._id.toString(),
      inviterId: friend.inviterId.toString(),
      inviteeEmail: friend.inviteeEmail,
      inviteeId: friend.inviteeId?.toString(),
      isRegistered: friend.isRegistered,
      createdAt: friend.createdAt,
    };
  }

  private mapAttendanceToDto(attendance: AttendanceDocumentWithTimestamps): AttendanceResponseDto {
    return {
      id: attendance._id.toString(),
      userId: attendance.userId.toString(),
      attendanceDate: attendance.attendanceDate,
      consecutiveDays: attendance.consecutiveDays,
      createdAt: attendance.createdAt,
    };
  }

  private validateEventDateRange(startDate: Date, endDate: Date): void {
    if (startDate.getTime() >= endDate.getTime()) {
      throw new EventPeriodException('시작 시간은 마감 시간보다 앞서야 합니다.');
    }
  }

  private getEventStatusFromDates(startDate: Date, endDate: Date): EventStatus {
    const nowTime: number = new Date().getTime();
      if(endDate.getTime() >= nowTime) {
        return EventStatus.ENDED;
      }

      if(startDate.getTime() >= nowTime && nowTime <= endDate.getTime()) {
        return EventStatus.ONGOING;
      }

     return EventStatus.UPCOMING;
  }
}
