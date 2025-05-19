export enum UserRole {
  USER = 'USER',
  OPERATOR = 'OPERATOR',
  AUDITOR = 'AUDITOR',
  ADMIN = 'ADMIN',
}

export enum UserProvider {
  KAKAO = 'KAKAO',
  LOCAL = 'LOCAL',
  GOOGLE = 'GOOGLE',
  NAVER = 'NAVER',
}

export interface User {
  id: string;
  nickname: string;
  email: string;
  provider: string;
  role: UserRole;
  lastLogin: Date;
  createdAt: Date;
  updatedAt: Date;
} 