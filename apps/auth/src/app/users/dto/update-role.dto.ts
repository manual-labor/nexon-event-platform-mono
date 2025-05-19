import { IsEnum, IsNotEmpty } from 'class-validator';
import { UserRole } from '../../interfaces/user.interface';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRoleDto {
  @ApiProperty({ description: '변경할 사용자 역할', enum: UserRole, example: UserRole.ADMIN })
  @IsEnum(UserRole)
  @IsNotEmpty()
  role!: UserRole;
} 