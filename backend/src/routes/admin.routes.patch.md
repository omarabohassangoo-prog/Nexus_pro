# Patch: add audit route

## In `backend/src/routes/admin.routes.ts`:

Add import:
```ts
import { adminAuditController } from '../controllers/admin/audit.controller';
```

Add route (before `export default router`):
```ts
router.get('/audit', requirePermission('audit.read'), asyncHandler(adminAuditController.list));
```
