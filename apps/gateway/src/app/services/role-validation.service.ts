import { Injectable } from '@nestjs/common';
import { UserRole } from '../../interfaces/user.interface';

@Injectable()
export class RoleValidationService {
  private readonly MANAGEMENT_ROLES = [
    UserRole.ADMIN,
    UserRole.AUDITOR,
    UserRole.OPERATOR,
  ];


  public hasManagementRole(role: UserRole): boolean {
    return this.MANAGEMENT_ROLES.includes(role);
  }
}
