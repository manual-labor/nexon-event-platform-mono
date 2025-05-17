import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable, catchError, lastValueFrom } from 'rxjs';

interface ErrorResponse {
  message: string;
  error: string;
  status?: number;
}

@Injectable()
export class RpcClientProxyService {
  private serviceMap = new Map<ClientGrpc, any>();

  public getService<T extends object>(client: ClientGrpc, serviceName: string): T {
    if (!this.serviceMap.has(client)) {
      const service = client.getService<T>(serviceName);
      this.serviceMap.set(client, service);
      return service;
    }
    return this.serviceMap.get(client);
  }

  public call<TResult = any, TInput = any>(
    service: any,
    methodName: string,
    data: TInput,
  ): Observable<TResult> {
    return service[methodName](data).pipe(
      catchError((error) => {
        const errorResponse = error.details || {};
        const errorMessage = error.message || '알 수 없는 오류가 발생했습니다.';
        const errorCode = error.code || '서비스 오류';
        const statusCode = error.status || HttpStatus.BAD_REQUEST;
        
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

  public async toPromise<T>(observable: Observable<T>): Promise<T> {
    return await lastValueFrom(observable);
  }
} 