import { test, expect } from '@playwright/test';

test('image upload reaches real backend, renders choices, retains history and saves knowledge', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await page.getByLabel('Email', { exact: true }).fill(process.env.VERIFY_EMAIL);
  await page.getByLabel('Mật khẩu', { exact: true }).fill(process.env.VERIFY_PASSWORD);
  await page.getByRole('button', { name: 'Vào góc học của tôi' }).click();
  await page.getByRole('link', { name: 'Hỏi & Dịch', exact: true }).click();
  const input = page.getByLabel('Chọn ảnh JPEG / PNG');
  await expect(input).toBeEnabled();
  const bytes = await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 900; canvas.height = 220;
    const context = canvas.getContext('2d');
    context.fillStyle = 'white'; context.fillRect(0, 0, 900, 220);
    context.fillStyle = 'black'; context.font = '26px sans-serif';
    context.fillText('1. She ___ to school every day.', 20, 65);
    context.fillText('A. go   B. goes   C. going   D. gone', 20, 130);
    return canvas.toDataURL('image/png').split(',')[1];
  });
  await input.setInputFiles({ name: 'english-question.png', mimeType: 'image/png', buffer: Buffer.from(bytes, 'base64') });
  await expect(page.getByRole('img', { name: 'Ảnh 1: english-question.png', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Phóng to ảnh 1: english-question.png' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByLabel('Độ phóng đại').selectOption('200');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByLabel('Số câu cần giải (không bắt buộc)').fill('1');
  await page.getByLabel('Đáp án bạn đã chọn (không bắt buộc)').fill('1A');
  const completed = page.waitForResponse((response) => response.url().endsWith('/assistant-requests'));
  await page.getByRole('button', { name: 'Gửi ảnh bài tập' }).click();
  const response = await completed;
  expect(response.status()).toBe(200);
  const result = await response.json();
  expect(JSON.parse(result.content).task).toBe('DETAILED');
  await expect(page.getByText('Đáp án AI đề xuất: B. goes', { exact: true })).toBeVisible();
  await expect(page.locator('.image-options li')).toHaveCount(4);
  await expect(page.locator('.image-options .verdict-CORRECT')).toContainText('B. goes');
  await expect(page.getByRole('img', { name: 'Ảnh 1: english-question.png', exact: true })).toHaveCount(0);
  await page.reload();
  await page.getByRole('button', { name: 'Image: DETAILED', exact: true }).click();
  await expect(page.getByText('Đáp án AI đề xuất: B. goes', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Lưu kiến thức 1 của câu 1' }).click();
  await page.getByRole('button', { name: 'Lưu kiến thức', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);

  await page.evaluate(async () => {
    const profile = await (await fetch('/api/v1/auth/me')).json();
    const token = decodeURIComponent(document.cookie.split('; ').find((cookie) => cookie.startsWith('XSRF-TOKEN=')).substring('XSRF-TOKEN='.length));
    const updated = await fetch('/api/v1/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json', 'X-XSRF-TOKEN': token }, body: JSON.stringify({ ...profile, retainHistory: false }) });
    if (!updated.ok) throw new Error('Cannot disable history in isolated test');
  });
  await input.setInputFiles({ name: 'hint.png', mimeType: 'image/png', buffer: Buffer.from(bytes, 'base64') });
  await page.getByRole('button', { name: 'Gợi ý', exact: true }).click();
  await page.getByRole('button', { name: 'Gửi ảnh bài tập' }).click();
  await expect(page.getByText('Gợi ý: chú ý chủ ngữ số ít.', { exact: true })).toBeVisible();
  const latest = page.locator('article.message.assistant').last();
  await expect(latest.locator('.image-answer')).toHaveCount(0);
  await expect(latest.locator('.image-options li')).toHaveCount(0);
  // A private result must survive the history refetch even though it was not inserted into DB.
  await expect(page.locator('article.message.assistant')).toHaveCount(2);
  const storedCount = await page.evaluate(async () => (await (await fetch('/api/v1/data-export')).json()).messages.length);
  expect(storedCount).toBe(2);

  await input.setInputFiles({ name: 'retry.png', mimeType: 'image/png', buffer: Buffer.from(bytes, 'base64') });
  await page.getByLabel('Nội dung cần hỏi').fill('retry protocol once');
  const failed = page.waitForResponse((value) => value.url().endsWith('/assistant-requests'));
  await page.getByRole('button', { name: 'Gửi ảnh bài tập' }).click();
  expect((await failed).status()).toBe(502);
  await expect(page.getByRole('img', { name: 'Ảnh 1: retry.png', exact: true })).toBeVisible();
  const recovered = page.waitForResponse((value) => value.url().endsWith('/assistant-requests'));
  await page.getByRole('button', { name: 'Gửi thành yêu cầu mới', exact: true }).click();
  expect((await recovered).status()).toBe(200);
  await expect(page.locator('article.message.assistant')).toHaveCount(3);

  for (const width of [360, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
  }
  const exported = await page.evaluate(async () => (await fetch('/api/v1/data-export')).json());
  expect(JSON.stringify(exported)).not.toContain('data:image/');
  expect(exported.learningItems.length).toBe(1);
  expect(errors).toEqual([]);
});
