import { test, expect } from '@playwright/test';

test('Simple login form interaction on static page', async ({ page }) => {
  await page.goto('http://localhost:5173/login');

  const emailInput = page.locator('input[placeholder="Email"]');
  const passwordInput = page.locator('input[placeholder="Password"]');
  const signInButton = page.locator('button[type="submit"]'); // fix selector

  await emailInput.fill('manager@demo.com');
  await expect(emailInput).toHaveValue('manager@demo.com');

  await passwordInput.fill('123456');
  await expect(passwordInput).toHaveValue('123456');

  await signInButton.click();

  // Chỉ kiểm tra nút vẫn enable
  await expect(signInButton).toBeEnabled();
});
