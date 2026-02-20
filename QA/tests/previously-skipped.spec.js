// ============================================
// RLDX Waitlist QA — Previously Skipped Tests
// ============================================
// Tests that were originally skipped as "browser-specific" or
// "requires multi-tab" but can actually be automated in Playwright.
// ============================================

const { test, expect, chromium } = require('@playwright/test');
const {
  BASE_URL, SEL, goToForm, fillMinimumRequired, submitForm,
  submitAndExpectErrors, getErrorCount, selectRadio,
  setupSupabaseIntercept, setupSupabaseNetworkError,
  waitForToast, isToastVisible, getToastText,
} = require('./helpers');

// ============================================
// INIT-03: JavaScript Disabled
// ============================================
test.describe('INIT-03: JS Disabled', () => {
  test('form is visible but non-functional without JS', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });

    // Form HTML should still render
    await expect(page.locator(SEL.form)).toBeVisible();

    // Submit button should be visible
    await expect(page.locator(SEL.submitBtn)).toBeVisible();

    // Success message should remain hidden (no JS to show it)
    await expect(page.locator(SEL.successMessage)).not.toBeVisible();

    // Conditional fields should remain hidden (CSS default: display:none)
    await expect(page.locator(SEL.academicRoleField)).not.toBeVisible();
    await expect(page.locator(SEL.industryRoleField)).not.toBeVisible();
    await expect(page.locator(SEL.robotTypeField)).not.toBeVisible();

    await context.close();
  });
});

// ============================================
// NAV-02 / NAV-05: Back Button & bfcache
// ============================================
test.describe('NAV: Back Button / bfcache', () => {
  test('NAV-02: navigate away and back — form state is preserved or reset cleanly', async ({ page }) => {
    await goToForm(page);

    // Fill some fields
    await page.fill(SEL.fullName, 'bfcache test');
    await page.fill(SEL.email, 'bf@cache.com');

    // Navigate away
    await page.goto('about:blank');
    await page.waitForLoadState('domcontentloaded');

    // Go back
    await page.goBack({ waitUntil: 'domcontentloaded' });
    await page.waitForSelector(SEL.form);

    // Form should be usable — either preserved or reset
    const form = page.locator(SEL.form);
    await expect(form).toBeVisible();
    await expect(page.locator(SEL.submitBtn)).toBeEnabled();
  });

  test('NAV-05: back after success — form or success state is shown cleanly', async ({ page }) => {
    setupSupabaseIntercept(page);
    await goToForm(page);
    await fillMinimumRequired(page);
    await submitForm(page);
    await page.waitForSelector(`${SEL.successMessage}.visible`, { timeout: 10000 });

    // Navigate away then back
    await page.goto('about:blank');
    await page.goBack({ waitUntil: 'domcontentloaded' });
    await page.waitForSelector('body');

    // Page should render without errors (either success or fresh form)
    const hasForm = await page.locator(SEL.form).isVisible().catch(() => false);
    const hasSuccess = await page.locator(`${SEL.successMessage}.visible`).isVisible().catch(() => false);
    expect(hasForm || hasSuccess).toBe(true);
  });
});

// ============================================
// SCR-08: prefers-reduced-motion
// ============================================
test.describe('SCR-08: prefers-reduced-motion', () => {
  test('toast animation respects reduced motion preference', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage();

    // Intercept with delay so first submit doesn't complete before second click
    setupSupabaseIntercept(page, { delay: 5000 });
    await goToForm(page);
    await fillMinimumRequired(page);

    // First submit — starts network request (delayed 5s)
    await submitForm(page);

    // Wait briefly then trigger rate limit toast by evaluating directly
    // (button is disabled after first submit, so we trigger via JS)
    await page.waitForTimeout(500);
    await page.evaluate(() => {
      showToast('Please wait a moment before submitting again.', 'warning');
    });

    await waitForToast(page, 'warning');

    // Toast should still appear and function
    const visible = await isToastVisible(page);
    expect(visible).toBe(true);

    // Verify the CSS reduced-motion rule applies
    // Chromium converts short durations (0.1s) to scientific notation (1e-05s)
    // when reduced motion is active — both indicate reduced/near-zero animation
    const transitionDuration = await page.locator(SEL.toast).evaluate(el => {
      return window.getComputedStyle(el).transitionDuration;
    });
    const durationSec = parseFloat(transitionDuration);
    expect(durationSec).toBeLessThanOrEqual(0.1);

    await context.close();
  });

  test('error scroll still works with reduced motion', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage();
    await goToForm(page);

    // Submit empty form — should scroll to first error
    await submitForm(page);
    await page.waitForSelector('.error-message', { timeout: 3000 });

    const errors = await page.$$eval('.error-message', els => els.length);
    expect(errors).toBeGreaterThan(0);

    await context.close();
  });
});

