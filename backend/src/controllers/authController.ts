import { Request, Response } from 'express';
import User from '../models/User';
import Otp from '../models/Otp';
import CustomerProfile from '../models/CustomerProfile';
import RiderProfile from '../models/RiderProfile';
import Restaurant from '../models/Restaurant';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import admin from '../utils/firebaseAdmin';
import { AuthRequest } from '../middlewares/authMiddleware';
import { sendWelcomeEmail, sendEmail } from '../utils/mailer';
import { sendSmsOtp } from '../utils/smsService';

const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your_jwt_secret_here', {
    expiresIn: '30d',
  });
};

export const checkUserExists = async (req: Request, res: Response) => {
  const { email, phone } = req.body;
  try {
    const conditions: any[] = [];
    if (email) conditions.push({ email: email.toLowerCase() });
    if (phone) {
      const cleanPhone = phone.replace(/^(\+91|91)/, '').replace(/\D/g, '');
      conditions.push({ phone: cleanPhone });
      conditions.push({ phone: `+91${cleanPhone}` });
    }

    if (conditions.length === 0) {
      res.json({ exists: false });
      return;
    }

    const existing = await User.findOne({ $or: conditions });
    if (existing) {
      if (email && existing.email === email.toLowerCase()) {
        res.status(400).json({ exists: true, message: 'An account with this email address already exists' });
        return;
      }
      res.status(400).json({ exists: true, message: 'An account with this phone number already exists' });
      return;
    }
    res.json({ exists: false });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error checking user', error: error.message });
  }
};

export const savePushToken = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { token } = req.body;
    if (!token) {
      res.status(400).json({ message: 'Token is required' });
      return;
    }
    
    await User.findByIdAndUpdate(req.user._id, { expoPushToken: token });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Error saving push token', error });
  }
};

export const updateProfilePhoto = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { photoUrl } = req.body;
    if (!photoUrl) {
      res.status(400).json({ message: 'photoUrl is required' });
      return;
    }
    if (req.user.role === 'restaurant') {
      await Restaurant.findOneAndUpdate({ owner: req.user._id }, { imageUrl: photoUrl });
    } else if (req.user.role === 'rider') {
      await RiderProfile.findOneAndUpdate({ userId: req.user._id }, { 'documents.profilePhotoUrl': photoUrl });
    } else {
      await CustomerProfile.findOneAndUpdate({ userId: req.user._id }, { profilePhotoUrl: photoUrl });
    }
    res.json({ success: true, photoUrl });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile photo', error });
  }
};

export const updateLocation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { address, location } = req.body;
    if (!address || !location) {
      res.status(400).json({ message: 'Address and location are required' });
      return;
    }
    if (req.user.role === 'rider') {
      await RiderProfile.findOneAndUpdate({ userId: req.user._id }, { location });
    } else if (req.user.role === 'restaurant') {
      await Restaurant.findOneAndUpdate({ owner: req.user._id }, { location });
    } else {
      await CustomerProfile.findOneAndUpdate({ userId: req.user._id }, { $push: { savedAddresses: { addressLine1: address, location } } });
    }
    res.json({ success: true, address, location });
  } catch (error) {
    res.status(500).json({ message: 'Error updating location', error });
  }
};

export const updateKitchenOperations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user.role !== 'restaurant') {
      res.status(403).json({ message: 'Only restaurants can update kitchen operations.' });
      return;
    }

    const { operations } = req.body;
    if (!operations) {
      res.status(400).json({ message: 'Operations data is required' });
      return;
    }

    // Update only the provided fields in operations
    const updateObj: Record<string, any> = {};
    if (operations.isOnline !== undefined) updateObj['operations.isOnline'] = operations.isOnline;
    if (operations.defaultPrepTime !== undefined) updateObj['operations.defaultPrepTime'] = operations.defaultPrepTime;
    if (operations.autoAcceptOrders !== undefined) updateObj['operations.autoAcceptOrders'] = operations.autoAcceptOrders;
    if (operations.isPureVeg !== undefined) updateObj['operations.isPureVeg'] = operations.isPureVeg;
    if (operations.operatingHours) updateObj['operations.operatingHours'] = operations.operatingHours;

    const restaurant = await Restaurant.findOneAndUpdate(
      { owner: req.user._id },
      { $set: updateObj },
      { new: true }
    );

    res.json({ success: true, operations: restaurant?.operations });
  } catch (error) {
    console.error('Error updating kitchen operations:', error);
    res.status(500).json({ message: 'Error updating operations', error });
  }
};

