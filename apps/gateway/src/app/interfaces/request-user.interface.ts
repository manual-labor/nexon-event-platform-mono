import { UserRole } from '../../interfaces/user.interface';

export interface RequestUser {
  id: string;
  email: string;
  role: UserRole;
} 