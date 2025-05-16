import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Observable, catchError } from 'rxjs';

interface ErrorResponse {
  message: string;
  error: string;
  status?: number;
}

@Injectable()
export class RpcClientProxyService {
  public send<TResult = any, TInput = any>(
    client: ClientProxy,
    pattern: any,
    data: TInput,
  ): Observable<TResult> {
    return client.send<TResult, TInput>(pattern, data).pipe(
      catchError((error) => {
        const errorResponse = error.error || {};
        const errorMessage = errorResponse.message || error.message || '알 수 없는 오류가 발생했습니다.';
        const errorCode = errorResponse.error || '서비스 오류';
        const statusCode = errorResponse.status || HttpStatus.BAD_REQUEST;
        
        throw new HttpException(
          { 
            message: errorMessage,
            error: errorCode
          },
          statusCode,
        );
      }),
    );
  }
} 