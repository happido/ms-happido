import io from 'socket.io-client';
import axios from 'axios';

async function testWorkflow() {
  const riderLogin = await axios.post('http://localhost:5005/api/auth/login', {
    email: 'testrider1@happido.com',
    password: 'password123'
  });
  console.log("Rider login data:", riderLogin.data);
  const riderId = riderLogin.data._id || riderLogin.data.id || riderLogin.data.user?._id;
  const riderToken = riderLogin.data.token;
  console.log('Rider ID:', riderId);

  const customerLogin = await axios.post('http://localhost:5005/api/auth/login', {
    email: 'testcustomer1@happido.com',
    password: 'password123'
  });
  const customerId = customerLogin.data._id || customerLogin.data.id || customerLogin.data.user?._id;
  const customerToken = customerLogin.data.token;
  console.log('Customer ID:', customerId);

  const riderSocket = io('http://localhost:5005');
  riderSocket.on('connect', () => {
    riderSocket.emit('joinRoom', riderId);
    riderSocket.emit('goOnline', riderId);
    console.log('Rider online');
  });

  const customerSocket = io('http://localhost:5005');
  customerSocket.on('connect', () => {
    customerSocket.emit('joinRoom', customerId);
    console.log('Customer online');
  });

  riderSocket.on('newRideRequest', async (ride) => {
    console.log('RIDER RECEIVED REQUEST:', ride._id);
    try {
      await axios.put(`http://localhost:5005/api/rides/${ride._id}/accept`, {}, { headers: { Authorization: `Bearer ${riderToken}` } });
      console.log('Rider accepted ride');
    } catch(e) { console.error('Accept fail:', e?.response?.data || e.message); }
  });

  customerSocket.on('rideStatusUpdate', (ride) => {
    console.log('CUSTOMER RECEIVED STATUS:', ride.status);
    if (ride.status === 'accepted') {
      console.log('SUCCESS');
      process.exit(0);
    }
  });

  setTimeout(async () => {
    console.log('Customer sending request...');
    try {
      await axios.post('http://localhost:5005/api/rides/request', {
        vehicleType: 'auto',
        fare: 50,
        pickupLocation: { type: 'Point', coordinates: [78.8242, 14.4673] },
        dropoffLocation: { type: 'Point', coordinates: [78.8342, 14.4773] }
      }, { headers: { Authorization: `Bearer ${customerToken}` } });
    } catch(e) { console.error('Req fail:', e?.response?.data || e.message); }
  }, 2000);
}
testWorkflow();
