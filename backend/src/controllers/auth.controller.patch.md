# Patch for auth.controller.ts

## Fix `revokeSession`
Replace:
```ts
await authService.revokeSession(req.user!.id, req.params.id as string);
```
With:
```ts
const sessionId = String(req.params.id);
await authService.revokeSession(req.user!.id, sessionId);
```
