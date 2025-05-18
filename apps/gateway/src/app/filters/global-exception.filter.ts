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

interface StandardErrorResponse {
  error: {
    name: string;
    message: string;
    code?: string;
  };
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const { response, request, ctxType } = this.extractContext(host);
    const { status, errorResponse } = this.mapToStandardError(exception);

    this.logger.error(
      `${request.method} ${request.url} ${status} - ${errorResponse.error.message}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(status).json(errorResponse);
  }

  private extractContext(host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    return {
      response: ctx.getResponse<Response>(),
      request: ctx.getRequest<Request>(),
      ctxType: 'http' as const,
    };
  }

  private mapToStandardError(exception: unknown): { status: number; errorResponse: StandardErrorResponse } {
    if (exception instanceof HttpException) {
      return this.handleHttpException(exception);
    }

    if (exception instanceof RpcException) {
      return this.handleRpcException(exception);
    }

    if (exception instanceof Error) {
      return { 
        status: HttpStatus.INTERNAL_SERVER_ERROR, 
        errorResponse: {
          error: {
            name: 'ServerError',
            message: exception.message,
            code: 'E1000'
          }
        } 
      };
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      errorResponse: {
        error: {
          name: 'UnknownError',
          message: '알 수 없는 오류가 발생했습니다.',
          code: 'E1000'
        }
      }
    };
  }

  private handleHttpException(exception: HttpException): { status: number; errorResponse: StandardErrorResponse } {
    const status = exception.getStatus();
    const resp = exception.getResponse();
    
    // 이미 표준 형식인 경우 그대로 반환
    if (typeof resp === 'object' && resp !== null && (resp as any).error?.name && (resp as any).error?.message) {
      return { status, errorResponse: resp as StandardErrorResponse };
    }
    
    // 표준 형식이 아닌 경우 변환
    let message: string | string[] = exception.message;
    let name = 'HttpException';
    let code = 'E1000';
    
    if (typeof resp === 'object' && resp !== null) {
      message = (resp as any).message ?? message;
      name = (resp as any).error ?? name;
      code = (resp as any).code ?? (resp as any).errorCode ?? code;
      
      // error 객체가 별도로 있는 경우
      if ((resp as any).error && typeof (resp as any).error === 'object') {
        name = (resp as any).error.name ?? name;
        message = (resp as any).error.message ?? message;
        code = (resp as any).error.code ?? code;
      }
    }
    
    // 메시지 형식화
    const formattedMessage = Array.isArray(message) ? message.join(', ') : 
                            typeof message === 'string' ? message : 
                            String(message);
    
    return { 
      status, 
      errorResponse: {
        error: {
          name,
          message: formattedMessage,
          code
        }
      }
    };
  }

  private handleRpcException(exception: RpcException): { status: number; errorResponse: StandardErrorResponse } {
    const err = exception.getError();
    let status = HttpStatus.BAD_REQUEST;
    
    // 이미 표준 형식인 경우 그대로 반환
    if (typeof err === 'object' && err !== null && (err as any).error?.name && (err as any).error?.message) {
      status = (err as any).status ?? status;
      return { status, errorResponse: err as StandardErrorResponse };
    }
    
    // 표준 형식이 아닌 경우 변환
    let message: string | string[] = 'RPC 오류';
    let name = 'RpcException';
    let code = 'E1000';
    
    if (typeof err === 'object' && err !== null) {
      status = (err as any).status ?? status;
      message = (err as any).message ?? message;
      name = (err as any).error ?? (err as any).name ?? name;
      code = (err as any).code ?? (err as any).errorCode ?? code;
    } else if (typeof err === 'string') {
      message = err;
    }
    
    // 메시지 형식화
    const formattedMessage = Array.isArray(message) ? message.join(', ') : 
                            typeof message === 'string' ? message : 
                            String(message);
    
    return { 
      status, 
      errorResponse: {
        error: {
          name,
          message: formattedMessage,
          code
        }
      }
    };
  }
}
