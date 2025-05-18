export enum EventStatus {
    UPCOMING = 'UPCOMING',     // 진행 예정
    ONGOING = 'ONGOING',       // 진행 중
    ENDED = 'ENDED',           // 진행 종료
    CANCELED = 'CANCELED',     // 취소됨
  }
  
export enum EventConditionType {
    PARTICIPATION_VERIFICATION = 'PARTICIPATION_VERIFICATION',       // 참여 인증
    CONSECUTIVE_ATTENDANCE = 'CONSECUTIVE_ATTENDANCE',  // 연속 출석
    INVITE_FRIEND = 'INVITE_FRIEND',    // 친구 초대
}
  