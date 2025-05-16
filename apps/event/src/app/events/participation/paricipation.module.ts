import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ParticipationController } from './participation.controller';
import { ParticipationService } from './participation.service';
import { Event, EventSchema } from '../schemas/event.schema';
import { Reward, RewardSchema, RewardHistory, RewardHistorySchema } from '../schemas/reward.schema';
import { Friend, FriendSchema } from '../schemas/friend.schema';
import { Attendance, AttendanceSchema } from '../schemas/attendance.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Event.name, schema: EventSchema },
      { name: Reward.name, schema: RewardSchema },
      { name: RewardHistory.name, schema: RewardHistorySchema },
      { name: Friend.name, schema: FriendSchema },
      { name: Attendance.name, schema: AttendanceSchema },
    ]),
  ],
  controllers: [ParticipationController],
  providers: [ParticipationService],
  exports: [ParticipationService],
})
export class ParticipationModule {}
