// ============================================
// RLDX Waitlist QA — Shared Test Helpers
// ============================================
const { expect } = require('@playwright/test');

const BASE_URL = '/index.html';

// Supabase config (matches index.html)
const SUPABASE_URL = 'https://fycshjlwrwwdbxwjnoqi.supabase.co';

// ============================================
// Selectors
// ============================================
const SEL = {
  form: '#waitlistForm',
  successMessage: '#successMessage',
  submitBtn: 'button[type="submit"]',
  toast: '#toast',

  // Text inputs
  fullName: '#fullName',
  email: '#email',
  organization: '#organization',
  country: '#country',
  socialProfile: '#socialProfile',
  honeypot: 'input[name="website"]',

  // Radio groups (use name attribute)
  affiliation: 'input[name="affiliation"]',
  academicRole: 'input[name="academicRole"]',
  industryRole: 'input[name="industryRole"]',
  startupRole: 'input[name="startupRole"]',
  robotAccess: 'input[name="robotAccess"]',
  simAccess: 'input[name="simAccess"]',
  shareWilling: 'input[name="shareWilling"]',
  eventAttendance: 'input[name="eventAttendance"]',
  referralSource: 'input[name="referralSource"]',

  // Checkbox groups
  communities: 'input[name="communities"]',
  industry: 'input[name="industry"]',
  robotType: 'input[name="robotType"]',
  robotBrand: 'input[name="robotBrand"]',
  useCase: 'input[name="useCase"]',
  applications: 'input[name="applications"]',
  shareType: 'input[name="shareType"]',

  // Specific checkboxes/radios with IDs
  communitiesNone: '#communitiesNoneCheckbox',
  communitiesOther: '#communitiesOtherCheckbox',
  useCaseExplore: '#useCaseExploreCheckbox',
  applicationsOther: '#applicationsOtherCheckbox',
  industryOther: '#industryOtherCheckbox',
  robotTypeOther: '#robotTypeOtherCheckbox',
  robotBrandOther: '#robotBrandOtherCheckbox',
  affiliationOtherRadio: '#affiliationOtherRadio',
  startupRoleOtherRadio: '#startupRoleOtherRadio',
  referralSourceOtherRadio: '#referralSourceOtherRadio',

  // Conditional fields (container divs)
  academicRoleField: '#academicRoleField',
  industryRoleField: '#industryRoleField',
  industryField: '#industryField',
  startupRoleField: '#startupRoleField',
  affiliationOtherField: '#affiliationOtherField',
  startupRoleOtherField: '#startupRoleOtherField',
  communitiesOtherField: '#communitiesOtherField',
  robotTypeField: '#robotTypeField',
  robotBrandField: '#robotBrandField',
  robotTypeOtherField: '#robotTypeOtherField',
  robotBrandOtherField: '#robotBrandOtherField',
  applicationsOtherField: '#applicationsOtherField',
  shareTypeField: '#shareTypeField',
  referralSourceOtherField: '#referralSourceOtherField',
  industryOtherField: '#industryOtherField',

  // Other text inputs (inside conditional fields)
  affiliationOtherInput: '#affiliationOtherField input[name="affiliationOther"]',
  startupRoleOtherInput: '#startupRoleOtherField input[name="startupRoleOther"]',
  referralSourceOtherInput: '#referralSourceOtherField input[name="referralSourceOther"]',
  communitiesOtherInput: '#communitiesOtherField input[name="communitiesOther"]',
  industryOtherInput: '#industryOtherField input[name="industryOther"]',
  robotTypeOtherInput: '#robotTypeOtherField input[name="robotTypeOther"]',
  robotBrandOtherInput: '#robotBrandOtherField input[name="robotBrandOther"]',
  applicationsOtherInput: '#applicationsOtherField input[name="applicationsOther"]',
};

// ============================================
// Navigation
// ============================================
async function goToForm(page) {
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector(SEL.form);
}

// ============================================
// Form Filling Helpers
// ============================================

/** Select a radio by name and value */
async function selectRadio(page, name, value) {
  await page.click(`input[name="${name}"][value="${value}"]`);
}

