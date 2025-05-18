import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Observable, catchError } from 'rxjs';

interface StandardErrorResponse {
  error: {
    name: string;
    message: string;
    code?: string;
    details?: Record<string, any>;
  };
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
        // 에러 객체 추출
        const errorObj = error.error || {};
        
        // 표준화된 에러 형식인지 확인
        if (errorObj.error?.name && errorObj.error?.message) {
          throw new HttpException(
            errorObj,
            HttpStatus.BAD_REQUEST,
          );
        }
        
        // 표준화되지 않은 에러를 표준 형식으로 변환
        const standardError: StandardErrorResponse = {
          error: {
            name: 'RPC_ERROR',
            message: errorObj.message || error.message || '알 수 없는 오류가 발생했습니다.',
            code: errorObj.code || 'E1000',
            details: errorObj.details || {}
          }
        };
        
        throw new HttpException(
          standardError,
          HttpStatus.BAD_REQUEST,
        );
      }),
    );
  }
} 