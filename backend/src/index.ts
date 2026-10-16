import dns from 'dns';
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch {
  // Ignore
}
import 'dotenv/config';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { initCronJobs } from './services/cron';

import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db';
import authRoutes from './routes/authRoutes';
import restaurantRoutes from './routes/restaurantRoutes';
import orderRoutes from './routes/orderRoutes';
import rideRoutes from './routes/rideRoutes';
import bloodRoutes from './routes/bloodRoutes';
import adminRoutes from './routes/adminRoutes';
import uploadRoutes from './routes/uploadRoutes';
import walletRoutes from './routes/walletRoutes';
import kycRoutes from './routes/kycRoutes';
import surgeRoutes from './routes/surgeRoutes';
import dispatchRoutes from "./routes/dispatchRoutes";
import mapRoutes from './routes/mapRoutes';
import paymentRoutes from './routes/paymentRoutes';
import reviewRoutes from './routes/reviewRoutes';
import riderRoutes from './routes/riderRoutes';
import aiRoutes from './routes/aiRoutes';

// Connect to MongoDB
if (process.env.MONGO_URI) {
  connectDB();
} else {
  console.log('No MONGO_URI found in environment. Please add it to start database connection.');
}

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  }
});

app.set('io', io);
initCronJobs(io);

// ─────────────── SECURITY MIDDLEWARE ───────────────
// Helmet: Sets various HTTP security headers (XSS, HSTS, content-type sniffing, etc.)
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Global Rate Limiter: 100 requests per 15 minutes per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { message: 'Too many requests from this IP, please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

// Strict OTP Rate Limiter: 5 OTP requests per 10 minutes per IP
const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 1000,
  message: { message: 'Too many OTP requests. Please wait 10 minutes before trying again.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth Rate Limiter: 20 login/register attempts per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { message: 'Too many authentication attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─────────────── CORE MIDDLEWARE ───────────────
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ─────────────── ROUTES ───────────────
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/blood', bloodRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/kyc', kycRoutes);
app.use('/api/surge', surgeRoutes);
app.use('/api/dispatch', dispatchRoutes);
app.use('/api/maps', mapRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/rider', riderRoutes);
app.use('/api/ai', aiRoutes);

import { errorHandler, notFound } from './middlewares/errorMiddleware';

// Health Check endpoint (for monitoring)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.send('MS Happido API v1.0 is running...');
});