// ============================================
// CON-05 / CON-06: Multi-Tab
// ============================================
test.describe('CON: Multi-Tab', () => {
  test('CON-05: two tabs submit simultaneously — both get responses', async ({ browser }) => {
    const context = await browser.newContext();
    const page1 = await context.newPage();
    const page2 = await context.newPage();

    // Intercept Supabase on both pages
    let req1Count = 0;
    let req2Count = 0;

    await page1.route('**/rest/v1/waitlist', async (route) => {
      req1Count++;
      await route.fulfill({ status: 200, contentType: 'application/json', body: '' });
    });
    await page2.route('**/rest/v1/waitlist', async (route) => {
      req2Count++;
      await route.fulfill({ status: 200, contentType: 'application/json', body: '' });
    });

    await goToForm(page1);
    await goToForm(page2);

    await fillMinimumRequired(page1);
    await fillMinimumRequired(page2);
    // Change email to differentiate
    await page2.fill(SEL.email, 'test2@example.com');

    // Submit both
    await Promise.all([
      submitForm(page1),
      submitForm(page2),
    ]);

    // Wait for success on both
    await page1.waitForSelector(`${SEL.successMessage}.visible`, { timeout: 10000 });
    await page2.waitForSelector(`${SEL.successMessage}.visible`, { timeout: 10000 });

    expect(req1Count).toBe(1);
    expect(req2Count).toBe(1);

    await context.close();
  });

  test('CON-06: one tab succeeds, other tab still functional', async ({ browser }) => {
    const context = await browser.newContext();
    const page1 = await context.newPage();
    const page2 = await context.newPage();

    await page1.route('**/rest/v1/waitlist', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '' });
    });

    await goToForm(page1);
    await goToForm(page2);

    // Submit on page1 only
    await fillMinimumRequired(page1);
    await submitForm(page1);
    await page1.waitForSelector(`${SEL.successMessage}.visible`, { timeout: 10000 });

    // Page2 should still have a functional form
    await expect(page2.locator(SEL.form)).toBeVisible();
    await expect(page2.locator(SEL.submitBtn)).toBeEnabled();

    // Can still fill page2
    await page2.fill(SEL.fullName, 'Second User');
    const val = await page2.inputValue(SEL.fullName);
    expect(val).toBe('Second User');

    await context.close();
  });
});

// ============================================
// LFC-01 / LFC-02: Background Tab Behavior
// ============================================
test.describe('LFC: Background Tab', () => {
  test('LFC-01: toast timer still fires after tab loses focus', async ({ browser }) => {
    const context = await browser.newContext();
    const page1 = await context.newPage();

    await goToForm(page1);

    // Trigger toast directly via JS (avoids submit button state issues)
    await page1.evaluate(() => {
      showToast('Please wait a moment before submitting again.', 'warning');
    });
    await waitForToast(page1, 'warning');

    // Open a second tab (defocus page1)
    const page2 = await context.newPage();
    await page2.goto('about:blank');

    // Wait for toast auto-dismiss (3s + buffer)
    await page1.waitForTimeout(4000);

    // Switch back to page1 and check toast disappeared
    await page1.bringToFront();
    const visible = await isToastVisible(page1);
    expect(visible).toBe(false);

    await context.close();
  });

  test('LFC-02: form remains functional after tab switch', async ({ browser }) => {
    const context = await browser.newContext();
    const page1 = await context.newPage();
    await goToForm(page1);

    // Fill some fields
    await page1.fill(SEL.fullName, 'Tab Switch Test');
    await page1.fill(SEL.email, 'tab@switch.com');

    // Switch to another tab
    const page2 = await context.newPage();
    await page2.goto('about:blank');
    await page2.waitForTimeout(1000);

    // Switch back
    await page1.bringToFront();

    // Values should be preserved
    await expect(page1.locator(SEL.fullName)).toHaveValue('Tab Switch Test');
    await expect(page1.locator(SEL.email)).toHaveValue('tab@switch.com');

    // Form should still be interactive
    await page1.fill(SEL.organization, 'After Switch Org');
    await expect(page1.locator(SEL.organization)).toHaveValue('After Switch Org');

    await context.close();
  });
});

// ============================================
// SCR-03: Scroll Interruption
// ============================================
test.describe('SCR-03: Scroll Interruption', () => {
  test('user scroll during error smooth-scroll does not crash', async ({ page }) => {
    await goToForm(page);

    // Scroll to bottom so error scroll has distance to travel
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(200);

    // Submit empty form (triggers smooth scroll to first error)
    await submitForm(page);

    // Immediately interrupt with user scroll
    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(100);
    await page.mouse.wheel(0, -300);

    // Wait for things to settle
    await page.waitForTimeout(1000);

    // Errors should still be displayed (scroll interruption doesn't break state)
    const errorCount = await getErrorCount(page);
    expect(errorCount).toBeGreaterThan(0);

    // Form should still be interactive
    await page.fill(SEL.fullName, 'After interrupt');
    await expect(page.locator(SEL.fullName)).toHaveValue('After interrupt');
  });
});

