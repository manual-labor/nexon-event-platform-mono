import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode, ERROR_CODES } from '../constants/error-codes';

/**
 * 에러 응답의 표준 인터페이스
 */
export interface ErrorResponse {
  error: {
    name: string;
    message: string;
    code?: string;
    details?: Record<string, any>;
  };
}

/**
 * 애플리케이션 전체에서 사용할 커스텀 예외 클래스
 */
export class AppException extends HttpException {
  private readonly errorResponse: ErrorResponse;

  constructor(
    errorCode: ErrorCode,
    message: string,
    statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
    details?: Record<string, any>
  ) {
    const errorResponse: ErrorResponse = {
      error: {
        name: errorCode,
        message,
        code: ERROR_CODES[errorCode],
        details
      }
    };
    
    super(errorResponse, statusCode);
    this.errorResponse = errorResponse;
  }

  getErrorResponse(): ErrorResponse {
    return this.errorResponse;
  }

  getErrorCode(): ErrorCode {
    return this.errorResponse.error.name as ErrorCode;
  }
}

/**
 * 이벤트를 찾을 수 없을 때 발생하는 예외
 */
export class EventNotFoundException extends AppException {
  constructor(message = '이벤트를 찾을 수 없습니다', details?: Record<string, any>) {
    super('EVENT_NOT_FOUND', message, HttpStatus.NOT_FOUND, details);
  }
}

/**
 * 보상을 이미 받았을 때 발생하는 예외
 */
export class RewardAlreadyClaimedException extends AppException {
  constructor(message = '이미 보상을 받았습니다', details?: Record<string, any>) {
    super('REWARD_ALREADY_CLAIMED', message, HttpStatus.BAD_REQUEST, details);
  }
}

/**
 * 이벤트가 활성 상태가 아닐 때 발생하는 예외
 */
export class EventInactiveException extends AppException {
  constructor(message = '진행 중인 이벤트가 아닙니다', details?: Record<string, any>) {
    super('EVENT_INACTIVE', message, HttpStatus.BAD_REQUEST, details);
  }
}

/**
 * 이벤트 기간이 아닐 때 발생하는 예외
 */
export class EventPeriodException extends AppException {
  constructor(message = '이벤트 기간이 아닙니다', details?: Record<string, any>) {
    super('EVENT_EXPIRED', message, HttpStatus.BAD_REQUEST, details);
  }
}

/**
 * 보상이 없을 때 발생하는 예외
 */
export class NoRewardsAvailableException extends AppException {
  constructor(message = '이벤트에 등록된 보상이 없습니다', details?: Record<string, any>) {
    super('NO_REWARDS_AVAILABLE', message, HttpStatus.BAD_REQUEST, details);
  }
}

/**
 * 보상 수량이 모두 소진되었을 때 발생하는 예외
 */
export class RewardQuantityExhaustedException extends AppException {
  constructor(message = '보상 수량이 모두 소진되었습니다', details?: Record<string, any>) {
    super('REWARD_QUANTITY_EXHAUSTED', message, HttpStatus.BAD_REQUEST, details);
  }
}

/**
 * 사용자를 찾을 수 없을 때 발생하는 예외
 */
export class UserNotFoundException extends AppException {
  constructor(message = '사용자를 찾을 수 없습니다', details?: Record<string, any>) {
    super('USER_NOT_FOUND', message, HttpStatus.NOT_FOUND, details);
  }
}

/**
 * 서비스 간 통신 오류가 발생했을 때 사용하는 예외
 */
export class ServiceCommunicationException extends AppException {
  constructor(message = '서비스 통신 중 오류가 발생했습니다', details?: Record<string, any>) {
    super('SERVICE_COMMUNICATION_ERROR', message, HttpStatus.INTERNAL_SERVER_ERROR, details);
  }
} 