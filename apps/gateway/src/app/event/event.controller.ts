import { Body, Controller, Get, Param, Post, Put, Query, Request, UseGuards, OnModuleInit } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Roles } from '../decorators/roles.decorator';
import { UserRole } from '../../interfaces/user.interface';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { RpcClientProxyService} from '../services/rpc-client-proxy.service';
import { RoleValidationService } from '../services/role-validation.service';
import { EventDto, RewardDto } from '../dto/event.dto';
import { RequestUser } from '../interfaces/request-user.interface';
import { FriendInviteDto, RequestRewardDto as ParticipationRewardDto } from '../dto/event-participation.dto';
import { Observable } from 'rxjs';

// gRPC 인터페이스 정의
interface EventService {
  getEvents(data: Record<string, never>): Observable<any>;
  getEventDetail(data: { id: string }): Observable<any>;
  getEventRewards(data: { eventId: string }): Observable<any>;
  createEvent(data: { eventData: EventDto, user: RequestUser }): Observable<any>;
  updateEvent(data: { eventId: string, eventData: EventDto, user: RequestUser }): Observable<any>;
  createReward(data: { eventId: string, rewardData: RewardDto[], user: RequestUser }): Observable<any>;
  updateReward(data: { id: string, eventId: string, rewardData: Partial<RewardDto>, user: RequestUser }): Observable<any>;
  requestReward(data: { eventId: string, userId: string, user: RequestUser }): Observable<any>;
  getRewardHistory(data: { userId: string, user: RequestUser }): Observable<any>;
  inviteFriend(data: { inviteData: FriendInviteDto, user: RequestUser }): Observable<any>;
  checkAttendance(data: { user: RequestUser }): Observable<any>;
  requestParticipationReward(data: { requestData: ParticipationRewardDto, user: RequestUser }): Observable<any>;
}

@Controller('event')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EventController implements OnModuleInit {
  private eventService!: EventService;

  constructor(
    @Inject('EVENT_SERVICE') private readonly eventClient: ClientGrpc,
    private readonly rpcClientProxyService: RpcClientProxyService,
    private readonly roleValidationService: RoleValidationService,
  ) { }

  onModuleInit() {
    this.eventService = this.rpcClientProxyService.getService<EventService>(this.eventClient, 'EventService');
  }

  @Get()
  async getEvents() {
    return this.rpcClientProxyService.call(
      this.eventService,
      'getEvents',
      {}
    );
  }

  @Get(':eventId')
  async getEvent(@Param('eventId') eventId: string) {
    return this.rpcClientProxyService.call(
      this.eventService,
      'getEventDetail',
      { id: eventId }
    );
  }

  @Get(':eventId/rewards')
  async getEventRewards(@Param('eventId') eventId: string) {
    return this.rpcClientProxyService.call(
      this.eventService,
      'getEventRewards',
      { eventId }
    );
  }

  @Roles(UserRole.OPERATOR, UserRole.ADMIN)
  @Post()
  async createEvent(@Body() eventData: EventDto, @Request() req: { user: RequestUser }) {
    return this.rpcClientProxyService.call(
      this.eventService,
      'createEvent',
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
    return this.rpcClientProxyService.call(
      this.eventService,
      'updateEvent',
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
    return this.rpcClientProxyService.call(
      this.eventService,
      'createReward',
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
    return this.rpcClientProxyService.call(
      this.eventService,
      'updateReward',
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
    return this.rpcClientProxyService.call(
      this.eventService,
      'requestReward',
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
    
    return this.rpcClientProxyService.call(
      this.eventService,
      'getRewardHistory',
      {
        userId,
        user: req.user
      }
    );
  }

  @Roles(UserRole.USER, UserRole.ADMIN)
  @Post('participate/friends')
  async inviteFriend(@Body() inviteData: FriendInviteDto, @Request() req: { user: RequestUser }) {
    return this.rpcClientProxyService.call(
      this.eventService,
      'inviteFriend',
      {
        inviteData,
        user: req.user
      }
    );
  }

  @Roles(UserRole.USER, UserRole.ADMIN)
  @Post('participate/attendance')
  async checkAttendance(@Request() req: { user: RequestUser }) {
    return this.rpcClientProxyService.call(
      this.eventService,
      'checkAttendance',
      {
        user: req.user
      }
    );
  }

  @Roles(UserRole.USER, UserRole.ADMIN)
  @Post('participate/reward')
  async requestParticipationReward(@Body() requestData: ParticipationRewardDto, @Request() req: { user: RequestUser }) {
    return this.rpcClientProxyService.call(
      this.eventService,
      'requestParticipationReward',
      {
        requestData,
        user: req.user
      }
    );
  }
}
