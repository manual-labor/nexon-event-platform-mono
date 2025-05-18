import { ExceptionFilter, Catch, ArgumentsHost, Logger, HttpStatus } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { UserNotFoundException } from '../exceptions/app-exception';

/**
 * 사용자를 찾을 수 없을 때 발생하는 예외를 처리하는 필터
 */
@Catch(UserNotFoundException)
export class UserNotFoundExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(UserNotFoundExceptionFilter.name);

  catch(exception: UserNotFoundException, host: ArgumentsHost) {
    const errorResponse = exception.getErrorResponse();
    
    this.logger.warn(
      `[사용자 조회 실패] ${errorResponse.message}`,
      errorResponse.details || {},
    );

    if (host.getType() === 'rpc') {
      throw new RpcException({
        message: '초대자를 찾을 수 없습니다.',
        status: HttpStatus.BAD_REQUEST,
        errorCode: 'E1001'
      });
    }

    // HTTP 요청인 경우 (로컬 개발 환경 등)
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    
    response.status(HttpStatus.BAD_REQUEST).json({
      message: '초대자를 찾을 수 없습니다.',
      status: HttpStatus.BAD_REQUEST,
      errorCode: 'E1001',
      timestamp: new Date().toISOString()
    });
  }
} 