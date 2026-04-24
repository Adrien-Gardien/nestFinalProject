import type { User as PrismaUser } from '@prisma/client';
import { UserRole as PrismaUserRole } from '@prisma/client';

export const UserRole = PrismaUserRole;
export type UserRole = PrismaUserRole;
export type UserEntity = PrismaUser;

export interface PublicUserProfile {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  emailVerified: boolean;
}
