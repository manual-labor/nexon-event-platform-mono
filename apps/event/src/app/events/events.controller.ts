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
  EventRewardHistoryResponseDto
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
}