// Proxy for Mappls OAuth Token to bypass CORS
app.post('/api/mappls/token', async (req, res) => {
  try {
    const clientId = process.env.MAPPLS_CLIENT_ID;
    const clientSecret = process.env.MAPPLS_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
      return res.status(500).json({ error: 'Mappls keys not configured on server' });
    }
    const response = await fetch('https://outpost.mappls.com/api/security/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=client_credentials&client_id=${encodeURIComponent(clientId)}&client_secret=${encodeURIComponent(clientSecret)}`
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch Mappls token' });
  }
});

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  
  // Join a room based on userId for private notifications
  socket.on('joinRoom', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their room.`);
  });

  // --- PHASE 5: ENTERPRISE CHAT ENGINE ---
  socket.on('joinChatRoom', (rideId) => {
    socket.join(`chat_${rideId}`);
    console.log(`Socket ${socket.id} joined chat room: chat_${rideId}`);
  });

  socket.on('sendChatMessage', (messageData) => {
    const { rideId, senderId, text, timestamp } = messageData;
    // Broadcast to everyone in the chat room EXCEPT the sender
    socket.to(`chat_${rideId}`).emit('receiveChatMessage', { senderId, text, timestamp });
  });
  // ---------------------------------------

  // Rider going online
  socket.on('goOnline', async (riderId) => {
    socket.join('online_riders');
    try {
      const User = require('./models/User').default;
      const RiderProfile = require('./models/RiderProfile').default;
      const Ride = require('./models/Ride').default;
      
      const user = await User.findByIdAndUpdate(riderId, { isOnline: true }, { new: true });
      await RiderProfile.findOneAndUpdate({ userId: riderId }, { isOnline: true }, { upsert: true });
      const vType = (user && user.vehicleType) ? user.vehicleType : 'auto'; // Fallback to 'auto' for testing
      
      socket.join(`online_riders_${vType}`);
      console.log(`Rider ${riderId} went online as ${vType}.`);
      
      // Phase 3 Resilience: Dispatch any pending rides to the newly online rider
      const pendingRides = await Ride.find({ status: 'requested', vehicleType: vType }).populate('customer', 'name phone rating');
      if (pendingRides.length > 0) {
        console.log(`[Ride Dispatch] Found ${pendingRides.length} pending rides for ${vType}. Sending to ${riderId}`);
        pendingRides.forEach(ride => {
          socket.emit('newRideRequest', ride);
        });
      }
      
    } catch (err) {
      console.error('Error fetching rider vehicle type on goOnline:', err);
    }
  });

  // Rider going offline
  socket.on('goOffline', async (riderId) => {
    socket.leave('online_riders');
    try {
      const User = require('./models/User').default;
      const RiderProfile = require('./models/RiderProfile').default;
      await User.findByIdAndUpdate(riderId, { isOnline: false });
      await RiderProfile.findOneAndUpdate({ userId: riderId }, { isOnline: false }, { upsert: true });
      console.log(`Rider ${riderId} went offline.`);
    } catch (err) {
      console.error('Error going offline:', err);
    }
  });

  // Admin joining God's Eye map room
  socket.on('joinAdmin', () => {
    socket.join('admin_room');
    console.log(`Admin joined admin_room.`);
  });

  // Rider updating their live location
  socket.on('updateLocation', async (data) => {
    const { riderId, location, targetCustomerId } = data;
    if (!location) return;

    const lat = location?.coords?.latitude ?? location?.latitude;
    const lng = location?.coords?.longitude ?? location?.longitude;
    const heading = location?.coords?.heading ?? location?.heading ?? 0;
    const speed = location?.coords?.speed ?? location?.speed ?? 0;

    // Save to DB so Dispatch Engine can find nearby riders
    if (lat !== undefined && lng !== undefined && riderId) {
      try {
        const User = require('./models/User').default;
        const RiderProfile = require('./models/RiderProfile').default;
        const loc = { type: 'Point', coordinates: [lng, lat] };
        await User.findByIdAndUpdate(riderId, { location: loc });
        await RiderProfile.findOneAndUpdate({ userId: riderId }, { location: loc }, { upsert: true });
      } catch (err) {
        console.error('Error saving rider location:', err);
      }
    }

    const normalizedLocation = {
      latitude: lat,
      longitude: lng,
      heading,
      speed,
      coords: {
        latitude: lat,
        longitude: lng,
        heading,
        speed
      }
    };

    // Broadcast location to the specific customer
    if (targetCustomerId) {
      const targetIdStr = targetCustomerId?._id ? targetCustomerId._id.toString() : targetCustomerId.toString();
      io.to(targetIdStr).emit('riderLocationUpdate', { riderId, location: normalizedLocation });
    }
    // Broadcast to Admin God's Eye Map
    io.to('admin_room').emit('riderLocationUpdate', { riderId, location: normalizedLocation });
  });

  // Blood requirement alert broadcast
  socket.on('broadcastBloodRequest', (requestData) => {
    // Broadcast to all connected clients (can be filtered by geofencing later)
    socket.broadcast.emit('newBloodRequest', requestData);
  });

  // Volunteer location updates to the requester
  socket.on('volunteerLocationUpdate', (data) => {
    const { requesterId, volunteerId, location } = data;
    if (requesterId) {
      io.to(requesterId.toString()).emit('volunteerLocationUpdate', { volunteerId, location });
    }
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5005;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
