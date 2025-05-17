import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { EventsService } from './events.service';

import { 
  CreateEventDto, 
  UpdateEventDto, 
  EventResponseDto 
} from './dto/event.dto';
import { 
  CreateRewardDto, 
  UpdateRewardDto, 
  RewardResponseDto,
  RequestRewardDto
} from './dto/reward.dto';
import { AttendanceRequestDto, AttendanceResponseDto } from './dto/attendance.dto';
import { FriendInviteRequestDto, FriendInviteResponseDto } from './dto/friend.dto';

interface UserPayload {
  id: string;
  email: string;
  role: string;
  name?: string;
}

@Controller()
@UsePipes(new ValidationPipe({ transform: true }))
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @GrpcMethod('EventService', 'GetEvents')
  async getEvents(): Promise<{ events: EventResponseDto[] }> {
    const events = await this.eventsService.getEventsList();
    return { events };
  }

  @GrpcMethod('EventService', 'GetEventDetail')
  async getEventDetail(data: { id: string }): Promise<EventResponseDto> {
    return this.eventsService.getEventDetail(data.id);
  }

  @GrpcMethod('EventService', 'CreateEvent')
  async createEvent(data: { eventData: CreateEventDto; user: UserPayload }): Promise<EventResponseDto> {
    return this.eventsService.createEvent(data.eventData, data.user.id);
  }

  @GrpcMethod('EventService', 'UpdateEvent')
  async updateEvent(data: { eventId: string; eventData: UpdateEventDto; user: UserPayload }): Promise<EventResponseDto> {
    return this.eventsService.updateEvent(data.eventId, data.eventData, data.user.id);
  }

  @GrpcMethod('EventService', 'CreateReward')
  async createReward(data: { 
    eventId: string; 
    rewardData: CreateRewardDto[]; 
    user: UserPayload 
  }): Promise<{ rewards: RewardResponseDto[] }> {
    const rewards = await this.eventsService.createReward(data.eventId, data.rewardData, data.user.id);
    return { rewards };
  }

  @GrpcMethod('EventService', 'UpdateReward')
  async updateReward(data: { id: string; eventId: string; rewardData: UpdateRewardDto; user: UserPayload }): Promise<RewardResponseDto> {
    return this.eventsService.updateReward(data.id, data.rewardData, data.user.id);
  }

  @GrpcMethod('EventService', 'GetEventRewards')
  async getEventRewards(data: { eventId: string }): Promise<{ rewards: RewardResponseDto[] }> {
    const rewards = await this.eventsService.getEventRewards(data.eventId);
    return { rewards };
  }

  @GrpcMethod('EventService', 'InviteFriend')
  async inviteFriend(data: { inviteData: FriendInviteRequestDto; user: UserPayload }): Promise<FriendInviteResponseDto> {
    return this.eventsService.inviteFriend(data.inviteData, data.user.id, data.user.id);
  }

  @GrpcMethod('EventService', 'CheckAttendance')
  async checkAttendance(data: { user: UserPayload }): Promise<AttendanceResponseDto> {
    return this.eventsService.checkAttendance(data.user.id);
  }

  @GrpcMethod('EventService', 'RequestParticipationReward')
  async requestParticipationReward(data: { requestData: RequestRewardDto; user: UserPayload }) {
    return this.eventsService.requestReward(data.requestData, data.user.id);
  }

  @GrpcMethod('EventService', 'RequestReward')
  async requestReward(data: { eventId: string; userId: string; user: UserPayload }) {
    // 이벤트와 관련된 기본 리워드를 요청하는 방식으로 처리
    const requestDto: RequestRewardDto = {
      eventId: data.eventId,
      rewardId: data.eventId // 실제 구현에서는 이벤트에 연결된 특정 리워드 ID를 찾아서 사용해야 함
    };
    return this.eventsService.requestReward(requestDto, data.userId);
  }
  
  @GrpcMethod('EventService', 'GetRewardHistory')
  async getRewardHistory(data: { userId: string; user: UserPayload }) {
    // 현재 구현된 보상 이력 조회 로직을 적용하세요
    // 임시 응답 구조
    return { rewards: [] };
  }
}
