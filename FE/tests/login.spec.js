import { test, expect } from '@playwright/test';

/**
 * ✅ TC01 - Đăng nhập thành công (Staff)
 * Mục tiêu: Kiểm tra hệ thống cho phép đăng nhập với thông tin hợp lệ.
 */
test('TC01 - Đăng nhập thành công (Staff)', async ({ page }) => {
  await page.goto('http://localhost:5173/login');

  const emailInput = page.locator('input[placeholder="Email"]');
  const passwordInput = page.locator('input[placeholder="Password"]');
  const signInButton = page.locator('button[type="submit"]');

  // Nhập thông tin hợp lệ
  await emailInput.fill('staff1@premiumauto.com');
  await passwordInput.fill('staff123');
  await signInButton.click();

  // ✅ Kiểm tra điều hướng sang dashboard
  await expect(page).toHaveURL(/(manager|staff)\/dashboard/);

  // ✅ Kiểm tra tiêu đề hoặc phần tử chính trong dashboard
  await expect(page.locator('h1')).toContainText(/dashboard/i);
});



/**
 * ❌ TC02 - Sai mật khẩu
 * Mục tiêu: Kiểm tra hệ thống xử lý đúng khi mật khẩu không chính xác.
 */
test('TC02 - Sai mật khẩu', async ({ page }) => {
  await page.goto('http://localhost:5173/login');

  const emailInput = page.locator('input[placeholder="Email"]');
  const passwordInput = page.locator('input[placeholder="Password"]');
  const signInButton = page.locator('button[type="submit"]');
  const errorMessage = page.locator('div.text-red-600, div.bg-red-50');

  // Nhập email đúng, mật khẩu sai
  await emailInput.fill('manager@demo.com');
  await passwordInput.fill('saimatkhau');
  await signInButton.click();

  // ⏱ Chờ phản hồi từ server
  await page.waitForTimeout(1500);

  // ✅ Kiểm tra vẫn ở trang login
  await expect(page).toHaveURL('http://localhost:5173/login');

  // ✅ Kiểm tra có thông báo lỗi (backend trả về)
  await expect(errorMessage).toContainText(/Invalid email or password|Login failed|Vui lòng kiểm tra/i);
});



/**
 * ⚠️ TC03 - Email sai định dạng (Fail Intentionally)
 * Mục tiêu: Kiểm tra validate ở frontend (sẽ FAIL nếu form chưa kiểm tra định dạng email).
 */
test('TC03 - Email sai định dạng (Fail Intentionally)', async ({ page }) => {
  await page.goto('http://localhost:5173/login');

  const emailInput = page.locator('input[placeholder="Email"]');
  const passwordInput = page.locator('input[placeholder="Password"]');
  const signInButton = page.locator('button[type="submit"]');
  const errorMessage = page.locator('.error, div.text-red-600, div.bg-red-50');

  // Nhập email sai định dạng
  await emailInput.fill('abc');
  await passwordInput.fill('123456');
  await signInButton.click();

  // ✅ Mong muốn: hiển thị lỗi "Invalid email" (nếu có frontend validation)
  // ❌ Nếu app chưa validate email format => Test này FAIL (dùng để minh họa Negative Test)
  await expect(errorMessage).toHaveText(/Invalid email/i);
});