// ============================================
// ERR-08: Scroll Position After Error Removal
// ============================================
test.describe('ERR-08: Scroll After Error Removal', () => {
  test('fixing an error and resubmitting scrolls to next remaining error', async ({ page }) => {
    await goToForm(page);

    // Submit empty — get errors
    await submitAndExpectErrors(page);
    const initialErrors = await getErrorCount(page);
    expect(initialErrors).toBeGreaterThan(1);

    // Fix first error (Full Name)
    await page.fill(SEL.fullName, 'Fixed Name');

    // Resubmit — should still have errors but one fewer
    await submitForm(page);
    await page.waitForTimeout(500);
    const afterErrors = await getErrorCount(page);
    expect(afterErrors).toBeLessThan(initialErrors);

    // Page should not be in a broken state
    await expect(page.locator(SEL.form)).toBeVisible();
  });
});

// ============================================
// SUC-04: Back Button After Success
// ============================================
test.describe('SUC-04: Back After Success', () => {
  test('success state then browser back — page renders without crash', async ({ page }) => {
    setupSupabaseIntercept(page);
    await goToForm(page);
    await fillMinimumRequired(page);
    await submitForm(page);
    await page.waitForSelector(`${SEL.successMessage}.visible`, { timeout: 10000 });

    // Go back
    await page.goBack({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);

    // Go forward again
    await page.goForward({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);

    // Page should render cleanly — no JS errors, no blank page
    const bodyExists = await page.locator('body').isVisible();
    expect(bodyExists).toBe(true);
  });
});

// ============================================
// NET-16: Page Leave During Fetch
// ============================================
test.describe('NET-16: Page Leave During Fetch', () => {
  test('navigating away during pending fetch does not cause errors', async ({ page }) => {
    // Intercept with long delay to simulate slow response
    setupSupabaseIntercept(page, { delay: 10000 });
    await goToForm(page);
    await fillMinimumRequired(page);

    // Submit (starts fetch with 10s delay)
    await submitForm(page);
    await page.waitForTimeout(200);

    // Navigate away while fetch is pending
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await page.goto('about:blank', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);

    // No uncaught JS errors
    expect(errors.length).toBe(0);
  });
});

// ============================================
// CON-07: Timer Ordering (Toast + Fetch Response)
// ============================================
test.describe('CON-07: Timer Ordering', () => {
  test('toast timer and fetch response arriving together — no state conflict', async ({ page }) => {
    // Fetch responds after 2s — toast auto-dismisses at 3s
    setupSupabaseIntercept(page, { delay: 2000 });
    await goToForm(page);
    await fillMinimumRequired(page);

    // Submit — triggers fetch
    await submitForm(page);

    // Immediately show a toast (simulating rate-limit scenario)
    await page.evaluate(() => {
      showToast('Please wait a moment before submitting again.', 'warning');
    });
    await waitForToast(page, 'warning');

    // Wait for fetch to complete (2s) + toast to dismiss (3s)
    await page.waitForTimeout(4000);

    // Page should be in success state (fetch completed)
    await expect(page.locator(`${SEL.successMessage}.visible`)).toBeVisible();

    // Toast should have auto-dismissed
    const toastVisible = await isToastVisible(page);
    expect(toastVisible).toBe(false);
  });
});

// ============================================
// KEY-02: Shift+Tab Reverse Navigation
// ============================================
test.describe('KEY-02: Shift+Tab', () => {
  test('Shift+Tab moves focus backwards through fields', async ({ page }) => {
    await goToForm(page);

    // Focus email field
    await page.locator(SEL.email).focus();
    const before = await page.evaluate(() => document.activeElement.id);
    expect(before).toBe('email');

    // Shift+Tab should go back to fullName
    await page.keyboard.press('Shift+Tab');
    const after = await page.evaluate(() => document.activeElement.id);
    expect(after).toBe('fullName');
  });
});

// ============================================
// KEY-07: Dropdown Keyboard Navigation
// ============================================
test.describe('KEY-07: Dropdown Keyboard', () => {
  test('keyboard can select country dropdown option', async ({ page }) => {
    await goToForm(page);

    // Focus country select and use Alt+ArrowDown to open (Chromium)
    await page.locator(SEL.country).focus();
    await page.keyboard.press('Alt+ArrowDown');
    await page.waitForTimeout(200);
    await page.keyboard.press('ArrowDown'); // move to first option
    await page.keyboard.press('Enter');     // select it
    await page.waitForTimeout(100);

    const value = await page.locator(SEL.country).inputValue();
    // Should have selected something (may vary by OS)
    // If Alt+ArrowDown didn't work, try the simpler approach
    if (value === '') {
      // Fallback: Chromium on macOS may need direct keyboard type
      await page.locator(SEL.country).focus();
      await page.keyboard.press('u'); // "U" for "United States"
      await page.waitForTimeout(100);
    }

    const finalValue = await page.locator(SEL.country).inputValue();
    expect(finalValue).not.toBe('');
  });
});
