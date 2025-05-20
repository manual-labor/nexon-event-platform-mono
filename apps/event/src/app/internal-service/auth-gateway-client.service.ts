import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { User } from '../interfaces/user.interface';


@Injectable()
export class AuthGatewayClientService {
  private readonly gatewayUrl: string;
  private readonly apiKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.gatewayUrl = this.configService.get<string>('GATEWAY_URL', 'http://gateway:3000/v1');
    this.apiKey = this.configService.get<string>('INTERNAL_API_KEY', 'default-internal-api-key');
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.gatewayUrl}/internal/users/by-email/${email}`, {
          headers: {
            'x-api-key': this.apiKey
          }
        })
      );
      return response.data;
    } catch (error) {
      console.error('Gateway 내부 API 통신 오류:', error);
      return null;
    }
  }
} 