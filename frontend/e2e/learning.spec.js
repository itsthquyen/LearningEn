import { test, expect } from '@playwright/test';

async function login(page) {
  await page.goto('/');await page.getByLabel('Email', { exact: true }).fill(process.env.E2E_EMAIL);await page.getByLabel('Mật khẩu', { exact: true }).fill(process.env.E2E_PASSWORD);await page.getByRole('button', { name: 'Vào góc học của tôi' }).click();await expect(page.getByRole('heading', { name: /hôm nay mình học gì/ })).toBeVisible();
}
test('full personal loop: AI → save → review → lesson → export → erase → restore', async ({ page }) => {
  const errors = [];page.on('pageerror', (error) => errors.push(error.message));await login(page);
  await page.getByRole('link', { name: 'Hỏi & Dịch', exact: true }).click();await page.getByLabel('Nội dung cần hỏi').fill('I look forward to hearing from you.');await page.getByRole('button', { name: 'Gửi câu hỏi' }).click();await expect(page.getByText('Tôi mong nhận được phản hồi từ bạn.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Lưu sổ tay' }).click();await page.getByLabel('Đưa kiến thức này vào ôn tập').check();await page.getByRole('button', { name: 'Lưu kiến thức', exact: true }).click();await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByRole('link', { name: 'Sổ tay của tôi', exact: true }).click();await expect(page.getByRole('heading', { name: 'I look forward to hearing from you.', exact: true })).toBeVisible();await page.reload();await expect(page.getByText('Tôi mong nhận được phản hồi từ bạn.', { exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Ôn tập', exact: true }).click();await expect(page.getByText('Tôi mong nhận được phản hồi từ bạn.', { exact: true })).toHaveCount(0);await page.getByRole('button', { name: 'Xem đáp án' }).click();await expect(page.getByText('Tôi mong nhận được phản hồi từ bạn.', { exact: true })).toBeVisible();await page.getByRole('button', { name: 'Nhớ', exact: true }).click();await expect(page.getByRole('heading', { name: 'Bạn đã ôn xong phiên này' })).toBeVisible();
  await page.getByRole('link', { name: 'Lộ trình & Tiến bộ', exact: true }).click();await page.getByRole('link').filter({ hasText: 'Chào hỏi và giới thiệu' }).click();await page.getByRole('radio', { name: 'is', exact: true }).check();await page.getByRole('radio', { name: 'What is your name?', exact: true }).check();await page.getByRole('button', { name: 'Lưu nháp', exact: true }).click();await expect(page.getByText('Đã lưu nháp', { exact: true })).toBeVisible();await page.reload();await expect(page.getByRole('radio', { name: 'is', exact: true })).toBeChecked();await page.getByRole('radio', { name: 'I am An.', exact: true }).check();await page.getByRole('button', { name: 'Nộp bài', exact: true }).click();await expect(page.getByRole('heading', { name: 'Bạn đã đạt bài này độc lập' })).toBeVisible();await page.getByRole('link', { name: 'Xem tiến bộ' }).click();await expect(page.getByText('1/16 bài đạt', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Bắt đầu', exact: true }).click();await expect(page.getByRole('button', { name: 'Kết thúc phiên' })).toBeVisible();await page.waitForTimeout(2200);await page.getByRole('button', { name: 'Kết thúc phiên' }).click();await expect(page.getByRole('button', { name: 'Bắt đầu', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Cài đặt & Dữ liệu', exact: true }).click();const downloaded = page.waitForEvent('download');await page.getByRole('button', { name: 'Xuất dữ liệu JSON' }).click();const file = await downloaded;const backup = await file.path();expect(backup).toBeTruthy();
  await page.getByRole('button', { name: 'Xóa dữ liệu học tập', exact: true }).click();await page.getByLabel('Xác nhận', { exact: true }).fill('XÓA');await page.getByRole('button', { name: 'Xóa vĩnh viễn dữ liệu học tập' }).click();await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByLabel('Chọn bản sao lưu JSON').setInputFiles(backup);await page.getByRole('button', { name: 'Khôi phục bản sao lưu' }).click();await expect(page.getByRole('status').filter({ hasText: /Đã khôi phục/ })).toBeVisible();
  await page.getByRole('link', { name: 'Sổ tay của tôi', exact: true }).click();await expect(page.getByRole('heading', { name: 'I look forward to hearing from you.', exact: true })).toBeVisible();expect(errors).toEqual([]);
  await page.getByRole('button', { name: 'Đăng xuất', exact: true }).click();await expect(page.getByRole('button', { name: 'Vào góc học của tôi' })).toBeVisible();
});

test('360px mobile and desktop pages fit viewport and dialogs support keyboard', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });await login(page);
  for (const path of ['/', '/assistant', '/notebook', '/reviews', '/progress', '/settings']) {
    await page.goto(path);await expect(page.locator('h1')).toBeVisible();await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
    await page.screenshot({ path: `../work/e2e/mobile-${path.replaceAll('/', '') || 'dashboard'}.png`, fullPage: true });
  }
  await page.goto('/notebook');await page.getByRole('button', { name: 'Thêm kiến thức' }).click();await expect(page.getByRole('dialog')).toBeVisible();await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.setViewportSize({ width: 1440, height: 1000 });await page.goto('/');await page.screenshot({ path: '../work/e2e/desktop-dashboard.png', fullPage: true });
});
