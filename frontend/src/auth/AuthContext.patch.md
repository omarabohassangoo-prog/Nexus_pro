# Patch for AuthContext.tsx

## Problem: permissions always empty

## Fix: extend `/auth/me` backend response to include permissions

### Backend: in `auth.controller.ts` → `me()`
```ts
async me(req: Request, res: Response) {
  const { userService } = await import('../services/user.service');
  const me = await userService.getById(req.user!.id);
  res.json({
    success: true,
    data: { ...me, permissions: req.user!.permissions },
  } as ApiResponse);
}
```

### Frontend: in `AuthContext.tsx` → `loadUser()`
```ts
const loadUser = useCallback(async () => {
  try {
    const me = await authApi.me() as SafeUser & { permissions?: string[] };
    setUser(me);
    setPermissions(me.permissions ?? []);
  } catch {
    setUser(null);
    setPermissions([]);
  }
}, []);
```
