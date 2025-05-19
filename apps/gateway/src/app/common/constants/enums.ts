export enum EventStatus {
    UPCOMING = 'UPCOMING',     // 진행 예정
    ONGOING = 'ONGOING',       // 진행 중
    ENDED = 'ENDED',           // 진행 종료
    CANCELED = 'CANCELED',     // 취소됨
    INACTIVE = 'INACTIVE',     // 비활성화됨
  }
  
export enum EventConditionType {
    PARTICIPATION_VERIFICATION = 'PARTICIPATION_VERIFICATION',       // 참여 인증
    CONSECUTIVE_ATTENDANCE = 'CONSECUTIVE_ATTENDANCE',  // 연속 출석
    INVITE_FRIEND = 'INVITE_FRIEND',    // 친구 초대
}
  
export enum RewardType {
  POINT = 'POINT',       // 포인트
  ITEM = 'ITEM',         // 아이템
  COUPON = 'COUPON',     // 쿠폰
  CASH = 'CASH',         // 현금/캐시
  CUSTOM = 'CUSTOM',     // 기타
}

export enum RewardHistoryStatus {
  PENDING = 'PENDING',    // 확인 중
  SUCCESS = 'SUCCESS',    // 보상 성공
  FAILURE = 'FAILURE',    // 보상 실패
}