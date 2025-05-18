import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { UserNotFoundException } from '../common/exceptions/app-exception';

export interface UserDto {
  id: string;
  nickname: string;
  email: string;
  role: string;
}

/**
 * 게이트웨이의 내부 API를 통해 Auth 서비스와 통신하는 클라이언트
 */
@Injectable()
export class AuthClientService {
  private readonly gatewayUrl: string;
  private readonly apiKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.gatewayUrl = this.configService.get<string>('GATEWAY_URL', 'http://gateway:3000/v1');
    this.apiKey = this.configService.get<string>('INTERNAL_API_KEY', 'default-internal-api-key');
  }

  /**
   * 이메일로 사용자 정보 조회
   * @param email 이메일
   * @param jwt 사용자 JWT 토큰 (옵션)
   * @throws {UserNotFoundException} 사용자를 찾을 수 없는 경우
   * @throws {ServiceCommunicationException} 서비스 통신 중 오류가 발생한 경우
   */
  async getUserByEmail(email: string, jwt?: string): Promise<UserDto> {

      const headers: Record<string, string> = {
        'x-api-key': this.apiKey
      };

      // JWT 토큰이 제공된 경우 Authorization 헤더에 추가
      if (jwt) {
        headers['Authorization'] = `Bearer ${jwt}`;
      }

      const response = await firstValueFrom(
        this.httpService.get(`${this.gatewayUrl}/internal/users/by-email/${email}`, {
          headers
        })
      );
      
      if (!response.data) {
        throw new UserNotFoundException(`이메일(${email})로 사용자를 찾을 수 없습니다.`);
      }

      return response.data
  }
}
