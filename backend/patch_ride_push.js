const fs = require('fs');
const rideController = '/Users/apple/MS Happido/backend/src/controllers/rideController.ts';
let rcContent = fs.readFileSync(rideController, 'utf8');

const pushLogic = `
import { Expo } from 'expo-server-sdk';
let expo = new Expo();

const sendPushToDrivers = async (vehicleType: string, rideMessage: any) => {
  try {
    const User = require('../models/User').default;
    const drivers = await User.find({ role: 'rider', vehicleType, isOnline: true });
    
    let messages = [];
    for (let driver of drivers) {
      if (!driver.expoPushToken) continue;
      if (!Expo.isExpoPushToken(driver.expoPushToken)) continue;
      
      messages.push({
        to: driver.expoPushToken,
        sound: 'default',
        title: 'New Ride Request! 🚗',
        body: \`A customer is requesting a \${vehicleType} nearby. Tap to accept!\`,
        data: { rideId: rideMessage._id },
      });
    }

    let chunks = expo.chunkPushNotifications(messages);
    for (let chunk of chunks) {
      await expo.sendPushNotificationsAsync(chunk);
    }
  } catch (err) {
    console.error("Push notification error:", err);
  }
};
`;

if (!rcContent.includes('expo-server-sdk')) {
    rcContent = pushLogic + "\n" + rcContent;
    
    // Inject into requestRide
    const injectPoint = "io.to(`online_riders_${vehicleType}`).emit('newRideRequest', ride);";
    rcContent = rcContent.replace(injectPoint, injectPoint + "\n    sendPushToDrivers(vehicleType, ride);");
    
    fs.writeFileSync(rideController, rcContent);
    console.log('Ride controller updated.');
} else {
    console.log('Already updated');
}

