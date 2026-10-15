import express from 'express';
import { verifyDigilockerDocument, analyzeDocument } from '../controllers/kycController';
// import { upload } from '../middlewares/uploadMiddleware'; // Only if needed

const router = express.Router();

// DigiLocker / SurePass 3rd Party Verification Simulation
router.post('/digilocker-verify', verifyDigilockerDocument);

// TODO: AI Document analysis
// router.post('/analyze', upload.single('document'), analyzeDocument);

export default router;
