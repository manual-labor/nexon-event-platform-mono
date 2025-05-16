export enum UserRole {
  USER = 'USER',
  OPERATOR = 'OPERATOR',
  AUDITOR = 'AUDITOR',
  ADMIN = 'ADMIN',
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