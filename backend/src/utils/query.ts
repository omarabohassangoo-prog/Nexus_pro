export const MAX_TAKE = 200;

export function safeSortBy<T extends string>(
  requested: string | undefined,
  allowed: readonly T[],
  fallback: T
): T {
  if (!requested) return fallback;
  return (allowed as readonly string[]).includes(requested) ? (requested as T) : fallback;
}

export function safeTake(take: number | undefined, max = MAX_TAKE): number {
  if (!take || take < 1) return 20;
  return Math.min(take, max);
}

export const userPublicSelect = {
  id: true, email: true, name: true, phone: true,
  avatarUrl: true, type: true, status: true,
  emailVerified: true, language: true, roleId: true,
  lastLoginAt: true, createdAt: true,
} as const;
