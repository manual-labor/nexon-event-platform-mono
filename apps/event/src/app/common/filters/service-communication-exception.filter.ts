import { ExceptionFilter, Catch, ArgumentsHost, Logger, HttpStatus } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { ServiceCommunicationException } from '../exceptions/app-exception';

@Catch(ServiceCommunicationException)
export class ServiceCommunicationExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ServiceCommunicationExceptionFilter.name);

  catch(exception: ServiceCommunicationException, host: ArgumentsHost) {
    const errorResponse = exception.getErrorResponse();
    
    this.logger.error(
      `[service communication error] ${errorResponse.message}`,
      errorResponse.details || {},
    );

    if (host.getType() === 'rpc') {
      throw new RpcException({
        message: '현재 서비스를 이용할 수 없습니다. 잠시 후 다시 시도해주세요.',
        status: HttpStatus.SERVICE_UNAVAILABLE,
        errorCode: errorResponse.errorCode
      });
    }

    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    
    response.status(HttpStatus.SERVICE_UNAVAILABLE).json({
      message: '현재 서비스를 이용할 수 없습니다. 잠시 후 다시 시도해주세요.',
      status: HttpStatus.SERVICE_UNAVAILABLE,
      errorCode: errorResponse.errorCode,
      timestamp: new Date().toISOString()
    });
  }
} 