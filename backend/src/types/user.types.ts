import { UserType, UserStatus } from '../constants/enums';
export interface SafeUser {
  id: number; email: string; name: string; phone: string | null;
  avatarUrl: string | null; type: UserType; status: UserStatus;
  emailVerified: boolean; language: string; roleId: number | null;
  lastLoginAt: Date | null; createdAt: Date;
}
export interface CreateUserInput {
  email: string; password: string; name: string;
  type?: UserType; roleId?: number; phone?: string;
}
