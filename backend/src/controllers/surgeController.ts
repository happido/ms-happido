import { Request, Response } from 'express';

// Get current surge status (Simulated based on minutes for demo purposes)
export const getSurgeStatus = async (req: Request, res: Response) => {
  try {
    const currentMinute = new Date().getMinutes();
    
    // Simulate surge: Odd minutes = 1.5x surge, Even minutes = 1.0x (Normal)
    const isSurging = currentMinute % 2 !== 0;
    const surgeMultiplier = isSurging ? 1.5 : 1.0;
    
    res.json({
      isSurging,
      surgeMultiplier,
      message: isSurging 
        ? "High demand! Delivery partner availability is low." 
        : "Normal delivery conditions."
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server Error calculating surge', error: error.message });
  }
};
