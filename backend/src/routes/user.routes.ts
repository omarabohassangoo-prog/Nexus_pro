import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate';
import { profileController } from '../controllers/user/profile.controller';
import { notificationsController } from '../controllers/user/notifications.controller';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.use(authenticate);

router.get('/profile', asyncHandler(profileController.getMe));
router.put('/profile', asyncHandler(profileController.updateMe));

router.get('/notifications', asyncHandler(notificationsController.list));
router.get('/notifications/unread-count', asyncHandler(notificationsController.unreadCount));
router.put('/notifications/:id/read', asyncHandler(notificationsController.markRead));
router.put('/notifications/read-all', asyncHandler(notificationsController.markAllRead));

export default router;
