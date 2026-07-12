import { Router } from 'express';
import authRoutes from './authRoutes.js';
import documentRoutes from './documentRoutes.js';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ data: { message: 'API is running' } });
});

router.use('/auth', authRoutes);
router.use('/documents', documentRoutes);

export default router;
