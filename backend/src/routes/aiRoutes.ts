import express from 'express';
import { curateMeal } from '../controllers/aiController';

const router = express.Router();

router.post('/curate', curateMeal);

export default router;
