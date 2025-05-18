import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';


@Injectable()
export class InternalApiGuard implements CanActivate {
  private apiKey: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('INTERNAL_API_KEY', 'default-internal-api-key');
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const apiKey = request.headers['x-api-key'];

    if (!apiKey || apiKey !== this.apiKey) {
      throw new UnauthorizedException('내부 API 접근이 거부되었습니다.');
    }

    return true;
  }
} 