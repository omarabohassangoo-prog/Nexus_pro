import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';
import { requirePermission } from '../middlewares/requirePermission';
import { writeLimiter } from '../middlewares/rateLimiter';
import { asyncHandler } from '../utils/asyncHandler';
import { UserType } from '../constants/enums';

import { adminUsersController } from '../controllers/admin/users.controller';
import { adminRolesController } from '../controllers/admin/roles.controller';
import { adminSettingsController } from '../controllers/admin/settings.controller';
import { adminTemplatesController } from '../controllers/admin/templates.controller';
import { adminPagesController } from '../controllers/admin/pages.controller';
import { adminMediaController } from '../controllers/admin/media.controller';
import { adminDashboardController } from '../controllers/admin/dashboard.controller';
import { adminServicesController } from '../controllers/admin/services.controller';
import { adminBackupsController } from '../controllers/admin/backups.controller';
import { adminI18nController } from '../controllers/admin/i18n.controller';
import { adminSystemController } from '../controllers/admin/system.controller';
import { upload } from '../middlewares/upload';

const router = Router();
router.use(authenticate);
router.use(authorize(UserType.SUPER_ADMIN, UserType.ADMIN, UserType.EDITOR));

router.get('/dashboard', requirePermission('system.read'), asyncHandler(adminDashboardController.overview));

router.get('/users', requirePermission('users.read'), asyncHandler(adminUsersController.list));
router.get('/users/:id', requirePermission('users.read'), asyncHandler(adminUsersController.get));
router.post('/users', writeLimiter, requirePermission('users.create'), asyncHandler(adminUsersController.create));
router.put('/users/:id', writeLimiter, requirePermission('users.update'), asyncHandler(adminUsersController.update));
router.delete('/users/:id', writeLimiter, requirePermission('users.delete'), asyncHandler(adminUsersController.remove));
router.put('/users/:id/suspend', writeLimiter, requirePermission('users.suspend'), asyncHandler(adminUsersController.suspend));

router.get('/roles', requirePermission('roles.read'), asyncHandler(adminRolesController.list));
router.get('/roles/permissions', requirePermission('roles.read'), asyncHandler(adminRolesController.permissions));
router.post('/roles', writeLimiter, requirePermission('roles.create'), asyncHandler(adminRolesController.create));
router.put('/roles/:id', writeLimiter, requirePermission('roles.update'), asyncHandler(adminRolesController.update));
router.delete('/roles/:id', writeLimiter, requirePermission('roles.delete'), asyncHandler(adminRolesController.remove));

router.get('/settings/:group', requirePermission('settings.read'), asyncHandler(adminSettingsController.getGroup));
router.put('/settings/:group', writeLimiter, requirePermission('settings.update'), asyncHandler(adminSettingsController.updateGroup));
router.post('/settings/:group/test', requirePermission('settings.read'), asyncHandler(adminSettingsController.testGroup));

router.get('/templates', requirePermission('templates.read'), asyncHandler(adminTemplatesController.list));
router.get('/templates/:id', requirePermission('templates.read'), asyncHandler(adminTemplatesController.get));
router.post('/templates', writeLimiter, requirePermission('templates.manage'), asyncHandler(adminTemplatesController.create));
router.put('/templates/:id', writeLimiter, requirePermission('templates.manage'), asyncHandler(adminTemplatesController.update));
router.delete('/templates/:id', writeLimiter, requirePermission('templates.manage'), asyncHandler(adminTemplatesController.remove));
router.post('/templates/:id/preview', requirePermission('templates.read'), asyncHandler(adminTemplatesController.preview));
router.post('/templates/:id/versions/:versionId/restore', writeLimiter, requirePermission('templates.manage'), asyncHandler(adminTemplatesController.restoreVersion));

router.get('/pages', requirePermission('pages.read'), asyncHandler(adminPagesController.list));
router.get('/pages/:id', requirePermission('pages.read'), asyncHandler(adminPagesController.get));
router.post('/pages', writeLimiter, requirePermission('pages.create'), asyncHandler(adminPagesController.create));
router.put('/pages/:id', writeLimiter, requirePermission('pages.update'), asyncHandler(adminPagesController.update));
router.delete('/pages/:id', writeLimiter, requirePermission('pages.delete'), asyncHandler(adminPagesController.remove));

router.post('/media/upload', writeLimiter, requirePermission('media.upload'), upload.single('file'), asyncHandler(adminMediaController.upload));
router.get('/media', requirePermission('media.read'), asyncHandler(adminMediaController.list));
router.delete('/media/:id', writeLimiter, requirePermission('media.delete'), asyncHandler(adminMediaController.remove));

router.get('/services/:service/test', requirePermission('services.test'), asyncHandler(adminServicesController.test));
router.post('/services/:service/reload', writeLimiter, requirePermission('services.configure'), asyncHandler(adminServicesController.reload));

router.get('/backups', requirePermission('backups.read'), asyncHandler(adminBackupsController.list));
router.post('/backups', writeLimiter, requirePermission('backups.create'), asyncHandler(adminBackupsController.create));
router.post('/backups/:id/restore', writeLimiter, requirePermission('backups.restore'), asyncHandler(adminBackupsController.restore));
router.delete('/backups/:id', writeLimiter, requirePermission('backups.delete'), asyncHandler(adminBackupsController.remove));

router.get('/i18n/languages', requirePermission('settings.read'), asyncHandler(adminI18nController.languages));
router.get('/i18n/:code', requirePermission('settings.read'), asyncHandler(adminI18nController.getTranslations));
router.put('/i18n/:code', writeLimiter, requirePermission('settings.update'), asyncHandler(adminI18nController.bulkUpsert));
router.get('/i18n/:code/export', requirePermission('settings.read'), asyncHandler(adminI18nController.exportJson));

router.get('/system/health', requirePermission('system.health'), asyncHandler(adminSystemController.health));
router.post('/system/broadcast', writeLimiter, requirePermission('system.read'), asyncHandler(adminSystemController.broadcast));
router.post('/system/factory-reset', writeLimiter, requirePermission('system.reset'), asyncHandler(adminSystemController.factoryReset));
router.get('/system/realtime', requirePermission('system.read'), asyncHandler(adminSystemController.realtimeStats));

export default router;
