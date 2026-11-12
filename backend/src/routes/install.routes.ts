import { Router } from 'express';
import { installController } from '../controllers/install.controller';
import { requireNotInstalled } from '../middlewares/requireNotInstalled';
import { validate } from '../middlewares/validate';
import { authLimiter, writeLimiter } from '../middlewares/rateLimiter';
import { z } from 'zod';

const runSchema = z.object({
  adminName: z.string().min(2).max(100),
  adminEmail: z.string().email(),
  adminPassword: z.string().min(8).max(128),
  siteName: z.string().min(2).max(100),
  siteUrl: z.string().url(),
});

const validateSchema = z.object({ dbUrl: z.string().min(1), adminEmail: z.string().email() });
const emergencySchema = z.object({ key: z.string().min(1), confirm: z.literal('RESET'), adminEmail: z.string().email(), adminPassword: z.string().min(8) });

const router = Router();

router.get('/status', installController.status);
router.get('/requirements', installController.requirements);
router.post('/validate', writeLimiter, requireNotInstalled, validate(validateSchema), installController.validate);
router.post('/run', authLimiter, requireNotInstalled, validate(runSchema), installController.run);
router.post('/emergency', authLimiter, validate(emergencySchema), installController.emergency);

export default router;
