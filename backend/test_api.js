const axios = require('axios');
axios.get('http://localhost:5005/api/orders/restaurant', {
  headers: {
    Authorization: 'Bearer MOCK_OR_REAL_TOKEN_HERE_WAIT'
  }
}).then(console.log).catch(console.error);
