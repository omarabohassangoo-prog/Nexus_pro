import multer from 'multer';
import { AppError } from '../utils/AppError';

const MAX_SIZE = 10 * 1024 * 1024;

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE, files: 1 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
    if (!allowed.includes(file.mimetype)) {
      return cb(new AppError(`نوع الملف غير مدعوم: ${file.mimetype}`, 415, 'UNSUPPORTED_MEDIA'));
    }
    cb(null, true);
  },
});
