const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const fs = require('node:fs');
let browser;
(async () => {
  browser = await chromium.launch({ headless: true, channel: 'msedge' });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  fs.mkdirSync('artifacts', { recursive: true });
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const route of ['/', '/items', '/login', '/register', '/verify', '/forgot-password', '/reset-password', '/items/2147483647']) {
      await page.goto('http://127.0.0.1:4200' + route);
      await page.waitForLoadState('networkidle');
      const overflow = await page.evaluate(() => ({ body: document.documentElement.scrollWidth, viewport: innerWidth }));
      if (overflow.body > overflow.viewport) errors.push(route + ' horizontal overflow at ' + width + ': ' + JSON.stringify(overflow));
      if (route === '/' && [1440, 390].includes(width)) await page.screenshot({ path: 'artifacts/home-' + width + '.png', fullPage: true });
      if (route === '/register' && width === 390) await page.screenshot({ path: 'artifacts/register-mobile.png', fullPage: true });
      if (route === '/items/2147483647') {
        if (!await page.getByText("E'lon topilmadi", { exact: true }).isVisible()) errors.push('Missing error state for item detail');
      }
    }
  }
  await page.goto('http://127.0.0.1:4200');
  await page.getByRole('button', { name: 'Menyu' }).click();
  await page.locator('#main-nav').getByText('Kirish', { exact: true }).click();
  await page.waitForURL('**/login');

  const { pool } = await import('./backend-nodejs/src/config/pg.js');
  const { hashPassword } = await import('./backend-nodejs/src/helpers/hash.js');
  const marker = 'browser' + Date.now();
  const password = await hashPassword('Password123');
  let userId, categoryId;
  try {
    const user = await pool.query("INSERT INTO users (full_name, email, phone, password, role, is_verified) VALUES ($1, $2, '+998901234567', $3, 'admin', true) RETURNING id", ['Browser Test', marker + '@example.com', password]);
    userId = user.rows[0].id;
    const category = await pool.query('INSERT INTO categories (name) VALUES ($1) RETURNING id', [marker]);
    categoryId = category.rows[0].id;
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto('http://127.0.0.1:4200/login');
    await page.locator('#login-email').fill(marker + '@example.com');
    await page.locator('#login-password').fill('Password123');
    await page.locator('#login-btn').click();
    await page.waitForURL('**/items');
    await page.goto('http://127.0.0.1:4200/items/create');
    await page.locator('#create-title').fill('Brauzer sinov buyumi');
    await page.locator('#create-description').fill('Sinov uchun yaratilgan buyum tavsifi');
    await page.locator('#create-location').fill('Toshkent');
    await page.locator('#create-date').fill('2026-01-01');
    await page.locator('#create-category').selectOption(String(categoryId));
    await page.locator('#create-submit-btn').click();
    await page.waitForURL(/items\/\d+$/);
    const detailUrl = page.url();
    const id = detailUrl.split('/').pop();
    await page.locator('#edit-item-btn').click();
    await page.locator('#edit-title').fill('Yangilangan sinov buyumi');
    await page.locator('#edit-save-btn').click();
    await page.waitForURL(detailUrl);
    await page.getByRole('heading', { name: 'Yangilangan sinov buyumi' }).waitFor();
    for (const width of [1440, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const route of ['/profile', '/claims', '/items/create', '/items/' + id, '/items/' + id + '/edit', '/admin', '/admin/users', '/admin/categories']) {
        await page.goto('http://127.0.0.1:4200' + route);
        await page.waitForLoadState('networkidle');
        const sizes = await page.evaluate(() => ({ body: document.documentElement.scrollWidth, viewport: innerWidth }));
        if (sizes.body > sizes.viewport) errors.push(route + ' overflow at ' + width);
        const text = await page.locator('main').innerText();
        if (/NG0[0-9]+|Serverga ulanib|Server bilan bog/.test(text)) errors.push(route + ' error: ' + text);
      }
    }
    await page.goto(detailUrl);
    await page.locator('#close-item-btn').click();
    await page.waitForURL('**/items');
    const closed = await pool.query('SELECT status FROM items WHERE id = $1', [id]);
    if (closed.rows[0].status !== 'closed') errors.push('Close action failed');
  } finally {
    if (userId) await pool.query('DELETE FROM users WHERE id = $1', [userId]);
    if (categoryId) await pool.query('DELETE FROM categories WHERE id = $1', [categoryId]);
    await pool.end();
  }
  console.log(JSON.stringify({ pageChecks: 64, errors }, null, 2));
  await browser.close();
  if (errors.length) process.exitCode = 1;
})().catch(async error => { console.error(error); await browser?.close(); process.exitCode = 1; });
