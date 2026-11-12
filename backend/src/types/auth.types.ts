import { UserType } from '@prisma/client';
import { SafeUser } from './user.types';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface JwtPayload {
  sub: number;
  email: string;
}

export interface AuthenticatedUser {
  id: number;
  email: string;
  type: UserType;
  roleId: number | null;
  permissions: string[];
}

export interface LoginResult extends TokenPair {
  user: SafeUser;
  redirectTo: string;
}
