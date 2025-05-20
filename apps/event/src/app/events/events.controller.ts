import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { MessagePattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
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
  RequestRewardDto,
  RewardHistoryResponseDto,
  EventRewardHistoryResponseDto,
  UpdateRewardHistoryStatusDto
} from './dto/reward.dto';
import { AttendanceResponseDto } from './dto/attendance.dto';
import { FriendInviteRequestDto, FriendInviteResponseDto } from './dto/friend.dto';
import { UserRole } from '../interfaces/user.interface';

interface UserPayload {
  id: string;
  email: string;
  role: string;
}

@Controller()
@UsePipes(new ValidationPipe({ transform: true }))
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @MessagePattern({ cmd: 'get-events' })
  async getEventsList(@Payload() data: { user?: { role: UserRole }, status?: string }): Promise<EventResponseDto[]> {
    return this.eventsService.getEventsList(data?.user?.role, data?.status);
  }

  @MessagePattern({ cmd: 'get-event-detail' })
  async getEventDetail(@Payload() data: { id: string }): Promise<EventResponseDto> {
    return this.eventsService.getEventDetail(data.id);
  }

  @MessagePattern({ cmd: 'create-event' })
  async createEvent(@Payload() data: { eventData: CreateEventDto; user: UserPayload }): Promise<EventResponseDto> {
    return this.eventsService.createEvent(data.eventData, data.user.id);
  }

  @MessagePattern({ cmd: 'update-event' })
  async updateEvent(@Payload() data: { eventId: string; eventData: UpdateEventDto; user: UserPayload }): Promise<EventResponseDto> {
    return this.eventsService.updateEvent(data.eventId, data.eventData, data.user.id);
  }

  @MessagePattern({ cmd: 'create-reward' })
  async createReward(@Payload() data: { 
    eventId: string; 
    rewardData: CreateRewardDto | CreateRewardDto[]; 
    user: UserPayload 
  }): Promise<RewardResponseDto[]> {
    return this.eventsService.createReward(data.eventId, data.rewardData, data.user.id);
  }

  @MessagePattern({ cmd: 'update-reward' })
  async updateReward(@Payload() data: { id: string; rewardData: UpdateRewardDto; user: UserPayload }): Promise<RewardResponseDto> {
    return this.eventsService.updateReward(data.id, data.rewardData, data.user.id);
  }

  @MessagePattern({ cmd: 'get-event-rewards' })
  async getEventRewards(@Payload() data: { eventId: string }): Promise<RewardResponseDto[]> {
    return this.eventsService.getEventRewards(data.eventId);
  }

  @MessagePattern({ cmd: 'update-reward-history-status' })
  async updateRewardHistoryStatus(@Payload() data: { 
    historyId: string; 
    statusData: UpdateRewardHistoryStatusDto; 
    user: UserPayload 
  }): Promise<RewardHistoryResponseDto> {
    return this.eventsService.updateRewardHistoryStatus(data.historyId, data.statusData, data.user.id);
  }

  @MessagePattern({ cmd: 'get-reward-history' })
  async getRewardHistory(@Payload() data: { 
    userId?: string;
    eventId?: string;
    user: UserPayload;
  }): Promise<EventRewardHistoryResponseDto[]> {
    return this.eventsService.getRewardHistory(
      data.userId || data.user.id, 
      data.user.role as UserRole,
      data.eventId
    );
  }

  @MessagePattern({ cmd: 'delete-event' })
  async deleteEvent(@Payload() data: { 
    id: string;
    user: UserPayload 
  }): Promise<{ success: boolean; message: string }> {
    // ADMIN과 OPERATOR 역할 검증
    if (![UserRole.ADMIN, UserRole.OPERATOR].includes(data.user.role as UserRole)) {
      throw new Error('삭제 권한이 없습니다. 관리자 또는 운영자만 이벤트를 삭제할 수 있습니다.');
    }
    return this.eventsService.deleteEvent(data.id);
  }

  @MessagePattern({ cmd: 'delete-reward' })
  async deleteReward(@Payload() data: { 
    id: string;
    user: UserPayload 
  }): Promise<{ success: boolean; message: string }> {
    // ADMIN과 OPERATOR 역할 검증
    if (![UserRole.ADMIN, UserRole.OPERATOR].includes(data.user.role as UserRole)) {
      throw new Error('삭제 권한이 없습니다. 관리자 또는 운영자만 보상을 삭제할 수 있습니다.');
    }
    return this.eventsService.deleteReward(data.id);
  }
}
