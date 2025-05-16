import { Body, Controller, Get, Param, Post, Put, Query, Request, UseGuards } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Roles } from '../decorators/roles.decorator';
import { UserRole } from '../../interfaces/user.interface';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { RpcClientProxyService} from '../services/rpc-client-proxy.service';
import { RoleValidationService } from '../services/role-validation.service';
import { EventDto, RewardDto } from '../dto/event.dto';
import { RequestUser } from '../interfaces/request-user.interface';
import { FriendInviteDto, RequestRewardDto as ParticipationRewardDto } from '../dto/event-participation.dto';

@Controller('event')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EventController {
  constructor(
    @Inject('EVENT_SERVICE') private readonly eventClient: ClientProxy,
    private readonly rpcClientProxyService: RpcClientProxyService,
    private readonly roleValidationService: RoleValidationService,
  ) { }

  @Get()
  async getEvents() {
    return this.rpcClientProxyService.send(
      this.eventClient,
      { cmd: 'get-events' },
      {}
    );
  }

  @Get(':eventId')
  async getEvent(@Param('eventId') eventId: string) {
    return this.rpcClientProxyService.send(
      this.eventClient,
      { cmd: 'get-event-detail' },
      { id: eventId }
    );
  }

  @Get(':eventId/rewards')
  async getEventRewards(@Param('eventId') eventId: string) {
    return this.rpcClientProxyService.send(
      this.eventClient,
      { cmd: 'get-event-rewards' },
      { eventId }
    );
  }

  @Roles(UserRole.OPERATOR, UserRole.ADMIN)
  @Post()
  async createEvent(@Body() eventData: EventDto, @Request() req: { user: RequestUser }) {
    return this.rpcClientProxyService.send(
      this.eventClient,
      { cmd: 'create-event' },
      {
        eventData,
        user: req.user
      }
    );
  }

  @Roles(UserRole.OPERATOR, UserRole.ADMIN)
  @Put(':eventId')
  async updateEvent(
    @Param('eventId') eventId: string, 
    @Body() eventData: EventDto, 
    @Request() req: { user: RequestUser }
  ) {
    return this.rpcClientProxyService.send(
      this.eventClient,
      { cmd: 'update-event' },
      {
        eventId,
        eventData,
        user: req.user
      }
    );
  }

  @Roles(UserRole.OPERATOR, UserRole.ADMIN)
  @Post(':eventId/rewards')
  async createReward(
    @Param('eventId') eventId: string, 
    @Body() rewardData: Array<RewardDto>, 
    @Request() req: { user: RequestUser }
  ) {
    return this.rpcClientProxyService.send(
      this.eventClient,
      { cmd: 'create-reward' },
      {
        eventId, 
        rewardData,
        user: req.user
      }
    );
  }

  @Roles(UserRole.OPERATOR, UserRole.ADMIN)
  @Put(':eventId/rewards/:rewardId')
  async updateReward(
    @Param('eventId') eventId: string,
    @Param('rewardId') rewardId: string,
    @Body() rewardData: Partial<RewardDto>,
    @Request() req: { user: RequestUser }
  ) {
    return this.rpcClientProxyService.send(
      this.eventClient,
      { cmd: 'update-reward' },
      {
        id: rewardId,
        eventId,
        rewardData,
        user: req.user
      }
    );
  }

  @Roles(UserRole.USER, UserRole.ADMIN)
  @Post(':eventId/rewards/request')
  async requestReward(@Param('eventId') eventId: string, @Request() req: { user: RequestUser }) {
    return this.rpcClientProxyService.send(
      this.eventClient,
      { cmd: 'request-reward' },
      {
        eventId, 
        userId: req.user.id,
        user: req.user
      }
    );
  }

  @Get('rewards/history')
  async getRewardHistory(@Request() req: { user: RequestUser }, @Query('userId') userId?: string) {
    if (!this.roleValidationService.hasManagementRole(req.user.role) && userId !== req.user.id) {
      userId = req.user.id;
    }
    
    return this.rpcClientProxyService.send(
      this.eventClient,
      { cmd: 'get-reward-history' },
      {
        userId,
        user: req.user
      }
    );
  }

  @Roles(UserRole.USER, UserRole.ADMIN)
  @Post('participate/friends')
  async inviteFriend(@Body() inviteData: FriendInviteDto, @Request() req: { user: RequestUser }) {
    return this.rpcClientProxyService.send(
      this.eventClient,
      { cmd: 'request/friends' },
      {
        inviteData,
        user: req.user
      }
    );
  }

  @Roles(UserRole.USER, UserRole.ADMIN)
  @Post('participate/attendance')
  async checkAttendance(@Request() req: { user: RequestUser }) {
    return this.rpcClientProxyService.send(
      this.eventClient,
      { cmd: 'request/attendance' },
      {
        user: req.user
      }
    );
  }

  @Roles(UserRole.USER, UserRole.ADMIN)
  @Post('participate/reward')
  async requestParticipationReward(@Body() requestData: ParticipationRewardDto, @Request() req: { user: RequestUser }) {
    return this.rpcClientProxyService.send(
      this.eventClient,
      { cmd: 'request/reward' },
      {
        requestData,
        user: req.user
      }
    );
  }
}
