import { ExceptionFilter, Catch, ArgumentsHost, Logger } from '@nestjs/common';
import { Response } from 'express';
import { RpcException } from '@nestjs/microservices';
import { AppException, ErrorResponse } from '../exceptions/app-exception';

/**
 * 애플리케이션 커스텀 예외를 처리하는 필터
 * 마이크로서비스 환경에서 사용되며 RPC 요청에서 발생하는 예외를 처리함
 */
@Catch(AppException)
export class AppExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(AppExceptionFilter.name);

  catch(exception: AppException, host: ArgumentsHost) {
    if (host.getType() === 'rpc') {
      this.handleRpcException(exception);
      return;
    }

    // HTTP 요청인 경우 (로컬 개발 환경 등에서 사용)
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const errorResponse = exception.getErrorResponse();
    const statusCode = exception.getStatus();

    this.logger.error(
      `[AppException] ${errorResponse.error.message}`,
      errorResponse.error.details || {},
    );

    response.status(statusCode).json(errorResponse);
  }

  private handleRpcException(exception: AppException) {
    const errorResponse = exception.getErrorResponse();
    
    this.logger.error(
      `[AppException] ${errorResponse.error.message}`,
      errorResponse.error.details || {},
    );

    // 마이크로서비스 요청에 대한 응답을 위해 RpcException으로 변환
    throw new RpcException(errorResponse);
  }
} 