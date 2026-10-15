const { io } = require('socket.io-client');
const axios = require('axios');

async function runTest() {
  console.log("Starting E2E Socket Test...");
  const customerId = "6aa105786f0c8d96e2ca498b"; // Test Customer ID
  const riderId = "6aa145667cb9e213d7e6ce60"; // Test Rider ID

  // 1. Connect Rider Socket
  const riderSocket = io('http://localhost:5005');
  riderSocket.on('connect', () => {
    console.log("Rider Connected, emitting goOnline");
    riderSocket.emit('goOnline', riderId);
  });

  // 2. Connect Customer Socket
  const customerSocket = io('http://localhost:5005');
  customerSocket.on('connect', () => {
    console.log("Customer Connected, joining personal room");
    customerSocket.emit('joinRoom', customerId);
  });

  // Listeners
  riderSocket.on('newRideRequest', async (ride) => {
    console.log("RIDER RECEIVED REQUEST!", ride._id);
    
    // Accept it
    try {
      const res = await axios.put(`http://localhost:5005/api/rides/${ride._id}/accept`, { riderId });
      console.log("Rider Accepted Ride via API:", res.data.status);
    } catch(err) {
      console.error("Accept failed:", err.response?.data || err.message);
    }
  });

  customerSocket.on('rideStatusUpdate', (ride) => {
    console.log("CUSTOMER RECEIVED STATUS UPDATE! ->", ride.status);
    if(ride.status === 'accepted') {
      console.log("SUCCESS! Flow works perfectly. OTP:", ride.otp);
      process.exit(0);
    }
  });

  // Trigger Ride Request from Customer
  setTimeout(async () => {
    console.log("Customer requesting ride...");
    try {
      await axios.post('http://localhost:5005/api/rides/request', {
        customerId,
        vehicleType: 'auto',
        pickupLocation: { type: 'Point', coordinates: [78.8242, 14.4673] },
        dropoffLocation: { type: 'Point', coordinates: [78.8342, 14.4773] }
      });
      console.log("Ride requested via API.");
    } catch (err) {
      console.error("Request failed:", err.response?.data || err.message);
    }
  }, 2000);
}

runTest();
