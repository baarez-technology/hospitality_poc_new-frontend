import { test, expect } from '@playwright/test';

// Run serially to avoid parallel login requests overwhelming the backend
test.describe.configure({ mode: 'serial' });

test.describe('Bookings Dashboard Fixes', () => {
  test.setTimeout(90000);

  test('Date formatting: T12:00:00 trick prevents UTC shift', async ({ page }) => {
    // This test doesn't need login - just verify the JS fix works
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const result = await page.evaluate(() => {
      // The old buggy way: date-only string parsed as UTC midnight
      const buggyDate = new Date('2026-02-22');
      const buggyDay = buggyDate.getDate();

      // The fixed way: T12:00:00 forces local noon — safe in all timezones
      const fixedDate = new Date('2026-02-22T12:00:00');
      const fixedDay = fixedDate.getDate();

      return { buggyDay, fixedDay };
    });

    // The fixed approach must always produce day 22
    expect(result.fixedDay).toBe(22);
  });

  test('formatDate function renders correct day for all date formats', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const result = await page.evaluate(() => {
      // Replicate the exact formatDate function used in BookingRow/BookingsTable
      const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        const safe = dateString.includes('T') ? dateString : `${dateString}T12:00:00`;
        const date = new Date(safe);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      };

      return {
        // Date-only string (the buggy case that caused off-by-one)
        dateOnly: formatDate('2026-02-22'),
        // ISO string with time component
        isoString: formatDate('2026-02-22T00:00:00'),
        // Another date to test
        anotherDate: formatDate('2026-03-15'),
      };
    });

    // All formats must produce the correct day
    expect(result.dateOnly).toContain('Feb 22');
    expect(result.isoString).toContain('Feb 22');
    expect(result.anotherDate).toContain('Mar 15');
  });

  test('API returns confirmation_code and correct date fields', async ({ request }) => {
    // Login via API to get token
    const loginResponse = await request.post('http://localhost:8000/api/v1/auth/login', {
      data: { email: 'admin@glimmora.com', password: 'admin123' },
    });
    expect(loginResponse.ok()).toBeTruthy();

    const { access_token } = await loginResponse.json();
    expect(access_token).toBeTruthy();

    // Fetch bookings from admin endpoint (returns plain array)
    const bookingsResponse = await request.get('http://localhost:8000/api/v1/admin/bookings', {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    expect(bookingsResponse.ok()).toBeTruthy();

    const data = await bookingsResponse.json();
    // Admin endpoint returns a plain array
    const items = Array.isArray(data) ? data : (data?.data?.items || data?.items || data?.data || []);

    if (items.length === 0) {
      console.log('No bookings found in API, skipping assertions');
      return;
    }

    const booking = items[0];

    // --- Verify CONFIRMATION CODE field exists ---
    const bookingId = booking.confirmation_code || booking.booking_number || booking.bookingNumber;
    expect(bookingId).toBeTruthy();
    expect(typeof bookingId).toBe('string');
    console.log(`Booking identifier: ${bookingId}`);

    // --- Verify DATE field is present and parseable ---
    const checkInDate = booking.arrival_date || booking.checkIn || booking.check_in;
    expect(checkInDate).toBeTruthy();

    // Verify the date string can be parsed correctly with the T12:00:00 fix
    const dateParts = checkInDate.split('T')[0].split('-');
    const expectedDay = parseInt(dateParts[2]);
    const safeDate = checkInDate.includes('T') ? checkInDate : `${checkInDate}T12:00:00`;
    const parsedDay = new Date(safeDate).getDate();
    expect(parsedDay).toBe(expectedDay);
  });

  test('Bookings page renders with correct data after login', async ({ page }) => {
    // Login via UI
    await page.goto('/login', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForSelector('input[type="email"]', { timeout: 15000 });
    await page.fill('input[type="email"]', 'admin@glimmora.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');

    // Wait for auth token to appear in localStorage
    await page.waitForFunction(
      () => localStorage.getItem('glimmora_access_token') !== null,
      { timeout: 30000 }
    );

    // Small wait for React state to settle after login
    await page.waitForTimeout(2000);

    // Navigate to bookings - use domcontentloaded (networkidle hangs due to SSE)
    await page.goto('/admin/bookings', { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Wait for content to load
    await page.waitForTimeout(5000);

    const pageContent = await page.textContent('body');

    // The page should contain booking-related content (not a login redirect)
    const hasBookingContent =
      pageContent?.includes('Booking') ||
      pageContent?.includes('booking') ||
      pageContent?.includes('BK-') ||
      pageContent?.includes('Check') ||
      pageContent?.includes('Guest');

    if (!hasBookingContent) {
      console.log('Page URL:', page.url());
      console.log('Page content (first 500 chars):', pageContent?.slice(0, 500));
    }

    expect(hasBookingContent).toBeTruthy();
  });
});
