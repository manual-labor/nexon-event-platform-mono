import { IsEnum, IsNotEmpty } from 'class-validator';
import { UserRole } from '../../interfaces/user.interface';

export class UpdateRoleDto {
  @IsEnum(UserRole)
  @IsNotEmpty()
  role!: UserRole;
} 