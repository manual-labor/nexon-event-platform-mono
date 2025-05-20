import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Document, Types } from 'mongoose';
import { Event, EventDocument, EventStatus, EventConditionType } from '../schemas/event.schema';
import { Reward, RewardDocument, RewardHistory, RewardHistoryDocument, RewardHistoryStatus } from '../schemas/reward.schema';
import { Friend, FriendDocument } from '../schemas/friend.schema';
import { Attendance, AttendanceDocument } from '../schemas/attendance.schema';
import { 
  EventNotFoundException,
  EventInactiveException,
  EventPeriodException,
  RewardAlreadyClaimedException,
  UserNotFoundException,
} from '../../common/exceptions/app-exception';
import { FriendInviteRequestDto, FriendInviteResponseDto } from '../dto/friend.dto';
import { AttendanceResponseDto } from '../dto/attendance.dto';
import { RewardResponseDto, RequestRewardDto, RewardHistoryResponseDto } from '../dto/reward.dto';
import {
  getNowUtcDate,
  parseToUTCDate,
  getStartOfDayKst, // KST 기준으로 하루의 시작
} from '../../utils/date.util';
import { AuthGatewayClientService } from '../../internal-service/auth-gateway-client.service';

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
export class ParticipationService {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<EventDocumentWithTimestamps>,
    @InjectModel(Reward.name) private rewardModel: Model<RewardDocumentWithTimestamps>,
    @InjectModel(RewardHistory.name) private rewardHistoryModel: Model<RewardHistoryDocument & BaseDocument>,
    @InjectModel(Friend.name) private friendModel: Model<FriendDocumentWithTimestamps>,
    @InjectModel(Attendance.name) private attendanceModel: Model<AttendanceDocumentWithTimestamps>,
    private readonly authGatewayClientService: AuthGatewayClientService,
  ) {}

  // 친구 초대
  async inviteFriend(inviteData: FriendInviteRequestDto, userId: string, userEmail: string): Promise<FriendInviteResponseDto> {

    if (inviteData.inviterEmail === userEmail) {
      throw new BadRequestException('자기 자신을 초대할 수 없습니다.');
    }
    
    const existingInvite = await this.friendModel.findOne({ 
      inviteeEmail: userEmail,
    }).exec();
    
    if (existingInvite) {
      throw new ConflictException('이미 초대를 받았던 이력이 있습니다.');
    }
    
    const inviter = await this.authGatewayClientService.getUserByEmail(inviteData.inviterEmail);
    
    if (!inviter) {
      throw new UserNotFoundException("초대자를 찾을 수 없습니다.");
    }
    
    const newInvite = new this.friendModel({
      inviterId: inviter.id,
      inviterEmail: inviteData.inviterEmail,
      inviteeId: userId,
      inviteeEmail: userEmail,
    });
    
    const savedInvite = await newInvite.save();
    return this.mapFriendToDto(savedInvite);
  }

  // 출석 체크
  async checkAttendance(userId: string): Promise<AttendanceResponseDto> {
    // 출석일은 KST 기준으로 하루의 시작으로 기록합니다.
    const todayKstStart = getStartOfDayKst(); 
    const tomorrowKstStart = getStartOfDayKst(new Date(todayKstStart.getTime() + 24 * 60 * 60 * 1000));
    
    const existingAttendance = await this.attendanceModel.findOne({
      userId,
      attendanceDate: {
        $gte: todayKstStart,
        $lt: tomorrowKstStart,
      },
    }).exec();
    
    if (existingAttendance) {
      throw new ConflictException('오늘은 이미 출석했습니다.');
    }
    
    const yesterdayKstStart = getStartOfDayKst(new Date(todayKstStart.getTime() - 24 * 60 * 60 * 1000));
    
    const yesterdayAttendance = await this.attendanceModel.findOne({
      userId,
      attendanceDate: {
        $gte: yesterdayKstStart, 
        $lt: todayKstStart, 
      },
    }).sort({ createdAt: -1 }).exec(); // createdAt은 UTC
    
    let consecutiveDays = 1;
    if (yesterdayAttendance) {
      consecutiveDays = yesterdayAttendance.consecutiveDays + 1;
    }
    
    const savedAttendance = await new this.attendanceModel({
      userId,
      attendanceDate: todayKstStart,
      consecutiveDays,
    }).save();

    return this.mapAttendanceToDto(savedAttendance);
  }

  // 보상 신청
  async requestReward(requestData: RequestRewardDto, userId: string): Promise<RewardHistoryResponseDto> {
    const { eventId, rewardId } = requestData;
    
    const event = await this.findEventById(eventId);
    const reward = await this.findRewardById(rewardId);
    
    if (event.status !== EventStatus.ONGOING) {
      throw new EventInactiveException('진행 중인 이벤트가 아닙니다.');
    }
    
    const nowUtc = getNowUtcDate();
    const startDateUtc = parseToUTCDate(event.startDate);
    const endDateUtc = parseToUTCDate(event.endDate);
    
    if (nowUtc.getTime() < startDateUtc.getTime() || nowUtc.getTime() > endDateUtc.getTime()) {
      throw new EventPeriodException('이벤트 기간이 아닙니다.');
    }
    
    const existingHistory = await this.rewardHistoryModel.findOne({
      userId: new Types.ObjectId(userId),
      eventId: new Types.ObjectId(eventId),
      rewardId: new Types.ObjectId(rewardId),
    }).exec();
    
    if (existingHistory) {
      throw new RewardAlreadyClaimedException('이미 보상을 요청했거나 지급받았습니다.');
    }
    
    await this.validateEventConditions(event, userId);
    
    const newRewardHistory = new this.rewardHistoryModel({
      userId: new Types.ObjectId(userId),
      eventId: new Types.ObjectId(eventId),
      rewardId: new Types.ObjectId(rewardId),
      name: reward.name,
      type: reward.type,
      quantity: reward.quantity,
      description: reward.description,
      unitValue: reward.unitValue,
      status: RewardHistoryStatus.PENDING, 
      rewardAt: null, // UTC
    });
    
    const savedHistory = await newRewardHistory.save();
    
    return this.mapRewardHistoryToDto(savedHistory);
  }

  // 이벤트 조건 검증
  private async validateEventConditions(event: EventDocumentWithTimestamps, userId: string): Promise<void> {
    if (!event.condition) {
      return;
    }

    const condition = event.condition;
    switch (condition.type) {
      case EventConditionType.CONSECUTIVE_ATTENDANCE:
        await this.validateConsecutiveAttendance(userId, condition.value);
        break;
      case EventConditionType.INVITE_FRIEND:
        await this.validateFriendInvites(userId, condition.value);
        break;
      default:
        break;
    }
  }

  private async validateConsecutiveAttendance(userId: string, requiredDays: number): Promise<void> {
    const latestAttendance = await this.attendanceModel.findOne({ userId })
      .sort({ createdAt: -1 }) // createdAt은 UTC
      .exec();
    
    if (!latestAttendance || latestAttendance.consecutiveDays < requiredDays) {
      throw new BadRequestException(`연속 출석 조건(${requiredDays}일)을 충족하지 않았습니다.`);
    }
  }

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
      throw new BadRequestException('보상을 찾을 수 없습니다.');
    }
    
    return reward;
  }

  private mapRewardToDto(reward: RewardDocumentWithTimestamps): RewardResponseDto {
    return {
      rewardId: reward._id.toString(),
      eventId: reward.eventId.toString(),
      name: reward.name,
      type: reward.type,
      quantity: reward.quantity,
      description: reward.description,
      unitValue: reward.unitValue,
    };
  }

  private mapFriendToDto(friend: FriendDocumentWithTimestamps): FriendInviteResponseDto {
    return {
      inviterId: friend.inviterId.toString(),
      inviterEmail: friend.inviterEmail.toString(),
    };
  }

  private mapAttendanceToDto(attendance: AttendanceDocumentWithTimestamps): AttendanceResponseDto {
    return {
      id: attendance._id.toString(),
      userId: attendance.userId.toString(),
      attendanceDate: attendance.attendanceDate, // UTC Date 객체
      consecutiveDays: attendance.consecutiveDays,
    };
  }

  private mapRewardHistoryToDto(history: RewardHistoryDocument & BaseDocument): RewardHistoryResponseDto {
    return {
      historyId: (history._id as Types.ObjectId).toString(),
      userId: (history.userId as Types.ObjectId).toString(),
      eventId: (history.eventId as Types.ObjectId).toString(),
      rewardId: (history.rewardId as Types.ObjectId).toString(),
      name: history.name,
      type: history.type,
      quantity: history.quantity,
      description: history.description,
      unitValue: history.unitValue,
      status: history.status as RewardHistoryStatus,
      rewardAt: history.rewardAt,
      createdAt: history.createdAt,
    };
  }
}
