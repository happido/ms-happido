import { test, expect } from '@playwright/test';

test('has title and dashboard stats', async ({ page }) => {
  // Use a mocked backend response or just verify UI loads
  await page.goto('http://localhost:3000');

  // Verify the page title/header
  await expect(page.locator('h1')).toContainText('MS Happido Superadmin');

  // Verify the "Live Monitoring Active" badge
  await expect(page.getByText('Live Monitoring Active')).toBeVisible();
});

test('can navigate to KYC verification', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // Click the KYC link
  await page.click('text=Verify KYC');
  
  // Check the URL
  await expect(page).toHaveURL(/.*kyc/);
  
  // Verify the KYC header
  await expect(page.locator('h1')).toContainText('KYC Verification');
});

test('can navigate to God-Mode Map', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // Click the Map link
  await page.click('text=God-Mode Map 🌍');
  
  // Check the URL
  await expect(page).toHaveURL(/.*map/);
  
  // Verify the Map header
  await expect(page.locator('h1')).toContainText('God-Mode Map');
});
