import { Router } from 'express';
import { publicController } from '../controllers/public.controller';
import { adminPagesController } from '../controllers/admin/pages.controller';
import { adminSettingsController } from '../controllers/admin/settings.controller';
import { asyncHandler } from '../utils/asyncHandler';
import { readLimiter } from '../middlewares/rateLimiter';

const router = Router();

router.get('/settings/public', readLimiter, asyncHandler(adminSettingsController.publicSettings));
router.get('/i18n/languages', readLimiter, asyncHandler(publicController.languages));
router.get('/i18n/:code', readLimiter, asyncHandler(publicController.translations));
router.get('/pages/nav', readLimiter, asyncHandler(adminPagesController.publicNav));
router.get('/pages/:slug', readLimiter, asyncHandler(adminPagesController.getPublicBySlug));
router.post('/contact', readLimiter, asyncHandler(publicController.contact));

export default router;
