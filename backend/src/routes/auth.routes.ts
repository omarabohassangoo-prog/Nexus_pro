import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/authenticate';
import { validate } from '../middlewares/validate';
import { authLimiter, writeLimiter } from '../middlewares/rateLimiter';
import { asyncHandler } from '../utils/asyncHandler';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, activateSchema, changePasswordSchema, refreshSchema } from '../schemas/auth.schema';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), asyncHandler(authController.register));
router.post('/login', authLimiter, validate(loginSchema), asyncHandler(authController.login));
router.post('/refresh', validate(refreshSchema), asyncHandler(authController.refresh));
router.post('/logout', asyncHandler(authController.logout));
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), asyncHandler(authController.forgotPassword));
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), asyncHandler(authController.resetPassword));
router.post('/activate', validate(activateSchema), asyncHandler(authController.activate));

router.get('/me', authenticate, asyncHandler(authController.me));
router.get('/sessions', authenticate, asyncHandler(authController.sessions));
router.delete('/sessions/:id', authenticate, asyncHandler(authController.revokeSession));
router.post('/change-password', authenticate, writeLimiter, validate(changePasswordSchema), asyncHandler(authController.changePassword));

export default router;
