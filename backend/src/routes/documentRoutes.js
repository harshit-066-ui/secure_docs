import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { upload, validateUploadedFile } from '../middleware/uploadMiddleware.js';
import {
  listDocuments,
  uploadDocument,
  downloadDocument,
  removeDocument,
} from '../controllers/documentController.js';

const router = Router();

router.post('/upload', authMiddleware, upload.single('file'), validateUploadedFile, uploadDocument);
router.get('/', authMiddleware, listDocuments);
router.get('/:id/download', authMiddleware, downloadDocument);
router.delete('/:id', authMiddleware, removeDocument);

export default router;