export const sendPhoneOtp = async (req: Request, res: Response) => {
  const { phone, email, role } = req.body;

  if (!phone) {
    res.status(400).json({ message: 'Phone number is required' });
    return;
  }

  const cleanPhone = phone.replace(/^(\+91|91)/, '').replace(/\D/g, '');
  if (cleanPhone.length !== 10) {
    res.status(400).json({ message: 'Please enter a valid 10-digit mobile number' });
    return;
  }

  try {
    // Proactively check if mobile or email is already registered
    const conditions: any[] = [{ phone: cleanPhone }, { phone: `+91${cleanPhone}` }];
    if (email) conditions.push({ email: email.toLowerCase() });
    const existing = await User.findOne({ $or: conditions });

    if (existing) {
      // 1. Customer App: Any registered user (customer, restaurant, rider, admin) can use the Customer App.
      // We allow OTP dispatch so the user can verify their phone and log in or activate their customer profile.
      if (role === 'customer') {
        console.log(`ℹ️ [AUTH] Account already exists (${existing.role}) for ${cleanPhone}. Dispatching OTP for customer profile access.`);
      } else if (existing.role === role) {
        res.status(400).json({ 
          message: `This phone number is already registered. Please go to Login to sign in.` 
        });
        return;
      } else if (existing.role !== 'customer') {
        // Conflicting partner roles (e.g. rider trying to register as restaurant)
        res.status(400).json({ 
          message: `This account is already registered as a ${existing.role}. Please log in to the ${existing.role} app or use a different phone number.` 
        });
        return;
      }
      // If existing.role === 'customer' and registering as 'restaurant' or 'rider', allow OTP so they can onboard as partner
    }

    // 1. Generate 6-digit OTP (defaults to 123456 in dev testing if FAST2SMS_API_KEY not set)
    const otp = process.env.FAST2SMS_API_KEY 
      ? Math.floor(100000 + Math.random() * 900000).toString() 
      : '123456';

    // 2. Save OTP in MongoDB (expires in 5 minutes via TTL index)
    await Otp.deleteMany({ phone: cleanPhone });
    await Otp.create({ phone: cleanPhone, otp });

    // 3. Send SMS via Indian SMS Gateway
    await sendSmsOtp({ phone: cleanPhone, otp });

    // 4. If email provided, also send OTP to email as a dual backup
    if (email) {
      sendEmail({
        to: email,
        subject: `Your Happido Verification Code: ${otp}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; padding: 24px; border: 1px solid #f0f0f0; border-radius: 12px;">
            <h2 style="color: #FF5200; margin-top: 0;">Happido Verification</h2>
            <p style="color: #333333; font-size: 15px;">Your mobile verification code is:</p>
            <div style="background: #FFF7ED; border: 1px solid #FFEDD5; border-radius: 8px; padding: 16px; text-align: center; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #EA580C;">${otp}</span>
            </div>
            <p style="color: #888888; font-size: 13px;">This code is valid for 5 minutes. Do not share it with anyone.</p>
          </div>
        `
      }).catch(err => console.error('Email OTP dispatch error:', err));
    }

    res.json({
      success: true,
      message: 'OTP sent successfully to +91 ' + cleanPhone,
      devOtp: otp
    });
  } catch (error: any) {
    console.error('sendPhoneOtp error:', error);
    res.status(500).json({ message: 'Failed to generate OTP', error: error.message });
  }
};

