import express from 'express';
import { getSurgeStatus } from '../controllers/surgeController';

const router = express.Router();

router.get('/', getSurgeStatus);

export default router;
