import { test, expect } from '@playwright/test';

test('real server: provider failure, notebook, review, lesson and backup restore', async ({ page }) => {
  const failures = [];
  page.on('pageerror', (error) => failures.push(error.message));
  await page.goto('/');
  await page.getByLabel('Email', { exact: true }).fill(process.env.VERIFY_EMAIL);
  await page.getByLabel('Mật khẩu', { exact: true }).fill(process.env.VERIFY_PASSWORD);
  const loggedIn = page.waitForResponse((response) => response.url().endsWith('/auth/login'));
  await page.getByRole('button', { name: 'Vào góc học của tôi' }).click();
  expect((await loggedIn).status()).toBe(200);
  await expect(page.getByRole('link', { name: 'Hỏi & Dịch', exact: true })).toBeVisible();

  await page.getByRole('link', { name: 'Hỏi & Dịch', exact: true }).click();
  await page.getByLabel('Nội dung cần hỏi').fill('Please explain this sentence.');
  const unavailable = page.waitForResponse((response) => response.url().endsWith('/assistant-requests'));
  await page.getByRole('button', { name: 'Gửi câu hỏi' }).click();
  expect((await unavailable).status()).toBe(503);
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page.getByLabel('Nội dung cần hỏi')).toHaveValue('Please explain this sentence.');

  await page.getByRole('link', { name: 'Sổ tay của tôi', exact: true }).click();
  await page.getByRole('button', { name: 'Thêm kiến thức' }).click();
  await page.getByLabel('Từ, cụm từ hoặc câu').fill('verification phrase');
  await page.getByLabel('Nghĩa theo ngữ cảnh').fill('A meaning entered by the learner');
  await page.getByLabel('Đưa kiến thức này vào ôn tập').check();
  await page.getByRole('button', { name: 'Lưu kiến thức', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'verification phrase', exact: true })).toBeVisible();

  await page.getByRole('link', { name: 'Ôn tập', exact: true }).click();
  await expect(page.getByText('A meaning entered by the learner', { exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Xem đáp án' }).click();
  await expect(page.getByText('A meaning entered by the learner', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Nhớ', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Bạn đã ôn xong phiên này' })).toBeVisible();

  await page.getByRole('link', { name: 'Lộ trình & Tiến bộ', exact: true }).click();
  await page.locator('a.lesson-row').first().click();
  await expect(page.getByText(/Nội dung bản nháp chưa/)).toBeVisible();
  const groups = page.locator('fieldset');
  const groupCount = await groups.count();
  expect(groupCount).toBeGreaterThan(0);
  for (let i = 0; i < groupCount; i++) await groups.nth(i).getByRole('radio').first().check();
  await page.getByRole('button', { name: 'Lưu nháp', exact: true }).click();
  await expect(page.getByText('Đã lưu nháp', { exact: true })).toBeVisible();
  const checked = await page.locator('input[type=radio]:checked').count();
  await page.reload();
  await expect(page.locator('input[type=radio]:checked')).toHaveCount(checked);
  const submitted = page.waitForResponse((response) => /\/lessons\/[^/]+\/attempts$/.test(new URL(response.url()).pathname));
  await page.getByRole('button', { name: 'Nộp bài', exact: true }).click();
  const result = await submitted;
  expect(result.status()).toBe(200);
  const serverGrade = await result.json();
  await expect(page.locator('.result-panel')).toBeVisible();
  if (serverGrade.score !== null) await expect(page.locator('.score')).toHaveText(`${serverGrade.score}%`);

  await page.getByRole('button', { name: 'Bắt đầu', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Kết thúc phiên' })).toBeVisible();
  await page.getByRole('button', { name: 'Kết thúc phiên' }).click();
  await expect(page.getByRole('button', { name: 'Bắt đầu', exact: true })).toBeVisible();

  await page.getByRole('link', { name: 'Cài đặt & Dữ liệu', exact: true }).click();
  const downloaded = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Xuất dữ liệu JSON' }).click();
  const backupPath = await (await downloaded).path();
  expect(backupPath).toBeTruthy();
  await page.getByRole('button', { name: 'Xóa dữ liệu học tập', exact: true }).click();
  await page.getByLabel('Xác nhận', { exact: true }).fill('XÓA');
  await page.getByRole('button', { name: 'Xóa vĩnh viễn dữ liệu học tập' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByLabel('Chọn bản sao lưu JSON').setInputFiles(backupPath);
  await page.getByRole('button', { name: 'Khôi phục bản sao lưu' }).click();
  await expect(page.getByRole('status').filter({ hasText: /Đã khôi phục/ })).toBeVisible();
  await page.getByRole('link', { name: 'Sổ tay của tôi', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'verification phrase', exact: true })).toBeVisible();

  for (const width of [360, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ['/', '/assistant', '/notebook', '/reviews', '/progress', '/settings']) {
      await page.goto(route);
      await expect(page.locator('h1')).toBeVisible();
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
    }
  }
  await page.goto('/notebook');
  await page.getByRole('button', { name: 'Thêm kiến thức' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByRole('button', { name: 'Đăng xuất', exact: true }).click();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Vào góc học của tôi' })).toBeVisible();
  expect(failures).toEqual([]);
});
