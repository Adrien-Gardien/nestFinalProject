import { UserRole } from '../../users/entities/user.entity';

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
}
