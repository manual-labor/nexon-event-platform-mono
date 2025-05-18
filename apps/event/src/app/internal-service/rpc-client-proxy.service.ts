import { Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Observable, catchError, firstValueFrom } from 'rxjs';

@Injectable()
export class RpcClientProxyService {
  public send<TResult = any, TInput = any>(
    client: ClientProxy,
    pattern: any,
    data: TInput,
  ): Observable<TResult> {
    return client.send<TResult, TInput>(pattern, data).pipe(
      catchError((error) => {
        console.error('RPC 통신 오류:', error.message);
        throw error;
      }),
    );
  }

  public async sendAndAwait<TResult = any, TInput = any>(
    client: ClientProxy,
    pattern: any,
    data: TInput,
  ): Promise<TResult> {
    return firstValueFrom(this.send<TResult, TInput>(client, pattern, data));
  }
} 