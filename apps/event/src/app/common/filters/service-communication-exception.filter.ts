import { ExceptionFilter, Catch, ArgumentsHost, Logger, HttpStatus } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { ServiceCommunicationException } from '../exceptions/app-exception';

/**
 * 서비스 간 통신 오류를 처리하는 필터
 * 주로 다른 마이크로서비스와의 통신 오류를 처리합니다.
 */
@Catch(ServiceCommunicationException)
export class ServiceCommunicationExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ServiceCommunicationExceptionFilter.name);

  catch(exception: ServiceCommunicationException, host: ArgumentsHost) {
    const errorResponse = exception.getErrorResponse();
    
    this.logger.error(
      `[서비스 통신 오류] ${errorResponse.error.message}`,
      errorResponse.error.details || {},
    );

    // RPC 환경에서는 RpcException으로 변환
    if (host.getType() === 'rpc') {
      throw new RpcException({
        error: {
          name: 'SERVICE_COMMUNICATION_ERROR',
          message: '현재 서비스를 이용할 수 없습니다. 잠시 후 다시 시도해주세요.',
          code: 'E1006'
        }
      });
    }

    // HTTP 요청인 경우 (로컬 개발 환경 등)
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    
    response.status(HttpStatus.SERVICE_UNAVAILABLE).json({
      error: {
        name: 'SERVICE_COMMUNICATION_ERROR',
        message: '현재 서비스를 이용할 수 없습니다. 잠시 후 다시 시도해주세요.',
        code: 'E1006'
      }
    });
  }
} 