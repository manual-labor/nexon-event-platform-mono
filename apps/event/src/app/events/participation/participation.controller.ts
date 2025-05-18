import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { FriendInviteRequestDto, FriendInviteResponseDto } from '../dto/friend.dto';
import { AttendanceResponseDto } from '../dto/attendance.dto';
import { RequestRewardDto } from '../dto/reward.dto';
import { ParticipationService } from './participation.service';

interface UserPayload {
  id: string;
  email: string;
  role: string;
}

@Controller('participation')
@UsePipes(new ValidationPipe({ transform: true }))
export class ParticipationController {
  constructor(private readonly participationService: ParticipationService) {}

  // 친구 초대 API
  @MessagePattern({ cmd: 'invite-friends' })
  async inviteFriend(@Payload() data: { inviteData: FriendInviteRequestDto; user: UserPayload }): Promise<FriendInviteResponseDto> {
    return this.participationService.inviteFriend(data.inviteData, data.user.id, data.user.email);
  }

  // 출석 체크 API
  @MessagePattern({ cmd: 'check-attendance' })
  async checkAttendance(@Payload() data: { user: UserPayload }): Promise<AttendanceResponseDto> {
    return this.participationService.checkAttendance(data.user.id);
  }

  // 보상 신청 API
  @MessagePattern({ cmd: 'request-reward' })
  async requestReward(@Payload() data: { requestData: RequestRewardDto; user: UserPayload }) {
    return this.participationService.requestReward(data.requestData, data.user.id);
  }
}
