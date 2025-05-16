import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { RpcException } from '@nestjs/microservices';

interface ErrorResponseBody {
  statusCode: number;
  timestamp: string;
  path: string;
  message: string | string[];
  error: string;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const { response, request, ctxType } = this.extractContext(host);
    const { status, message, error } = this.mapToHttpError(exception);

    this.logger.error(
      `${request.method} ${request.url} ${status} - ${Array.isArray(message) ? message.join(', ') : message}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(status).json(this.buildResponseBody(request.url, status, message, error));
  }

  private extractContext(host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    return {
      response: ctx.getResponse<Response>(),
      request: ctx.getRequest<Request>(),
      ctxType: 'http' as const,
    };
  }

  private mapToHttpError(exception: unknown): { status: number; message: string | string[]; error: string } {
    if (exception instanceof HttpException) {
      return this.handleHttpException(exception);
    }

    if (exception instanceof RpcException) {
      return this.handleRpcException(exception);
    }

    if (exception instanceof Error) {
      return { status: HttpStatus.INTERNAL_SERVER_ERROR, message: exception.message, error: exception.name };
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: '알 수 없는 오류가 발생했습니다.',
      error: 'UnknownException',
    };
  }


  private handleHttpException(exception: HttpException) {
    const status = exception.getStatus();
    const resp = exception.getResponse();
    let message: string | string[] = exception.message;
    let error = 'HTTP Exception';

    if (typeof resp === 'object' && resp !== null) {
      message = (resp as any).message ?? message;
      error = (resp as any).error ?? error;
    }

    return { status, message, error };
  }

  private handleRpcException(exception: RpcException) {
    const err = exception.getError();
    let status = HttpStatus.BAD_REQUEST;
    let message = 'RPC 오류';
    let error = 'RPC Exception';

    if (typeof err === 'object' && err !== null) {
      status = (err as any).status ?? status;
      message = (err as any).message ?? message;
      error = (err as any).error ?? error;
    } else {
      message = String(err);
    }

    return { status, message, error };
  }

  private buildResponseBody(
    path: string,
    status: number,
    message: string | string[],
    error: string,
  ): ErrorResponseBody {
    return {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path,
      message,
      error,
    };
  }
}
