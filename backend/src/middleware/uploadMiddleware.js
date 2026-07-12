import multer from 'multer';
import { AppError } from '../utils/AppError.js';
import { MAX_FILE_SIZE, validateFileType } from '../utils/fileValidation.js';

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
});

export function validateUploadedFile(req, res, next) {
  if (!req.file) {
    return next(new AppError('No file provided', 400));
  }

  const validation = validateFileType(req.file);

  if (!validation.valid) {
    return next(new AppError(validation.message, 400));
  }

  next();
}
