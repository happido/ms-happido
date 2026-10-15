const fetch = require('node-fetch');
const run = async () => {
  const clientId = '96dHZVzsAusvwIFXX3lgtLkUZwZqm1yrXmhf809zwysZVa4IkXexuiyZ9R0dSTJuoSeKYrNl_Z-EyavSjKcHNQ==';
  const clientSecret = 'lrFxI-iSEg-FZMC_R-F-kYzDjpVlc4Cgpr9JgPZmObCltlO-xVS-PyUZ8WLAR5zgBjYnFnqxcQjXeAvdHAlATCJR9YTRU8gE';
  const response = await fetch('https://outpost.mappls.com/api/security/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=client_credentials&client_id=${encodeURIComponent(clientId)}&client_secret=${encodeURIComponent(clientSecret)}`
  });
  const data = await response.json();
  const token = data.access_token;
  console.log("Token:", token);
  
  const revRes = await fetch(`https://apis.mappls.com/advancedmaps/v1/${token}/rev_geocode?lat=14.4673&lng=78.8242`);
  const revData = await revRes.json();
  console.log("Rev Geocode:", JSON.stringify(revData, null, 2));
};
run();