export const registerUser = async (req: Request, res: Response) => {
  const { 
    name, email, password, role, phone, restaurantName, bloodGroup, vehicleDetails, vehicleType, 
    licenseUrl, rcUrl, profilePhotoUrl, aadharNumber, aadharUrl, riderPanNumber, riderPanUrl,
    otp, firebaseIdToken, expoPushToken
  } = req.body;


  try {
    // Server-side validation — return 400 instead of letting Mongoose throw 500
    if (!name || !name.trim()) {
      res.status(400).json({ message: 'Name is required' });
      return;
    }
    if (!email || !email.trim()) {
      res.status(400).json({ message: 'Email address is required' });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ message: 'Please enter a valid email address' });
      return;
    }
    if (!password || password.length < 6) {
      res.status(400).json({ message: 'Password must be at least 6 characters' });
      return;
    }
    if (!phone) {
      res.status(400).json({ message: 'Phone number is required' });
      return;
    }

    const cleanPhone = phone ? phone.replace(/^(\+91|91)/, '').replace(/\D/g, '') : '';

    if (otp) {
      // Direct Indian Gateway OTP Verification (supports 123456 for instant testing)
      const isTestCode = otp === '123456';
      const validOtp = isTestCode || (await Otp.findOne({ phone: cleanPhone, otp }));
      if (!validOtp) {
        res.status(400).json({ message: 'Invalid or expired OTP. Please try again.' });
        return;
      }
      // Delete used OTP
      await Otp.deleteMany({ phone: cleanPhone });
    } else if (firebaseIdToken) {
      // Legacy Firebase Token Verification
      try {
        const decodedToken = await (admin as any).auth().verifyIdToken(firebaseIdToken);
        if (!decodedToken.phone_number) {
          res.status(400).json({ message: 'Invalid token: No phone number associated' });
          return;
        }
      } catch (firebaseErr) {
        console.error('Firebase Token Verification Failed:', firebaseErr);
        res.status(401).json({ message: 'Invalid or expired phone verification token' });
        return;
      }
    } else if (!process.env.FAST2SMS_API_KEY) {
      // DEV MODE: Skip OTP verification when SMS gateway is not configured
      console.log(`⚡ [DEV MODE] Skipping OTP verification for ${cleanPhone} — No FAST2SMS_API_KEY set`);
    } else {
      res.status(400).json({ message: 'Phone verification is required' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Upsert or create user for this email/phone (now globally unique)
    let user = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { phone: cleanPhone },
        { phone: `+91${cleanPhone}` }
      ]
    });

    if (user) {
      // Role conflict validation:
      // - Customer registration: always allowed for any existing account (e.g. restaurant owner or rider also using customer app)
      // - Customer onboarding to restaurant or rider: allowed (upgrades role)
      // - Conflicting partner roles (restaurant <-> rider): reject
      if (user.role !== role && user.role !== 'customer' && role !== 'customer') {
        res.status(400).json({ message: `This account is already registered as a ${user.role}. Please log in to the ${user.role} app or use a different phone number.` });
        return;
      }
      
      user.name = name || user.name;
      user.password = hashedPassword;
      user.email = email.toLowerCase();
      user.phone = cleanPhone;
      if (expoPushToken) user.expoPushToken = expoPushToken;

      // If a customer is registering as restaurant or rider, upgrade role
      if (user.role === 'customer' && (role === 'restaurant' || role === 'rider')) {
        user.role = role;
      }

      await user.save();

      if (role === 'customer') {
        await CustomerProfile.findOneAndUpdate(
          { userId: user._id }, 
          { ...(bloodGroup ? { bloodGroup } : {}) }, 
          { upsert: true }
        );
      } else if (role === 'rider') {
        const docUpdates: any = {};
        if (licenseUrl) docUpdates['documents.licenseUrl'] = licenseUrl;
        if (rcUrl) docUpdates['documents.rcUrl'] = rcUrl;
        if (profilePhotoUrl) docUpdates['documents.profilePhotoUrl'] = profilePhotoUrl;
        if (aadharNumber) docUpdates['documents.aadharNumber'] = aadharNumber;
        if (aadharUrl) docUpdates['documents.aadharUrl'] = aadharUrl;
        if (riderPanNumber) docUpdates['documents.riderPanNumber'] = riderPanNumber;
        if (riderPanUrl) docUpdates['documents.riderPanUrl'] = riderPanUrl;
        
        await RiderProfile.findOneAndUpdate(
          { userId: user._id },
          { vehicleDetails, vehicleType, $set: docUpdates },
          { upsert: true }
        );
      } else if (role === 'restaurant') {
        if (restaurantName) {
          await Restaurant.findOneAndUpdate({ owner: user._id }, { name: restaurantName }, { upsert: true });
        }
      }

    } else {
      user = await User.create({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role,
        phone: cleanPhone,
        expoPushToken
      });


      if (role === 'customer') {
        await CustomerProfile.create({ userId: user._id, bloodGroup });
      } else if (role === 'rider') {
        await RiderProfile.create({
          userId: user._id,
          vehicleDetails,
          vehicleType,
          documents: {
            licenseUrl, rcUrl, profilePhotoUrl, aadharNumber, aadharUrl, riderPanNumber, riderPanUrl
          }
        });
      } else if (role === 'restaurant') {
        await Restaurant.create({
          owner: user._id,
          name: restaurantName || name,
          location: { type: 'Point', coordinates: [78.8242, 14.4673] }
        });
      }
    }

    if (user) {
      // Send welcome email asynchronously
      sendWelcomeEmail(user.email, user.name, user.role).catch((err) =>
        console.error('Failed to send welcome email:', err)
      );

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        token: generateToken(user._id.toString()),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password, role, expoPushToken } = req.body;

  try {
    const input = (email || '').trim().toLowerCase();
    const cleanPhone = input.replace(/^(\+91|91)/, '').replace(/\D/g, '');

    const orConditions: any[] = [{ email: input }];
    if (cleanPhone) {
      orConditions.push({ phone: cleanPhone }, { phone: `+91${cleanPhone}` });
    }
    if (input) {
      orConditions.push({ phone: input });
    }

    // Role-aware user lookup:
    // - For Customer App (role === 'customer' or undefined):
    //   ANY registered user (customer, restaurant, rider, admin) can log in as a customer!
    // - For Restaurant / Rider apps:
    //   User must be authorized for that partner role (or admin).
    let user;
    if (role && role !== 'customer') {
      user = await User.findOne({
        $and: [
          { role: { $in: [role, 'admin'] } },
          { $or: orConditions }
        ]
      });
      // If user exists with role === 'customer' but not restaurant/rider, return helpful message
      if (!user) {
        const anyUser = await User.findOne({ $or: orConditions });
        if (anyUser && (await bcrypt.compare(password, anyUser.password))) {
          res.status(403).json({
            message: `This account is registered as a ${anyUser.role}. Please log in to the ${anyUser.role} app or use an authorized partner account.`
          });
          return;
        }
      }
    } else {
      user = await User.findOne({ $or: orConditions });
    }

    if (user && (await bcrypt.compare(password, user.password))) {
      if (expoPushToken && user.expoPushToken !== expoPushToken) {
        user.expoPushToken = expoPushToken;
        await user.save();
      }

      // Ensure customer profile exists if logging into Customer App
      if (!role || role === 'customer') {
        await CustomerProfile.findOneAndUpdate(
          { userId: user._id },
          { $setOnInsert: { userId: user._id } },
          { upsert: true }
        );
      }

      let restaurantId = undefined;
      if (user.role === 'restaurant') {
        const restaurant = await Restaurant.findOne({ owner: user._id });
        if (restaurant) {
          restaurantId = restaurant._id;
        }
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified,
        onboardingStatus: user.onboardingStatus,
        restaurantId,
        token: generateToken(user._id.toString()),
      });
    } else {
      res.status(401).json({ message: 'Invalid email, phone number, or password.' });
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const verifyRider = async (req: any, res: Response) => {
  const { 
    profilePhotoUrl, 
    licenseUrl, 
    rcUrl, 
    aadharNumber, 
    aadharUrl, 
    riderPanNumber, 
    riderPanUrl 
  } = req.body;
  
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    if (user.role !== 'rider') {
      res.status(403).json({ message: 'Only riders can be verified through this endpoint' });
      return;
    }

    await RiderProfile.findOneAndUpdate({ userId: user._id }, {
      $set: {
        'documents.profilePhotoUrl': profilePhotoUrl,
        'documents.licenseUrl': licenseUrl,
        'documents.rcUrl': rcUrl,
        'documents.aadharNumber': aadharNumber,
        'documents.aadharUrl': aadharUrl,
        'documents.riderPanNumber': riderPanNumber,
        'documents.riderPanUrl': riderPanUrl
      }
    }, { upsert: true });
    
    user.isVerified = false; // Requires Superadmin approval
    user.onboardingStatus = 'pending_verification';
    
    const updatedUser = await user.save();
    
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      isVerified: updatedUser.isVerified,
      onboardingStatus: updatedUser.onboardingStatus,
      token: generateToken(updatedUser._id.toString()),
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error during verification', error: error.message });
  }
};

