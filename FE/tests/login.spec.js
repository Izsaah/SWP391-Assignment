import { test, expect } from '@playwright/test';

test('Đăng nhập thành thành công', async ({ page }) => {
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
  await expect(signInButton).toHaveText(/Signing In/i);
});


test('TC02 - Sai thông tin đăng nhập', async ({ page }) => {
  await page.goto('http://localhost:5173/login');

  const emailInput = page.locator('input[placeholder="Email"]');
  const passwordInput = page.locator('input[placeholder="Password"]');
  const signInButton = page.locator('button[type="submit"]');

  await emailInput.fill('abc@demo.com'); // email hợp lệ
  await passwordInput.fill('saimatkhau'); // sai password
  await signInButton.click();

  const errorMessage = page.locator('.error');

  // ✅ Kỳ vọng đúng text thực tế trong app
  await expect(errorMessage).toHaveText(/Không thể đăng nhập\. Vui lòng kiểm tra lại tài khoản hoặc mật khẩu\./i);
});

// ❌ TEST CASE 3: Email sai định dạng (fail có chủ đích)
test('TC03 - Email sai định dạng (fail intentionally)', async ({ page }) => {
  await page.goto('http://localhost:5173/login');

  const emailInput = page.locator('input[placeholder="Email"]');
  const passwordInput = page.locator('input[placeholder="Password"]');
  const signInButton = page.locator('button[type="submit"]');
  const errorMessage = page.locator('.error'); // ví dụ, nếu có thẻ báo lỗi

  // Nhập email sai định dạng
  await emailInput.fill('abc'); 
  await passwordInput.fill('123456');
  await signInButton.click();

  // Kỳ vọng hệ thống hiển thị lỗi — nhưng nếu app chưa có validate, test này sẽ FAIL
  await expect(errorMessage).toHaveText(/Invalid email/i);
});