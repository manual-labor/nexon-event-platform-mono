import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Observable, throwError } from 'rxjs';
import { AppException, ErrorResponse } from '../common/exceptions/app-exception';
import { GENERAL_ERROR_CODES } from '../common/constants/error-codes';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): Observable<never> {
    // RPC 컨텍스트 획득
    const rpcCtx = host.switchToRpc();
    const data = rpcCtx.getData();

    // 에러 핸들링
    if (exception instanceof AppException) {
      return this.handleAppException(exception);
    }

    if (this.isHttpException(exception)) {
      return this.handleHttpException(exception);
    }

    if (exception instanceof RpcException) {
      return this.handleRpcException(exception);
    }

    return this.handleUnknownException(exception);
  }

  private isHttpException(exception: unknown): exception is HttpException {
    return exception instanceof HttpException;
  }

  private handleAppException(exception: AppException): Observable<never> {
    const errorResponse = exception.getErrorResponse();
    
    this.logger.error(
      `AppException: ${JSON.stringify(errorResponse.error)}`,
      exception.stack,
    );

    return throwError(() => new RpcException(errorResponse));
  }

  private handleHttpException(exception: HttpException): Observable<never> {
    const status = exception.getStatus();
    const resp = exception.getResponse() as
      | { message?: string | string[]; error?: string; errorCode?: string }
      | string;

    const message =
      typeof resp === 'object' && resp.message
        ? resp.message
        : exception.message;
    const errorName = typeof resp === 'object' && resp.error ? resp.error : 'HTTP_ERROR';
    
    // 기존 예외에 errorCode가 없으면 상태 코드에 맞는 기본 에러 코드 사용
    const errorCode = 
      (typeof resp === 'object' && resp.errorCode) || 
      this.getDefaultErrorCodeByStatus(status);

    this.logger.error(
      `HTTP Exception (${status}): ${JSON.stringify({ message, errorName, errorCode })}`,
      exception.stack,
    );

    return throwError(() => new RpcException({
      error: {
        name: errorName,
        message: typeof message === 'string' ? message : message.join(', '),
        code: errorCode
      }
    }));
  }

  private handleRpcException(exception: RpcException): Observable<never> {
    const err = exception.getError();

    // 이미 표준화된 형식인지 확인
    if (typeof err === 'object' && err !== null && (err as any).error) {
      this.logger.error(`RPC Exception: ${JSON.stringify(err)}`, exception.stack);
      return throwError(() => exception);
    }
    
    // 표준화되지 않은 에러를 표준 형식으로 변환
    const formattedError = {
      error: {
        name: 'RPC_ERROR',
        message: typeof err === 'string' ? err : '알 수 없는 RPC 오류',
        code: GENERAL_ERROR_CODES.UNKNOWN_ERROR
      }
    };

    this.logger.error(`RPC Exception: ${JSON.stringify(formattedError)}`, exception.stack);
    return throwError(() => new RpcException(formattedError));
  }

  private handleUnknownException(exception: unknown): Observable<never> {
    const message =
      exception instanceof Error ? exception.message : '알 수 없는 오류';
    const stack = exception instanceof Error ? exception.stack : undefined;

    this.logger.error(`Unknown Exception: ${message}`, stack);

    return throwError(() =>
      new RpcException({
        error: {
          name: 'UNKNOWN_ERROR',
          message: message,
          code: GENERAL_ERROR_CODES.UNKNOWN_ERROR
        }
      }),
    );
  }
  
  private getDefaultErrorCodeByStatus(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return GENERAL_ERROR_CODES.VALIDATION_FAILED;
      case HttpStatus.UNAUTHORIZED:
        return GENERAL_ERROR_CODES.UNAUTHORIZED;
      case HttpStatus.FORBIDDEN:
        return GENERAL_ERROR_CODES.FORBIDDEN;
      case HttpStatus.NOT_FOUND:
        return GENERAL_ERROR_CODES.NOT_FOUND;
      default:
        return GENERAL_ERROR_CODES.INTERNAL_SERVER_ERROR;
    }
  }
}
