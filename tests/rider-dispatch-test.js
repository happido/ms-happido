const { chromium } = require('playwright');
const assert = require('assert');

(async () => {
  console.log('🚀 Starting Enterprise Dispatch DOM Test...');

  // 1. Register a dynamic test rider
  const dynamicPhone = Math.floor(1000000000 + Math.random() * 9000000000).toString();
  console.log(`📡 Registering test rider with phone: ${dynamicPhone}`);
  
  const regRes = await fetch('http://localhost:5005/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'E2E Dispatch Rider',
      email: `e2e_rider_${dynamicPhone}@happido.com`,
      phone: dynamicPhone,
      password: 'password123',
      role: 'rider'
    })
  });
  
  const riderData = await regRes.json();
  if (!riderData.token) {
    console.error('Failed to register rider:', riderData);
    process.exit(1);
  }
  
  const token = riderData.token;
  const userId = riderData._id;
  console.log(`✅ Registered Rider: ${userId}`);

  // 2. Set Location
  await fetch('http://localhost:5005/api/auth/me/location', {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      address: "E2E Test Location",
      location: { type: "Point", coordinates: [78.8242, 14.4673] }
    })
  });
  console.log('✅ Set Rider Location');

  // 3. Launch Playwright
  console.log('🌐 Launching Headless Chromium (Rider App)...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Load app to initialize origin
  await page.goto('http://localhost:8083');

  // Inject authentication into AsyncStorage
  console.log('🔑 Injecting auth tokens into AsyncStorage...');
  await page.evaluate(async (data) => {
    // React Native Web uses window.localStorage for AsyncStorage
    window.localStorage.setItem('token', data.token);
    window.localStorage.setItem('userId', data.userId);
    window.localStorage.setItem('userName', 'E2E Dispatch Rider');
  }, { token, userId });

  // Reload to trigger authenticated state
  await page.reload();
  await page.waitForLoadState('networkidle');

  console.log('📱 Rider App Loaded. Waiting for "Go Online" button...');
  
  // Try to go online via DOM
  try {
    const goOnlineBtn = page.getByText(/go online|offline/i);
    await goOnlineBtn.waitFor({ state: 'visible', timeout: 5000 });
    const text = await goOnlineBtn.textContent();
    if (text.toLowerCase().includes('offline')) {
      console.log('👆 Clicking "Go Online" to connect to Dispatch Engine');
      await goOnlineBtn.click();
    } else {
      console.log('✅ Rider is already Online');
    }
  } catch (e) {
    console.log('⚠️ Could not find "Go Online" button, assuming auto-online or layout changed.');
  }

  // 4. Trigger the Dispatch Engine from Backend
  console.log('⚙️ Triggering Backend Dispatch Test Endpoint...');
  const dispatchRes = await fetch('http://localhost:5005/api/dispatch/test', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const dispatchData = await dispatchRes.json();
  if (dispatchRes.status !== 200) {
    console.error('❌ Dispatch trigger failed:', dispatchData);
    // Continue anyway to see if a ping still somehow arrives
  } else {
    console.log(`✅ Dispatch Engine Activated: ${dispatchData.message}`);
  }

  // 5. Verify the Modal appears in the DOM
  console.log('⏱️ Waiting for Incoming Dispatch Modal to appear in DOM...');
  try {
    // The modal has text "New Delivery Request"
    const modalTitle = page.getByText('New Delivery Request');
    await modalTitle.waitFor({ state: 'visible', timeout: 15000 });
    console.log('🎉 SUCCESS: Dispatch Modal detected in DOM!');

    // Wait for the Accept Order button
    const acceptBtn = page.getByText('Accept Order');
    await acceptBtn.waitFor({ state: 'visible' });
    
    console.log('👆 Simulating Rider clicking "Accept Order"...');
    await acceptBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'dispatch_success_click.png' });
    
    // The modal should disappear after accept
    await modalTitle.waitFor({ state: 'hidden', timeout: 5000 });
    console.log('✅ Order Accepted and Modal Dismissed correctly!');
    
    console.log('🏆 Enterprise End-to-End Test Passed.');
  } catch (e) {
    console.error('❌ E2E Test Failed.', e);
    await page.screenshot({ path: 'dispatch_failure.png' });
    console.log('📸 Saved failure screenshot to dispatch_failure.png');
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
