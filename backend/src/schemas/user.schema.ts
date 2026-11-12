import { z } from 'zod';
import { UserType, UserStatus } from '@prisma/client';

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  phone: z.string().trim().regex(/^\+?[0-9]{7,15}$/).nullable().optional(),
  language: z.enum(['ar', 'en']).optional(),
});

export const createUserSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(128),
  name: z.string().trim().min(2).max(100),
  type: z.nativeEnum(UserType).default(UserType.USER),
  roleId: z.coerce.number().int().positive().optional(),
  phone: z.string().trim().regex(/^\+?[0-9]{7,15}$/).optional(),
});

export const updateUserSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  phone: z.string().trim().regex(/^\+?[0-9]{7,15}$/).nullable().optional(),
  type: z.nativeEnum(UserType).optional(),
  status: z.nativeEnum(UserStatus).optional(),
  roleId: z.coerce.number().int().positive().nullable().optional(),
});

export const listUsersSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(20),
  search: z.string().trim().max(200).optional(),
  type: z.nativeEnum(UserType).optional(),
  status: z.nativeEnum(UserStatus).optional(),
  sortBy: z.enum(['createdAt', 'email', 'name', 'lastLoginAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ListUsersQuery = z.infer<typeof listUsersSchema>;