/** Check a checkbox by name and value */
async function checkBox(page, name, value) {
  const cb = page.locator(`input[name="${name}"][value="${value}"]`);
  if (!(await cb.isChecked())) {
    await cb.click();
  }
}

/** Uncheck a checkbox by name and value */
async function uncheckBox(page, name, value) {
  const cb = page.locator(`input[name="${name}"][value="${value}"]`);
  if (await cb.isChecked()) {
    await cb.click();
  }
}

/**
 * Fill the minimum required fields for a valid submission.
 * Uses "investor" affiliation (no sub-questions), "interested" robot access (no sub-questions),
 * to minimize conditional fields.
 */
async function fillMinimumRequired(page) {
  await page.fill(SEL.fullName, 'Test User');
  await page.fill(SEL.email, 'test@example.com');
  await page.fill(SEL.organization, 'Test Org');
  await page.selectOption(SEL.country, 'US');
  await selectRadio(page, 'affiliation', 'investor');
  await selectRadio(page, 'robotAccess', 'interested');
  await selectRadio(page, 'simAccess', 'no');
  await checkBox(page, 'useCase', 'explore');
  await checkBox(page, 'applications', 'bin_picking');
  await selectRadio(page, 'shareWilling', 'no');
  await selectRadio(page, 'eventAttendance', 'no');
  await selectRadio(page, 'referralSource', 'social');
}

/**
 * Fill all required fields with maximum data:
 * - affiliation=industry with all sub-fields
 * - robotAccess=own with all types/brands
 * - all communities, all useCases, all applications
 */
async function fillMaximumValid(page) {
  await page.fill(SEL.fullName, 'Test User Maximum');
  await page.fill(SEL.email, 'max@example.com');
  await page.fill(SEL.organization, 'Max Corp');
  await page.selectOption(SEL.country, 'KR');
  await page.fill(SEL.socialProfile, 'https://x.com/testuser');

  // Affiliation = industry
  await selectRadio(page, 'affiliation', 'industry');
  await selectRadio(page, 'industryRole', 'rd');
  // Check all industry checkboxes
  const industryValues = ['manufacturing', 'logistics', 'food', 'healthcare', 'retail', 'automotive', 'electronics', 'aerospace', 'agriculture', 'construction', 'other'];
  for (const v of industryValues) await checkBox(page, 'industry', v);
  await page.fill(SEL.industryOtherInput, 'Robotics');

  // Communities
  const commValues = ['openarm', 'lerobot', 'huggingface', 'ros', 'pai_social', 'other'];
  for (const v of commValues) await checkBox(page, 'communities', v);
  await page.fill(SEL.communitiesOtherInput, 'Custom Community');

  // Robot access = own
  await selectRadio(page, 'robotAccess', 'own');
  const rtValues = ['humanoid', 'bimanual', 'single_arm', 'mobile', 'dexterous_hand', 'other'];
  for (const v of rtValues) await checkBox(page, 'robotType', v);
  await page.fill(SEL.robotTypeOtherInput, 'Custom Robot');
  const rbValues = ['aloha', 'franka', 'kuka', 'ur', 'unitree', 'fourier', 'agilex', 'trossen', 'lerobot_so100', 'rlwrld', 'custom', 'other'];
  for (const v of rbValues) await checkBox(page, 'robotBrand', v);
  await page.fill(SEL.robotBrandOtherInput, 'Custom Brand');

  // Sim access
  await selectRadio(page, 'simAccess', 'rtx4080_plus');

  // Use cases (all except explore)
  const ucValues = ['benchmark', 'finetune', 'integrate', 'deploy', 'prototype', 'hobby'];
  for (const v of ucValues) await checkBox(page, 'useCase', v);

  // Applications (all + other)
  const appValues = ['bin_picking', 'assembly', 'packaging', 'tool_use', 'handover', 'cable', 'cloth', 'food', 'cleaning', 'door', 'writing', 'other'];
  for (const v of appValues) await checkBox(page, 'applications', v);
  await page.fill(SEL.applicationsOtherInput, 'Custom Task');

  // Share willing = yes + share type
  await selectRadio(page, 'shareWilling', 'yes');
  await checkBox(page, 'shareType', 'content');
  await checkBox(page, 'shareType', 'testimonial');

  // Event & referral
  await selectRadio(page, 'eventAttendance', 'us_inperson');
  await selectRadio(page, 'referralSource', 'other');
  await page.fill(SEL.referralSourceOtherInput, 'A friend');
}

