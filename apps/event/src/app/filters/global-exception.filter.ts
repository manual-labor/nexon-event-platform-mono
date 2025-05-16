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
      `AppException (${errorResponse.status}): ${JSON.stringify({
        message: errorResponse.message,
        errorCode: errorResponse.errorCode,
        details: errorResponse.details,
      })}`,
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
    const error = typeof resp === 'object' && resp.error ? resp.error : null;
    
    // 기존 예외에 errorCode가 없으면 상태 코드에 맞는 기본 에러 코드 사용
    const errorCode = 
      (typeof resp === 'object' && resp.errorCode) || 
      this.getDefaultErrorCodeByStatus(status);

    this.logger.error(
      `HTTP Exception (${status}): ${JSON.stringify({ message, error, errorCode })}`,
      exception.stack,
    );

    return throwError(() => new RpcException(this.createRpcError(status, message, error, errorCode)));
  }

  private handleRpcException(exception: RpcException): Observable<never> {
    const err = exception.getError();
    
    // 이미 RpcException인 경우 그대로 전달
    // 단, errorCode가 없으면 추가
    if (typeof err === 'object' && err !== null) {
      if (!(err as any).errorCode) {
        (err as any).errorCode = GENERAL_ERROR_CODES.UNKNOWN_ERROR;
      }
    }
    
    this.logger.error(`RPC Exception: ${JSON.stringify(err)}`, exception.stack);
    return throwError(() => exception);
  }

  private handleUnknownException(exception: unknown): Observable<never> {
    const message =
      exception instanceof Error ? exception.message : '알 수 없는 오류';
    const stack = exception instanceof Error ? exception.stack : undefined;

    this.logger.error(`Unknown Exception: ${message}`, stack);

    return throwError(() =>
      new RpcException(
        this.createRpcError(
          HttpStatus.INTERNAL_SERVER_ERROR,
          message,
          '서버 오류',
          GENERAL_ERROR_CODES.UNKNOWN_ERROR
        ),
      ),
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

  private createRpcError(
    status: number,
    message: string | string[],
    error: string | null,
    errorCode: string,
  ) {
    const rpcError: Record<string, any> = { 
      status, 
      message, 
      errorCode 
    };
    if (error) rpcError.error = error;
    return rpcError;
  }
}
