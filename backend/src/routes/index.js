import { Router } from 'express';
import authRoutes from './authRoutes.js';
import documentRoutes from './documentRoutes.js';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'backend' });
});

router.use('/auth', authRoutes);
router.use('/documents', documentRoutes);

export default router;
