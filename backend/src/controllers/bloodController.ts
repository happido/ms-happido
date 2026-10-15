import { Request, Response } from 'express';
import mongoose from 'mongoose';
import BloodRequest from '../models/BloodRequest';
import { AuthRequest } from '../middlewares/authMiddleware';

// Customer requests blood
export const createBloodRequest = async (req: AuthRequest, res: Response) => {
  const { bloodGroup, location, urgency, hospitalName } = req.body;

  try {
    const bloodRequest = new BloodRequest({
      requester: req.user._id,
      bloodGroup,
      location,
      hospitalName,
      urgency,
      status: 'open'
    });

    const createdRequest = await bloodRequest.save();

    // TARGETED BROADCAST ARCHITECTURE
    // Only alert users who match the exact blood group and have opted in
    const matchingUsers = await mongoose.model('User').find({
      bloodGroup: bloodGroup.toUpperCase(),
      bloodDonationOptIn: true,
      _id: { $ne: req.user._id } // Don't notify the requester themselves
    }).select('_id');

    const io = req.app.get('io');
    if (io && matchingUsers.length > 0) {
      // Create the anonymous, privacy-first payload
      const alertPayload = {
        id: createdRequest._id,
        bloodGroup: bloodGroup.toUpperCase(),
        urgency,
        hospitalName,
        location,
        timestamp: createdRequest.createdAt,
        // Notice: requesterName and gender are strictly omitted for privacy
      };

      // Emit directly to the private room of each matching user
      matchingUsers.forEach(user => {
        io.to(user._id.toString()).emit('urgentBloodRequest', alertPayload);
      });
    }

    res.status(201).json(createdRequest);
  } catch (error) {
    res.status(500).json({ message: 'Error creating blood request', error });
  }
};

// Get all open blood requests
export const getBloodRequests = async (req: Request, res: Response) => {
  try {
    const { status, bloodGroup } = req.query;
    const filter: any = {};
    if (status) filter.status = status;
    if (bloodGroup) filter.bloodGroup = bloodGroup;

    const requests = await BloodRequest.find(filter)
      .populate('requester', 'name phone email')
      .populate('acceptedBy', 'name phone')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching blood requests', error });
  }
};

// Volunteer accepts/responds to a blood request
export const acceptBloodRequest = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    const bloodRequest = await BloodRequest.findById(id);
    if (!bloodRequest) {
      return res.status(404).json({ message: 'Blood request not found' });
    }

    if (bloodRequest.status !== 'open') {
      return res.status(400).json({ message: 'Blood request is already closed or fulfilled' });
    }

    const userId = req.user._id;
    if (!bloodRequest.acceptedBy.includes(userId)) {
      bloodRequest.acceptedBy.push(userId);
      await bloodRequest.save();
    }

    const io = req.app.get('io');
    if (io) {
      io.to(bloodRequest.requester.toString()).emit('bloodRequestAccepted', {
        requestId: id,
        acceptedBy: {
          id: req.user._id,
          name: req.user.name,
          phone: req.user.phone
        }
      });
    }

    res.json({ message: 'Blood request accepted successfully', bloodRequest });
  } catch (error) {
    res.status(500).json({ message: 'Error accepting blood request', error });
  }
};
