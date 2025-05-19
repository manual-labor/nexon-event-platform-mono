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
  ServiceCommunicationException
} from '../../common/exceptions/app-exception';
import { FriendInviteRequestDto, FriendInviteResponseDto } from '../dto/friend.dto';
import { AttendanceResponseDto } from '../dto/attendance.dto';
import { RewardResponseDto, RequestRewardDto, RewardHistoryResponseDto } from '../dto/reward.dto';
import { AuthClientService } from '../../gateway-client/auth-client.service';

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
    private readonly authClientService: AuthClientService,
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
    
    const inviter = await this.authClientService.getUserByEmail(inviteData.inviterEmail);
    
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
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
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
    
    const savedAttendance = await new this.attendanceModel({
      userId,
      attendanceDate: today,
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
    
    const now = new Date();
    if (now < event.startDate || now > event.endDate) {
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
    
    // 이벤트 조건을 충족했는지 확인
    await this.validateEventConditions(event, userId);
    
    const newRewardHistory = new this.rewardHistoryModel({
      userId: new Types.ObjectId(userId),
      eventId: new Types.ObjectId(eventId),
      rewardId: new Types.ObjectId(rewardId),
      status: RewardHistoryStatus.PENDING, 
      rewardAt: null,
    });
    
    const savedHistory = await newRewardHistory.save();
    
    return this.mapRewardHistoryToDto(savedHistory);
  }

  // 이벤트 조건 검증
  private async validateEventConditions(event: EventDocumentWithTimestamps, userId: string): Promise<void> {
    if (!event.condition) {
      return; // 조건이 없으면 검증 통과
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
        // 다른 조건 타입이 추가될 경우 여기에 구현
        break;
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

  // Helper 메서드
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
      id: reward._id.toString(),
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
      attendanceDate: attendance.attendanceDate,
      consecutiveDays: attendance.consecutiveDays,
    };
  }

  // RewardHistory를 DTO로 매핑하는 헬퍼 메서드
  private mapRewardHistoryToDto(history: RewardHistoryDocument & BaseDocument): RewardHistoryResponseDto {
    return {
      id: (history._id as Types.ObjectId).toString(),
      userId: (history.userId as Types.ObjectId).toString(),
      eventId: (history.eventId as Types.ObjectId).toString(),
      rewardId: (history.rewardId as Types.ObjectId).toString(),
      status: history.status as RewardHistoryStatus,
      rewardAt: history.rewardAt,
      createdAt: history.createdAt,
    };
  }
}
