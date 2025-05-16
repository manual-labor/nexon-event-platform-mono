import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../constants/error-codes';

/**
 * 에러 응답의 표준 인터페이스
 */
export interface ErrorResponse {
  status: number;
  message: string;
  errorCode: ErrorCode;
  error?: string;
  timestamp?: string;
  path?: string;
  details?: Record<string, any>;
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
      status: statusCode,
      message,
      errorCode,
      timestamp: new Date().toISOString(),
      details,
    };
    
    super(errorResponse, statusCode);
    this.errorResponse = errorResponse;
  }

  getErrorResponse(): ErrorResponse {
    return this.errorResponse;
  }

  getErrorCode(): ErrorCode {
    return this.errorResponse.errorCode;
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
 * 잘못된 인증 정보일 때 발생하는 예외
 */
export class InvalidCredentialsException extends AppException {
  constructor(message = '이메일 또는 비밀번호가 올바르지 않습니다', details?: Record<string, any>) {
    super('INVALID_CREDENTIALS', message, HttpStatus.BAD_REQUEST, details);
  }
}

/**
 * 비밀번호가 필요한 경우 발생하는 예외
 */
export class PasswordRequiredException extends AppException {
  constructor(message = '비밀번호가 설정되지 않은 계정입니다', details?: Record<string, any>) {
    super('PASSWORD_REQUIRED', message, HttpStatus.BAD_REQUEST, details);
  }
}

/**
 * 이메일이 이미 존재하는 경우 발생하는 예외
 */
export class EmailAlreadyExistsException extends AppException {
  constructor(message = '이미 존재하는 이메일입니다', details?: Record<string, any>) {
    super('EMAIL_ALREADY_EXISTS', message, HttpStatus.BAD_REQUEST, details);
  }
} 