import { test, expect } from '@playwright/test';

const flight = {
  id: 'test-flight',
  airline: 'Test Air',
  flightNumber: 'TA123',
  departureTime: '2026-12-01 10:00',
  arrivalTime: '2026-12-01 12:00',
  departureAirport: 'SFO',
  arrivalAirport: 'JFK',
  price: 250,
  currency: 'USD',
  durationMinutes: 120,
  stops: 0,
};
const search = { from: 'SFO', to: 'JFK', date: '2026-12-01', passengers: 1 };

test('all pages render complete HTML and hydrate without runtime errors', async ({
  page,
  request,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  for (const path of ['/', '/hotels', '/alerts', '/trips']) {
    const response = await request.get(path);
    expect(response.ok()).toBeTruthy();
    expect(await response.text()).toContain('SkyCrawler');
    await page.goto(path);
    await expect(page.getByRole('navigation', { name: 'Primary' })).toHaveCount(1);
    await expect(
      page.getByRole('button', { name: 'Currency: US Dollar. Change currency' }),
    ).toBeVisible();
  }
  await expect(page.getByText('No trips saved yet.', { exact: false })).toBeVisible();
  expect(errors).toEqual([]);
});

test('alert CRUD works and alerts are isolated between browser sessions', async ({
  request,
  playwright,
}) => {
  const payload = {
    type: 'flight',
    searchQuery: search,
    thresholdPrice: 300,
    currency: 'USD',
    active: true,
  };
  const created = await request.post('/api/alerts', { data: payload });
  expect(created.status()).toBe(201);
  const alert = await created.json();
  const other = await playwright.request.newContext({ baseURL: 'http://127.0.0.1:3100' });
  expect(await (await other.get('/api/alerts')).json()).toEqual([]);
  expect((await other.delete(`/api/alerts/${alert.id}`)).status()).toBe(404);
  const updated = await request.put(`/api/alerts/${alert.id}`, { data: { active: false } });
  expect((await updated.json()).active).toBe(false);
  expect(
    (await request.put(`/api/alerts/${alert.id}`, { data: { thresholdPrice: -1 } })).status(),
  ).toBe(400);
  expect((await request.delete(`/api/alerts/${alert.id}`)).ok()).toBeTruthy();
  expect(await (await request.get('/api/alerts')).json()).toEqual([]);
  expect((await request.post('/api/alerts', { data: {} })).status()).toBe(400);
  await other.dispose();
});

test('invalid search parameters return validation errors rather than crashing', async ({
  request,
}) => {
  for (const path of [
    '/api/hotels?destination=a&destination=b&checkIn=2026-12-01&checkOut=2026-12-02',
    '/api/hotels?destination=London&checkIn=2026-12-02&checkOut=2026-12-01',
    '/api/hotels?destination=London&checkIn=2026-12-01&checkOut=2026-12-02&adults=-1',
    '/api/flights?from=SFO&to=JFK&date=2026-02-30',
    '/api/locations?q=a&q=b',
  ])
    expect((await request.get(path)).status(), path).toBe(400);
  const response = await request.get(
    '/api/hotels?destination=London&checkIn=2026-12-01&checkOut=2026-12-04&rooms=2',
  );
  const result = await response.json();
  expect(result.mock).toBe(true);
  expect(result.data.length).toBeGreaterThan(0);
  for (const hotel of result.data) expect(hotel.totalPrice).toBe(hotel.pricePerNight * 3 * 2);
});

test('flight results, currency selection, alert modal and trip persistence work', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.route('**/api/flights?*', (route) =>
    route.fulfill({ json: { success: true, data: [flight] }, headers: { 'X-Cache': 'HIT' } }),
  );
  await page.goto('/?from=SFO&to=JFK&date=2026-12-01');
  await expect(page.getByText('Test Air', { exact: true })).toBeVisible();
  await expect(page.getByText('Cached', { exact: false }).first()).toBeVisible();
  await page.getByRole('button', { name: 'Set Price Alert' }).click();
  await expect(page.getByText('Threshold Price (USD)')).toBeVisible();
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Save Alert', exact: true })).not.toBeVisible();
  page.on('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Save to Trip', exact: false }).click();
  await page.getByRole('link', { name: 'Trips', exact: true }).click();
  await expect(page.getByText('My Trip', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText('My Trip', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Delete', exact: true }).click();
  await expect(page.getByText('No trips saved yet.', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'Currency: US Dollar. Change currency' }).click();
  await page.getByRole('option').filter({ hasText: 'Euro' }).click();
  await expect(page.getByRole('button', { name: 'Currency: Euro. Change currency' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('autocomplete IDs are unique, URL values display, typing and swaps update search', async ({
  page,
}) => {
  await page.goto('/?from=SFO&to=JFK&date=2026-12-01');
  const inputs = page.getByRole('combobox');
  expect(await inputs.nth(0).getAttribute('id')).not.toBe(await inputs.nth(1).getAttribute('id'));
  await expect(inputs.nth(0)).toHaveValue('SFO');
  await expect(inputs.nth(1)).toHaveValue('JFK');
  await page.getByRole('button', { name: 'Swap', exact: false }).click();
  await expect(inputs.nth(0)).toHaveValue('JFK');
  await expect(inputs.nth(1)).toHaveValue('SFO');
  await inputs.nth(0).fill('LHR');
  await expect(page).toHaveURL(/from=LHR/);
});

test('flexible hotel dates use the calendar endpoint and selected dates show prices', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/hotels?destination=London&checkIn=2026-12-01&checkOut=2026-12-04');
  await expect(
    page.getByText('Shangri-La The Shard, London', { exact: true }).first(),
  ).toBeVisible();
  await page.getByRole('checkbox', { name: 'Flexible', exact: false }).check();
  await page.getByRole('button', { name: 'Search Stays', exact: false }).click();
  await expect(page.getByText('Illustrative price calendar', { exact: false })).toBeVisible();
  await page.locator('.price-calendar .cursor-pointer').first().click();
  await expect(page.getByText('Selected Date', { exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test('currency and theme controls work when browser storage is blocked', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => {
      throw new DOMException('Blocked', 'SecurityError');
    };
    Storage.prototype.setItem = () => {
      throw new DOMException('Blocked', 'SecurityError');
    };
  });
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await page.getByRole('button', { name: 'Currency: US Dollar. Change currency' }).click();
  await page.getByRole('option').filter({ hasText: 'Euro' }).click();
  await expect(page.getByRole('button', { name: 'Currency: Euro. Change currency' })).toBeVisible();
  await page.getByRole('button', { name: 'Theme: Device. Change theme' }).click();
  await page.getByRole('button', { name: 'Dark theme', exact: true }).click();
  await expect(page.locator('html')).toHaveClass(/dark/);
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.emulateMedia({ colorScheme: 'light' });
  await expect(page.locator('html')).toHaveClass(/dark/);
  expect(errors).toEqual([]);
});

test('mobile filter dialog opens, traps focus, closes and restores scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Filters', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Filters', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Close filters' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  expect(await page.evaluate(() => document.body.style.overflow)).toBe('');
});

test('dates preserve the selected day in a western timezone', async ({ browser }) => {
  const context = await browser.newContext({ timezoneId: 'America/Los_Angeles' });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:3100/?from=SFO&to=JFK&date=2026-12-01');
  await expect(page.getByText('Tue, Dec 1, 2026', { exact: true })).toBeVisible();
  await context.close();
});

test('single-point history charts produce finite SVG coordinates', async ({ page }) => {
  await page.route('**/api/flights?*', (route) =>
    route.fulfill({ json: { success: true, data: [flight] } }),
  );
  await page.route('**/api/flights-history?*', (route) =>
    route.fulfill({
      json: {
        points: [{ date: '2026-11-01', price: 250 }],
        minPrice: 250,
        maxPrice: 250,
        averagePrice: 250,
        volatility: 0,
        trend: 'stable',
        prediction: 'Sample',
      },
    }),
  );
  await page.goto('/?from=SFO&to=JFK&date=2026-12-01');
  await expect(page.locator('.price-history-chart polyline')).toHaveAttribute('points', '10,50');
  expect(await page.locator('.price-history-chart').innerHTML()).not.toMatch(/NaN|Infinity/);
});

test('cache keys preserve case-sensitive identifiers and escape delimiters', async () => {
  const { cacheKey } = await import('../server/utils/cache');
  expect(cacheKey('hotels', { destination: 'tokenA' })).not.toBe(
    cacheKey('hotels', { destination: 'tokena' }),
  );
  expect(cacheKey('hotels', { destination: 'a&rooms=2' })).not.toBe(
    cacheKey('hotels', { destination: 'a', rooms: 2 }),
  );
  expect(cacheKey('hotels', { rooms: 2, destination: 'a' })).toBe(
    cacheKey('hotels', { destination: 'a', rooms: 2 }),
  );
});