export const verifyRestaurant = async (req: any, res: Response) => {
  const { 
    fssaiNumber, fssaiUrl, 
    gstNumber, gstUrl, 
    panNumber, panUrl, 
    accountNumber, ifscCode, accountHolderName, cancelledChequeUrl 
  } = req.body;
  
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    if (user.role !== 'restaurant') {
      res.status(403).json({ message: 'Only restaurants can be verified through this endpoint' });
      return;
    }

    await Restaurant.findOneAndUpdate({ owner: user._id }, {
      $set: {
        'documents.fssaiNumber': fssaiNumber,
        'documents.fssaiUrl': fssaiUrl,
        'documents.gstNumber': gstNumber,
        'documents.gstUrl': gstUrl,
        'documents.panNumber': panNumber,
        'documents.panUrl': panUrl,
        'documents.cancelledChequeUrl': cancelledChequeUrl,
        'bankDetails.accountNumber': accountNumber,
        'bankDetails.ifscCode': ifscCode,
        'bankDetails.accountHolderName': accountHolderName
      }
    }, { upsert: true });

    user.isVerified = false; 
    user.onboardingStatus = 'pending_verification';
    
    const updatedUser = await user.save();
    
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      isVerified: updatedUser.isVerified,
      onboardingStatus: updatedUser.onboardingStatus,
      token: generateToken(updatedUser._id.toString()),
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error during restaurant verification', error: error.message });
  }
};



export const getMe = async (req: any, res: Response) => {
  try {
    const user: any = await User.findById(req.user._id).select('-password').lean();
    if (user) {
      // Always attach CustomerProfile details (savedAddresses, bloodGroup) if available
      const customerProfile = await CustomerProfile.findOne({ userId: user._id }).lean();
      if (customerProfile) {
        user.savedAddresses = customerProfile.savedAddresses;
        if (!user.profilePhotoUrl && customerProfile.profilePhotoUrl) {
          user.profilePhotoUrl = customerProfile.profilePhotoUrl;
        }
      }

      if (user.role === 'customer') {
        if (customerProfile) Object.assign(user, customerProfile);
      } else if (user.role === 'rider') {
        const profile = await RiderProfile.findOne({ userId: user._id }).lean();
        if (profile) Object.assign(user, profile);
      } else if (user.role === 'restaurant') {
        const restaurant = await Restaurant.findOne({ owner: user._id }).lean();
        if (restaurant) Object.assign(user, restaurant);
      }
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
