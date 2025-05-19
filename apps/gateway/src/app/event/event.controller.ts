import { Body, Controller, Get, Param, Post, Put, Query, Request, UseGuards, Patch } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Roles } from '../decorators/roles.decorator';
import { UserRole } from '../../interfaces/user.interface';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { RpcClientProxyService} from '../services/rpc-client-proxy.service';
import { RoleValidationService } from '../services/role-validation.service';
import { EventDto, EventResponseDto as EventServiceEventResponseDto, RewardDto, UpdateRewardHistoryStatusDto } from '../dto/event.dto';
import { RewardResponseDto as EventServiceRewardResponseDto, RewardHistoryResponseDto as EventServiceRewardHistoryResponseDto } from '../dto/reward.dto';
import { RequestUser } from '../../interfaces/user.interface';
import { FriendInviteDto } from '../dto/event-participation.dto';
import { AttendanceResponseDto as EventServiceAttendanceResponseDto } from '../dto/attendance.dto';
import { FriendInviteResponseDto as EventServiceFriendInviteResponseDto } from '../dto/friend.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiBody } from '@nestjs/swagger';

@ApiTags('Event')
@ApiBearerAuth()
@Controller('event')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EventController {
  constructor(
    @Inject('EVENT_SERVICE') private readonly eventClient: ClientProxy,
    private readonly rpcClientProxyService: RpcClientProxyService,
    private readonly roleValidationService: RoleValidationService,
  ) { }

  @Get()
  @ApiOperation({ summary: '이벤트 목록 조회', description: '상태별 이벤트 목록을 조회합니다.' })
  @ApiQuery({ name: 'status', required: false, description: '이벤트 상태 필터 (UPCOMING, ONGOING, ENDED 등)', type: String })
  @ApiResponse({ status: 200, description: '이벤트 목록 조회 성공', type: [EventServiceEventResponseDto] })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async getEvents(@Request() req: { user: RequestUser }, @Query('status') status?: string) {

    return this.rpcClientProxyService.send(
      this.eventClient,
      { cmd: 'get-events' },
      { user: req.user, status }
    );
  }

  @Get(':eventId')
  @ApiOperation({ summary: '특정 이벤트 상세 조회' })
  @ApiResponse({ status: 200, description: '이벤트 상세 조회 성공', type: EventServiceEventResponseDto })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 404, description: '이벤트를 찾을 수 없음' })
  async getEvent(@Param('eventId') eventId: string) {
    return this.rpcClientProxyService.send(
      this.eventClient,
      { cmd: 'get-event-detail' },
      { id: eventId }
    );
  }

  @Get(':eventId/rewards')
  @ApiOperation({ summary: '특정 이벤트의 보상 목록 조회' })
  @ApiResponse({ status: 200, description: '이벤트 보상 목록 조회 성공', type: [EventServiceRewardResponseDto] })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 404, description: '이벤트를 찾을 수 없음' })
  async getEventRewards(@Param('eventId') eventId: string) {
    return this.rpcClientProxyService.send(
      this.eventClient,
      { cmd: 'get-event-rewards' },
      { eventId }
    );
  }

  @Roles(UserRole.OPERATOR, UserRole.ADMIN)
  @Post()
  @ApiOperation({ summary: '새 이벤트 생성 (운영자/관리자)' })
  @ApiBody({ type: EventDto })
  @ApiResponse({ status: 201, description: '이벤트 생성 성공', type: EventServiceEventResponseDto })
  @ApiResponse({ status: 400, description: '잘못된 요청 형식' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 403, description: '권한 없음' })
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
  @ApiOperation({ summary: '이벤트 정보 수정 (운영자/관리자)' })
  @ApiBody({ type: EventDto })
  @ApiResponse({ status: 200, description: '이벤트 정보 수정 성공', type: EventServiceEventResponseDto })
  @ApiResponse({ status: 400, description: '잘못된 요청 형식' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '이벤트를 찾을 수 없음' })
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
  @ApiOperation({ summary: '이벤트에 보상 추가 (운영자/관리자)', description: '하나 이상의 보상을 배열로 추가합니다.' })
  @ApiBody({ type: [RewardDto], description: '추가할 보상 정보 배열' })
  @ApiResponse({ status: 201, description: '보상 추가 성공', type: [EventServiceRewardResponseDto] })
  @ApiResponse({ status: 400, description: '잘못된 요청 형식' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '이벤트를 찾을 수 없음' })
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
  @ApiOperation({ summary: '이벤트 보상 정보 수정 (운영자/관리자)' })
  @ApiBody({ type: RewardDto, description: '수정할 보상 정보 (부분 업데이트 가능)' })
  @ApiResponse({ status: 200, description: '보상 정보 수정 성공', type: EventServiceRewardResponseDto })
  @ApiResponse({ status: 400, description: '잘못된 요청 형식' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '이벤트 또는 보상을 찾을 수 없음' })
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

  @Roles(UserRole.OPERATOR, UserRole.ADMIN)
  @Patch('rewards/history/:historyId/status')
  @ApiOperation({ summary: '보상 지급 내역 상태 변경 (운영자/관리자)' })
  @ApiBody({ type: UpdateRewardHistoryStatusDto })
  @ApiResponse({ status: 200, description: '보상 지급 내역 상태 변경 성공', type: EventServiceRewardHistoryResponseDto })
  @ApiResponse({ status: 400, description: '잘못된 요청 형식' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '보상 지급 내역을 찾을 수 없음' })
  async updateRewardHistoryStatus(
    @Param('historyId') historyId: string,
    @Body() statusData: UpdateRewardHistoryStatusDto,
    @Request() req: { user: RequestUser }
  ) {
    return this.rpcClientProxyService.send(
      this.eventClient,
      { cmd: 'update-reward-history-status' },
      {
        historyId,
        statusData,
        user: req.user
      }
    );
  }

  @Get('rewards/history')
  @ApiOperation({ summary: '보상 지급 내역 조회 (운영자/관리자/감사자/유저)', description: '관리자, 운영자, 감시자는 모든 내역 조회 가능, 일반 유저는 본인 내역만 조회.' })
  @ApiQuery({ name: 'userId', required: false, description: '사용자 ID (관리자/운영자/감시자만 필터링 가능)', type: String })
  @ApiQuery({ name: 'eventId', required: false, description: '이벤트 ID (필터링용)', type: String })
  @ApiResponse({ status: 200, description: '보상 지급 내역 조회 성공', type: [EventServiceRewardHistoryResponseDto] })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async getRewardHistory(
    @Request() req: { user: RequestUser }, 
    @Query('userId') userId?: string,
    @Query('eventId') eventId?: string
  ) {
    // 관리자 권한이 아니면 본인의 보상 내역만 조회 가능
    if (!this.roleValidationService.hasManagementRole(req.user.role) && userId !== req.user.id) {
      userId = req.user.id;
    }
    
    return this.rpcClientProxyService.send(
      this.eventClient,
      { cmd: 'get-reward-history' },
      {
        userId,
        eventId,
        user: req.user
      }
    );
  }

  @Roles(UserRole.USER, UserRole.ADMIN)
  @Post('participation/invite-friends')
  @ApiOperation({ summary: '친구 초대 (사용자/관리자)' })
  @ApiBody({ type: FriendInviteDto })
  @ApiResponse({ status: 201, description: '친구 초대 성공 또는 요청 처리됨', type: EventServiceFriendInviteResponseDto })
  @ApiResponse({ status: 400, description: '잘못된 요청 형식' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async inviteFriend(@Body() inviteData: FriendInviteDto, @Request() req: { user: RequestUser }) {
    return this.rpcClientProxyService.send(
      this.eventClient,
      { cmd: 'invite-friends' },
      {
        inviteData,
        user: req.user
      }
    );
  }

  @Roles(UserRole.USER, UserRole.ADMIN)
  @Post('participation/check-attendance')
  @ApiOperation({ summary: '출석 체크 (사용자/관리자)' })
  @ApiResponse({ status: 201, description: '출석 체크 성공', type: EventServiceAttendanceResponseDto })
  @ApiResponse({ status: 400, description: '이미 출석했거나 조건 미충족' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async checkAttendance(@Request() req: { user: RequestUser }) {
    return this.rpcClientProxyService.send(
      this.eventClient,
      { cmd: 'check-attendance' },
      {
        user: req.user
      }
    );
  }

  @Roles(UserRole.USER, UserRole.ADMIN)
  @Post('participation/:eventId/rewards/:rewardId/claim')
  @ApiOperation({ summary: '이벤트 보상 요청 (사용자/관리자)' })
  @ApiResponse({ status: 201, description: '보상 요청 성공/처리됨', type: EventServiceRewardHistoryResponseDto })
  @ApiResponse({ status: 400, description: '잘못된 요청 또는 보상 조건 미충족/소진' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 404, description: '이벤트 또는 보상을 찾을 수 없음' })
  async claimReward(
    @Param('eventId') eventId: string,
    @Param('rewardId') rewardId: string,
    @Request() req: { user: RequestUser }
  ) {
    const requestData = { eventId, rewardId };
    return this.rpcClientProxyService.send(
      this.eventClient,
      { cmd: 'request-reward' },
      {
        requestData,
        user: req.user
      }
    );
  }
}