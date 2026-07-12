import { Router } from 'express';
import multer from 'multer';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  listDocuments,
  createDocument,
  removeDocument,
} from '../controllers/documentController.js';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.get('/', authMiddleware, listDocuments);
router.post('/', authMiddleware, upload.single('file'), createDocument);
router.delete('/:id', authMiddleware, removeDocument);

export default router;
