import multer from 'multer';
import { AppError } from '../utils/AppError.js';
import { MAX_FILE_SIZE } from '../utils/fileValidation.js';

export function notFoundHandler(req, res, next) {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
}

export function errorMiddleware(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      err = new AppError(
        `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / (1024 * 1024)} MB`,
        400
      );
    } else {
      err = new AppError(err.message, 400);
    }
  }

  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  if (process.env.NODE_ENV !== 'production') {
    console.error('[Error]', message);
  }

  res.status(status).json({
    message,
    status,
    error: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
  });
}
