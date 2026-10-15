import express from 'express';
import { createBloodRequest, getBloodRequests, acceptBloodRequest } from '../controllers/bloodController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/request', protect, createBloodRequest);
router.get('/', getBloodRequests);
router.put('/:id/accept', protect, acceptBloodRequest);

export default router;