// ============================================
// Assertion Helpers
// ============================================

/** Check if a conditional field is visible */
async function isVisible(page, selector) {
  return page.locator(selector).evaluate(el => {
    return el.classList.contains('visible') || window.getComputedStyle(el).display !== 'none';
  });
}

/** Check if a conditional-field has .visible class */
async function hasVisibleClass(page, selector) {
  return page.locator(selector).evaluate(el => el.classList.contains('visible'));
}

/** Get all error messages on the page */
async function getErrors(page) {
  return page.$$eval('.error-message', els => els.map(el => el.textContent));
}

/** Get error message count */
async function getErrorCount(page) {
  return page.$$eval('.error-message', els => els.length);
}

/** Check if a specific form-group has error */
async function hasError(page, selector) {
  const group = page.locator(selector).locator('xpath=ancestor-or-self::*[contains(@class,"form-group") or contains(@class,"conditional-field")]').first();
  return group.evaluate(el => el.classList.contains('has-error'));
}

/** Submit and wait for response or errors */
async function submitForm(page) {
  await page.click(SEL.submitBtn);
}

/** Submit and wait for errors to appear */
async function submitAndExpectErrors(page) {
  await submitForm(page);
  await page.waitForSelector('.error-message', { timeout: 3000 });
}

/** Click submit and wait for network/success */
async function submitAndWaitSuccess(page) {
  await submitForm(page);
  await page.waitForSelector(`${SEL.successMessage}.visible`, { timeout: 10000 });
}

// ============================================
// Network Interception
// ============================================

/**
 * Set up Supabase request interception.
 * Returns object with captured requests and a way to set custom responses.
 */
function setupSupabaseIntercept(page, options = {}) {
  const { status = 200, delay = 0 } = options;
  const captured = { requests: [], bodies: [] };

  page.route('**/rest/v1/waitlist', async (route) => {
    const request = route.request();
    captured.requests.push(request);
    try {
      const body = request.postDataJSON();
      captured.bodies.push(body);
    } catch (e) {
      captured.bodies.push(null);
    }

    if (delay > 0) await new Promise(r => setTimeout(r, delay));

    await route.fulfill({
      status,
      contentType: 'application/json',
      body: '',
    });
  });

  return captured;
}

/** Intercept Supabase and return 409 (duplicate) */
function setupSupabase409(page) {
  return setupSupabaseIntercept(page, { status: 409 });
}

/** Intercept Supabase and return 500 (server error) */
function setupSupabase500(page) {
  return setupSupabaseIntercept(page, { status: 500 });
}

/** Block Supabase requests (simulate network error) */
function setupSupabaseNetworkError(page) {
  const captured = { requests: [] };
  page.route('**/rest/v1/waitlist', async (route) => {
    captured.requests.push(route.request());
    await route.abort('failed');
  });
  return captured;
}

// ============================================
// Toast Helpers
// ============================================

async function waitForToast(page, type) {
  await page.waitForSelector(`.toast.toast-${type}.toast-visible`, { timeout: 5000 });
}

async function getToastText(page) {
  return page.locator(SEL.toast).textContent();
}

async function isToastVisible(page) {
  return page.locator(SEL.toast).evaluate(el => el.classList.contains('toast-visible'));
}

// ============================================
// Exports
// ============================================
module.exports = {
  BASE_URL,
  SUPABASE_URL,
  SEL,
  goToForm,
  selectRadio,
  checkBox,
  uncheckBox,
  fillMinimumRequired,
  fillMaximumValid,
  isVisible,
  hasVisibleClass,
  getErrors,
  getErrorCount,
  hasError,
  submitForm,
  submitAndExpectErrors,
  submitAndWaitSuccess,
  setupSupabaseIntercept,
  setupSupabase409,
  setupSupabase500,
  setupSupabaseNetworkError,
  waitForToast,
  getToastText,
  isToastVisible,
};
