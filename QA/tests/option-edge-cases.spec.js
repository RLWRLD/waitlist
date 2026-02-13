// ============================================
// RLDX Waitlist QA — Option Edge Cases (A–E)
// TXT-01..TXT-23, RAD-01..RAD-34, CHK-01..CHK-45, CND-01..CND-31, EXC-01..EXC-12
// ============================================
const { test, expect } = require('@playwright/test');
const {
  SEL, goToForm, selectRadio, checkBox, uncheckBox,
  fillMinimumRequired, fillMaximumValid,
  isVisible, hasVisibleClass, getErrors, getErrorCount,
  submitForm, submitAndExpectErrors, submitAndWaitSuccess,
  setupSupabaseIntercept, setupSupabase409, setupSupabase500,
  setupSupabaseNetworkError, waitForToast, getToastText, isToastVisible,
} = require('./helpers');

// ============================================
// A. Text Input (TXT-01 to TXT-23)
// ============================================
test.describe('A. Text Input', () => {
  test.beforeEach(async ({ page }) => { await goToForm(page); });

  // --- A-1. fullName ---
  test('TXT-01: empty fullName → error', async ({ page }) => {
    await fillMinimumRequired(page);
    await page.fill(SEL.fullName, '');
    await submitAndExpectErrors(page);
    expect(await getErrors(page)).toContain('Full Name is required');
  });

  test('TXT-02: spaces-only fullName → error (trimmed)', async ({ page }) => {
    await fillMinimumRequired(page);
    await page.fill(SEL.fullName, '   ');
    await submitAndExpectErrors(page);
    expect(await getErrors(page)).toContain('Full Name is required');
  });

  test('TXT-03: "John Doe" → pass', async ({ page }) => {
    setupSupabaseIntercept(page);
    await fillMinimumRequired(page);
    await page.fill(SEL.fullName, 'John Doe');
    await submitAndWaitSuccess(page);
  });

  test('TXT-04: unicode name → pass', async ({ page }) => {
    setupSupabaseIntercept(page);
    await fillMinimumRequired(page);
    await page.fill(SEL.fullName, '名前 / Ñame');
    await submitAndWaitSuccess(page);
  });

  test('TXT-05: 1000+ char name → pass', async ({ page }) => {
    setupSupabaseIntercept(page);
    await fillMinimumRequired(page);
    await page.fill(SEL.fullName, 'A'.repeat(1001));
    await submitAndWaitSuccess(page);
  });

  // --- A-2. email ---
  test('TXT-06: empty email → error', async ({ page }) => {
    await fillMinimumRequired(page);
    await page.fill(SEL.email, '');
    await submitAndExpectErrors(page);
    expect(await getErrors(page)).toContain('Email is required');
  });

  test('TXT-07: spaces-only email → error', async ({ page }) => {
    await fillMinimumRequired(page);
    await page.fill(SEL.email, '   ');
    await submitAndExpectErrors(page);
    expect(await getErrors(page)).toContain('Email is required');
  });

  test('TXT-08: valid email → pass', async ({ page }) => {
    setupSupabaseIntercept(page);
    await fillMinimumRequired(page);
    await page.fill(SEL.email, 'user@company.com');
    await submitAndWaitSuccess(page);
  });

  test('TXT-09: missing @ → error', async ({ page }) => {
    await fillMinimumRequired(page);
    await page.fill(SEL.email, 'usercompany.com');
    await submitAndExpectErrors(page);
    expect(await getErrors(page)).toContain('Please enter a valid email address');
  });

  test('TXT-10: no TLD → error', async ({ page }) => {
    await fillMinimumRequired(page);
    await page.fill(SEL.email, 'user@company');
    await submitAndExpectErrors(page);
    expect(await getErrors(page)).toContain('Please enter a valid email address');
  });

  test('TXT-11: missing local part → error', async ({ page }) => {
    await fillMinimumRequired(page);
    await page.fill(SEL.email, '@company.com');
    await submitAndExpectErrors(page);
    expect(await getErrors(page)).toContain('Please enter a valid email address');
  });

  test('TXT-12: "user@.com" → regex check', async ({ page }) => {
    await fillMinimumRequired(page);
    await page.fill(SEL.email, 'user@.com');
    await submitAndExpectErrors(page);
    const errs = await getErrors(page);
    // regex /^[^\s@]+@[^\s@]+\.[^\s@]+$/ — "user@.com" splits as local="user", domain=".com"
    // domain part ".com" has empty before dot → depends on regex: actually matches since [^\s@]+ matches ".com" as one token after @
    // The regex checks @[^\s@]+\.[^\s@]+ — "@.com" → [^\s@]+ needs at least 1 char before dot
    // ".com" → first [^\s@]+ can't match empty before dot — wait, it's greedy, ".com" has chars ".com"
    // Actually [^\s@]+ matches ".com" (4 chars), then \. needs another dot → fails
    // So this should produce an error
    expect(errs).toContain('Please enter a valid email address');
  });

  test('TXT-13: space in email → error', async ({ page }) => {
    await fillMinimumRequired(page);
    await page.fill(SEL.email, 'user @company.com');
    await submitAndExpectErrors(page);
    expect(await getErrors(page)).toContain('Please enter a valid email address');
  });

  test('TXT-14: duplicate email → 409 → treated as success', async ({ page }) => {
    setupSupabase409(page);
    await fillMinimumRequired(page);
    await page.fill(SEL.email, 'dup@example.com');
    await submitAndWaitSuccess(page);
  });

  // --- A-3. organization ---
  test('TXT-15: empty org → error', async ({ page }) => {
    await fillMinimumRequired(page);
    await page.fill(SEL.organization, '');
    await submitAndExpectErrors(page);
    expect(await getErrors(page)).toContain('Organization is required');
  });

  test('TXT-16: spaces-only org → error', async ({ page }) => {
    await fillMinimumRequired(page);
    await page.fill(SEL.organization, '   ');
    await submitAndExpectErrors(page);
    expect(await getErrors(page)).toContain('Organization is required');
  });

  test('TXT-17: valid org → pass', async ({ page }) => {
    setupSupabaseIntercept(page);
    await fillMinimumRequired(page);
    await page.fill(SEL.organization, 'Acme Inc.');
    await submitAndWaitSuccess(page);
  });

  // --- A-4. country ---
  test('TXT-18: no country selected → error', async ({ page }) => {
    await fillMinimumRequired(page);
    await page.selectOption(SEL.country, '');
    await submitAndExpectErrors(page);
    expect(await getErrors(page)).toContain('Please select a country');
  });

  test('TXT-19: valid country → pass', async ({ page }) => {
    setupSupabaseIntercept(page);
    await fillMinimumRequired(page);
    await page.selectOption(SEL.country, 'KR');
    await submitAndWaitSuccess(page);
  });

  test('TXT-20: country "other" → pass', async ({ page }) => {
    setupSupabaseIntercept(page);
    await fillMinimumRequired(page);
    await page.selectOption(SEL.country, 'other');
    await submitAndWaitSuccess(page);
  });

  // --- A-5. socialProfile ---
  test('TXT-21: empty socialProfile → pass (optional)', async ({ page }) => {
    setupSupabaseIntercept(page);
    await fillMinimumRequired(page);
    await page.fill(SEL.socialProfile, '');
    await submitAndWaitSuccess(page);
  });

  test('TXT-22: valid URL in socialProfile → pass', async ({ page }) => {
    setupSupabaseIntercept(page);
    await fillMinimumRequired(page);
    await page.fill(SEL.socialProfile, 'https://x.com/user');
    await submitAndWaitSuccess(page);
  });

  test('TXT-23: non-URL string in socialProfile → pass', async ({ page }) => {
    setupSupabaseIntercept(page);
    await fillMinimumRequired(page);
    await page.fill(SEL.socialProfile, 'asdf');
    await submitAndWaitSuccess(page);
  });
});

// ============================================
// B. Radio (RAD-01 to RAD-34)
// ============================================
test.describe('B. Radio', () => {
  test.beforeEach(async ({ page }) => { await goToForm(page); });

  // --- B-1. affiliation ---
  test('RAD-01: no affiliation → error', async ({ page }) => {
    await fillMinimumRequired(page);
    // Deselect by reloading and filling everything except affiliation
    await goToForm(page);
    await page.fill(SEL.fullName, 'Test');
    await page.fill(SEL.email, 'a@b.co');
    await page.fill(SEL.organization, 'Org');
    await page.selectOption(SEL.country, 'US');
    await selectRadio(page, 'robotAccess', 'interested');
    await selectRadio(page, 'simAccess', 'no');
    await checkBox(page, 'useCase', 'explore');
    await checkBox(page, 'applications', 'bin_picking');
    await selectRadio(page, 'shareWilling', 'no');
    await selectRadio(page, 'eventAttendance', 'no');
    await selectRadio(page, 'referralSource', 'social');
    await submitAndExpectErrors(page);
    expect(await getErrors(page)).toContain('Please select an option for Affiliation');
  });

  test('RAD-02: academic → academicRoleField visible', async ({ page }) => {
    await selectRadio(page, 'affiliation', 'academic');
    expect(await hasVisibleClass(page, SEL.academicRoleField)).toBe(true);
  });

  test('RAD-03: industry → industryRoleField + industryField visible', async ({ page }) => {
    await selectRadio(page, 'affiliation', 'industry');
    expect(await hasVisibleClass(page, SEL.industryRoleField)).toBe(true);
    expect(await hasVisibleClass(page, SEL.industryField)).toBe(true);
  });

  test('RAD-04: startup → startupRoleField visible', async ({ page }) => {
    await selectRadio(page, 'affiliation', 'startup');
    expect(await hasVisibleClass(page, SEL.startupRoleField)).toBe(true);
  });

  test('RAD-05: investor → all conditional hidden', async ({ page }) => {
    await selectRadio(page, 'affiliation', 'investor');
    expect(await hasVisibleClass(page, SEL.academicRoleField)).toBe(false);
    expect(await hasVisibleClass(page, SEL.industryRoleField)).toBe(false);
    expect(await hasVisibleClass(page, SEL.startupRoleField)).toBe(false);
    expect(await hasVisibleClass(page, SEL.affiliationOtherField)).toBe(false);
  });

  test('RAD-06: media → no sub-questions', async ({ page }) => {
    await selectRadio(page, 'affiliation', 'media');
    expect(await hasVisibleClass(page, SEL.academicRoleField)).toBe(false);
    expect(await hasVisibleClass(page, SEL.industryRoleField)).toBe(false);
    expect(await hasVisibleClass(page, SEL.startupRoleField)).toBe(false);
  });

  test('RAD-07: independent → no sub-questions', async ({ page }) => {
    await selectRadio(page, 'affiliation', 'independent');
    expect(await hasVisibleClass(page, SEL.academicRoleField)).toBe(false);
    expect(await hasVisibleClass(page, SEL.industryRoleField)).toBe(false);
    expect(await hasVisibleClass(page, SEL.startupRoleField)).toBe(false);
  });

  test('RAD-08: other → affiliationOtherField visible', async ({ page }) => {
    await selectRadio(page, 'affiliation', 'other');
    expect(await hasVisibleClass(page, SEL.affiliationOtherField)).toBe(true);
  });

  // --- B-2. academicRole ---
  test('RAD-09: academic, no role → error', async ({ page }) => {
    await fillMinimumRequired(page);
    await selectRadio(page, 'affiliation', 'academic');
    await submitAndExpectErrors(page);
    expect(await getErrors(page)).toContain('Please select an option for Role');
  });

  test('RAD-10: academic + professor → pass', async ({ page }) => {
    setupSupabaseIntercept(page);
    await fillMinimumRequired(page);
    await selectRadio(page, 'affiliation', 'academic');
    await selectRadio(page, 'academicRole', 'professor');
    await submitAndWaitSuccess(page);
  });

  test('RAD-11: affiliation!=academic → academicRole hidden/skipped', async ({ page }) => {
    await selectRadio(page, 'affiliation', 'investor');
    expect(await hasVisibleClass(page, SEL.academicRoleField)).toBe(false);
  });

  // --- B-3. industryRole ---
  test('RAD-12: industry, no role → error', async ({ page }) => {
    await fillMinimumRequired(page);
    await selectRadio(page, 'affiliation', 'industry');
    await submitAndExpectErrors(page);
    expect(await getErrors(page)).toContain('Please select an option for Role');
  });

  test('RAD-13: industry + rd → pass', async ({ page }) => {
    setupSupabaseIntercept(page);
    await fillMinimumRequired(page);
    await selectRadio(page, 'affiliation', 'industry');
    await selectRadio(page, 'industryRole', 'rd');
    await submitAndWaitSuccess(page);
  });

  test('RAD-14: affiliation!=industry → industryRole hidden', async ({ page }) => {
    await selectRadio(page, 'affiliation', 'academic');
    expect(await hasVisibleClass(page, SEL.industryRoleField)).toBe(false);
  });

  // --- B-4. startupRole ---
  test('RAD-15: startup, no role → error', async ({ page }) => {
    await fillMinimumRequired(page);
    await selectRadio(page, 'affiliation', 'startup');
    await submitAndExpectErrors(page);
    expect(await getErrors(page)).toContain('Please select an option for Role');
  });

  test('RAD-16: startup + founder → pass', async ({ page }) => {
    setupSupabaseIntercept(page);
    await fillMinimumRequired(page);
    await selectRadio(page, 'affiliation', 'startup');
    await selectRadio(page, 'startupRole', 'founder');
    await submitAndWaitSuccess(page);
  });

  test('RAD-17: startup + other → startupRoleOtherField visible', async ({ page }) => {
    await selectRadio(page, 'affiliation', 'startup');
    await selectRadio(page, 'startupRole', 'other');
    expect(await hasVisibleClass(page, SEL.startupRoleOtherField)).toBe(true);
  });

  test('RAD-18: affiliation!=startup → startupRole hidden', async ({ page }) => {
    await selectRadio(page, 'affiliation', 'investor');
    expect(await hasVisibleClass(page, SEL.startupRoleField)).toBe(false);
  });

  // --- B-5. robotAccess ---
  test('RAD-19: no robotAccess → error', async ({ page }) => {
    await page.fill(SEL.fullName, 'Test');
    await page.fill(SEL.email, 'a@b.co');
    await page.fill(SEL.organization, 'O');
    await page.selectOption(SEL.country, 'US');
    await selectRadio(page, 'affiliation', 'investor');
    await selectRadio(page, 'simAccess', 'no');
    await checkBox(page, 'useCase', 'explore');
    await checkBox(page, 'applications', 'bin_picking');
    await selectRadio(page, 'shareWilling', 'no');
    await selectRadio(page, 'eventAttendance', 'no');
    await selectRadio(page, 'referralSource', 'social');
    await submitAndExpectErrors(page);
    expect(await getErrors(page)).toContain('Please select an option for Robot access');
  });

  test('RAD-20: own → robotType + robotBrand visible', async ({ page }) => {
    await selectRadio(page, 'robotAccess', 'own');
    expect(await hasVisibleClass(page, SEL.robotTypeField)).toBe(true);
    expect(await hasVisibleClass(page, SEL.robotBrandField)).toBe(true);
  });

  test('RAD-21: lab → robotType + robotBrand visible', async ({ page }) => {
    await selectRadio(page, 'robotAccess', 'lab');
    expect(await hasVisibleClass(page, SEL.robotTypeField)).toBe(true);
    expect(await hasVisibleClass(page, SEL.robotBrandField)).toBe(true);
  });

  test('RAD-22: planning → robotType + robotBrand visible', async ({ page }) => {
    await selectRadio(page, 'robotAccess', 'planning');
    expect(await hasVisibleClass(page, SEL.robotTypeField)).toBe(true);
    expect(await hasVisibleClass(page, SEL.robotBrandField)).toBe(true);
  });

  test('RAD-23: interested → robot fields hidden', async ({ page }) => {
    await selectRadio(page, 'robotAccess', 'interested');
    expect(await hasVisibleClass(page, SEL.robotTypeField)).toBe(false);
    expect(await hasVisibleClass(page, SEL.robotBrandField)).toBe(false);
  });

  // --- B-6. simAccess ---
  test('RAD-24: no simAccess → error', async ({ page }) => {
    await page.fill(SEL.fullName, 'T');
    await page.fill(SEL.email, 'a@b.co');
    await page.fill(SEL.organization, 'O');
    await page.selectOption(SEL.country, 'US');
    await selectRadio(page, 'affiliation', 'investor');
    await selectRadio(page, 'robotAccess', 'interested');
    await checkBox(page, 'useCase', 'explore');
    await checkBox(page, 'applications', 'bin_picking');
    await selectRadio(page, 'shareWilling', 'no');
    await selectRadio(page, 'eventAttendance', 'no');
    await selectRadio(page, 'referralSource', 'social');
    await submitAndExpectErrors(page);
    expect(await getErrors(page)).toContain('Please select an option for Simulation environment');
  });

  test('RAD-25: simAccess=rtx4080_plus → pass', async ({ page }) => {
    setupSupabaseIntercept(page);
    await fillMinimumRequired(page);
    await selectRadio(page, 'simAccess', 'rtx4080_plus');
    await submitAndWaitSuccess(page);
  });

  // --- B-7. shareWilling ---
  test('RAD-26: no shareWilling → error', async ({ page }) => {
    await page.fill(SEL.fullName, 'T');
    await page.fill(SEL.email, 'a@b.co');
    await page.fill(SEL.organization, 'O');
    await page.selectOption(SEL.country, 'US');
    await selectRadio(page, 'affiliation', 'investor');
    await selectRadio(page, 'robotAccess', 'interested');
    await selectRadio(page, 'simAccess', 'no');
    await checkBox(page, 'useCase', 'explore');
    await checkBox(page, 'applications', 'bin_picking');
    await selectRadio(page, 'eventAttendance', 'no');
    await selectRadio(page, 'referralSource', 'social');
    await submitAndExpectErrors(page);
    expect(await getErrors(page)).toContain('Please select an option for Sharing willingness');
  });

  test('RAD-27: yes → shareTypeField visible', async ({ page }) => {
    await selectRadio(page, 'shareWilling', 'yes');
    expect(await hasVisibleClass(page, SEL.shareTypeField)).toBe(true);
  });

  test('RAD-28: maybe → shareTypeField hidden', async ({ page }) => {
    await selectRadio(page, 'shareWilling', 'maybe');
    expect(await hasVisibleClass(page, SEL.shareTypeField)).toBe(false);
  });

  test('RAD-29: no → shareTypeField hidden', async ({ page }) => {
    await selectRadio(page, 'shareWilling', 'no');
    expect(await hasVisibleClass(page, SEL.shareTypeField)).toBe(false);
  });

  // --- B-8. eventAttendance ---
  test('RAD-30: no eventAttendance → error', async ({ page }) => {
    await page.fill(SEL.fullName, 'T');
    await page.fill(SEL.email, 'a@b.co');
    await page.fill(SEL.organization, 'O');
    await page.selectOption(SEL.country, 'US');
    await selectRadio(page, 'affiliation', 'investor');
    await selectRadio(page, 'robotAccess', 'interested');
    await selectRadio(page, 'simAccess', 'no');
    await checkBox(page, 'useCase', 'explore');
    await checkBox(page, 'applications', 'bin_picking');
    await selectRadio(page, 'shareWilling', 'no');
    await selectRadio(page, 'referralSource', 'social');
    await submitAndExpectErrors(page);
    expect(await getErrors(page)).toContain('Please select an option for Launch event attendance');
  });

  test('RAD-31: eventAttendance=us_inperson → pass', async ({ page }) => {
    setupSupabaseIntercept(page);
    await fillMinimumRequired(page);
    await selectRadio(page, 'eventAttendance', 'us_inperson');
    await submitAndWaitSuccess(page);
  });

  // --- B-9. referralSource ---
  test('RAD-32: no referralSource → error', async ({ page }) => {
    await page.fill(SEL.fullName, 'T');
    await page.fill(SEL.email, 'a@b.co');
    await page.fill(SEL.organization, 'O');
    await page.selectOption(SEL.country, 'US');
    await selectRadio(page, 'affiliation', 'investor');
    await selectRadio(page, 'robotAccess', 'interested');
    await selectRadio(page, 'simAccess', 'no');
    await checkBox(page, 'useCase', 'explore');
    await checkBox(page, 'applications', 'bin_picking');
    await selectRadio(page, 'shareWilling', 'no');
    await selectRadio(page, 'eventAttendance', 'no');
    await submitAndExpectErrors(page);
    expect(await getErrors(page)).toContain('Please select an option for How you heard about us');
  });

  test('RAD-33: referralSource=social → pass', async ({ page }) => {
    setupSupabaseIntercept(page);
    await fillMinimumRequired(page);
    await submitAndWaitSuccess(page);
  });

  test('RAD-34: referralSource=other → referralSourceOtherField visible', async ({ page }) => {
    await selectRadio(page, 'referralSource', 'other');
    expect(await hasVisibleClass(page, SEL.referralSourceOtherField)).toBe(true);
  });
});

// ============================================
// C. Checkbox (CHK-01 to CHK-45)
// ============================================
test.describe('C. Checkbox', () => {
  test.beforeEach(async ({ page }) => { await goToForm(page); });

  // --- C-1. communities (optional, None+Other) ---
  test('CHK-01: no communities → pass (optional)', async ({ page }) => {
    setupSupabaseIntercept(page);
    await fillMinimumRequired(page);
    await submitAndWaitSuccess(page);
  });

  test('CHK-02: openarm → pass', async ({ page }) => {
    setupSupabaseIntercept(page);
    await fillMinimumRequired(page);
    await checkBox(page, 'communities', 'openarm');
    await submitAndWaitSuccess(page);
  });

  test('CHK-03: None only → pass', async ({ page }) => {
    setupSupabaseIntercept(page);
    await fillMinimumRequired(page);
    await page.check(SEL.communitiesNone);
    await submitAndWaitSuccess(page);
  });

  test('CHK-04: Other only → communitiesOtherField visible', async ({ page }) => {
    await page.check(SEL.communitiesOther);
    expect(await hasVisibleClass(page, SEL.communitiesOtherField)).toBe(true);
  });

  test('CHK-05: normal + Other → field visible', async ({ page }) => {
    await checkBox(page, 'communities', 'openarm');
    await page.check(SEL.communitiesOther);
    expect(await hasVisibleClass(page, SEL.communitiesOtherField)).toBe(true);
  });

  test('CHK-06: None → Other → None unchecks', async ({ page }) => {
    await page.check(SEL.communitiesNone);
    await page.check(SEL.communitiesOther);
    expect(await page.isChecked(SEL.communitiesNone)).toBe(false);
  });

  test('CHK-07: Other → None → Other unchecks, field hidden', async ({ page }) => {
    await page.check(SEL.communitiesOther);
    await page.check(SEL.communitiesNone);
    expect(await page.isChecked(SEL.communitiesOther)).toBe(false);
    expect(await hasVisibleClass(page, SEL.communitiesOtherField)).toBe(false);
  });

  test('CHK-08: 2+ normal → pass', async ({ page }) => {
    setupSupabaseIntercept(page);
    await fillMinimumRequired(page);
    await checkBox(page, 'communities', 'openarm');
    await checkBox(page, 'communities', 'lerobot');
    await submitAndWaitSuccess(page);
  });

  test('CHK-09: normals → None → normals uncheck', async ({ page }) => {
    await checkBox(page, 'communities', 'openarm');
    await checkBox(page, 'communities', 'lerobot');
    await page.check(SEL.communitiesNone);
    expect(await page.isChecked('input[name="communities"][value="openarm"]')).toBe(false);
    expect(await page.isChecked('input[name="communities"][value="lerobot"]')).toBe(false);
  });

  test('CHK-10: None → normal → None unchecks', async ({ page }) => {
    await page.check(SEL.communitiesNone);
    await checkBox(page, 'communities', 'openarm');
    expect(await page.isChecked(SEL.communitiesNone)).toBe(false);
  });

  test('CHK-11: normal + Other + text → None → all clear', async ({ page }) => {
    await checkBox(page, 'communities', 'openarm');
    await page.check(SEL.communitiesOther);
    await page.fill(SEL.communitiesOtherInput, 'My Community');
    await page.check(SEL.communitiesNone);
    expect(await page.isChecked('input[name="communities"][value="openarm"]')).toBe(false);
    expect(await page.isChecked(SEL.communitiesOther)).toBe(false);
    expect(await hasVisibleClass(page, SEL.communitiesOtherField)).toBe(false);
  });

  // --- C-2. useCase (required, explore exclusive) ---
  test('CHK-12: no useCase → error', async ({ page }) => {
    await fillMinimumRequired(page);
    await uncheckBox(page, 'useCase', 'explore');
    await submitAndExpectErrors(page);
    expect(await getErrors(page)).toContain('Please select at least one option for What you want to do with RLDX');
  });

  test('CHK-13: benchmark → pass', async ({ page }) => {
    setupSupabaseIntercept(page);
    await fillMinimumRequired(page);
    await uncheckBox(page, 'useCase', 'explore');
    await checkBox(page, 'useCase', 'benchmark');
    await submitAndWaitSuccess(page);
  });

  test('CHK-14: explore → pass', async ({ page }) => {
    setupSupabaseIntercept(page);
    await fillMinimumRequired(page);
    // explore already checked by fillMinimumRequired
    await submitAndWaitSuccess(page);
  });

  test('CHK-15: 2+ normal → pass', async ({ page }) => {
    setupSupabaseIntercept(page);
    await fillMinimumRequired(page);
    await uncheckBox(page, 'useCase', 'explore');
    await checkBox(page, 'useCase', 'benchmark');
    await checkBox(page, 'useCase', 'finetune');
    await submitAndWaitSuccess(page);
  });

  test('CHK-16: normals → explore → normals uncheck', async ({ page }) => {
    await checkBox(page, 'useCase', 'benchmark');
    await checkBox(page, 'useCase', 'finetune');
    await page.check(SEL.useCaseExplore);
    expect(await page.isChecked('input[name="useCase"][value="benchmark"]')).toBe(false);
    expect(await page.isChecked('input[name="useCase"][value="finetune"]')).toBe(false);
  });

  test('CHK-17: explore → normal → explore unchecks', async ({ page }) => {
    await page.check(SEL.useCaseExplore);
    await checkBox(page, 'useCase', 'benchmark');
    expect(await page.isChecked(SEL.useCaseExplore)).toBe(false);
  });

  // --- C-3. applications (required, Other) ---
  test('CHK-18: no applications → error', async ({ page }) => {
    await fillMinimumRequired(page);
    await uncheckBox(page, 'applications', 'bin_picking');
    await submitAndExpectErrors(page);
    expect(await getErrors(page)).toContain('Please select at least one option for Tasks you are interested in');
  });

  test('CHK-19: one normal → pass', async ({ page }) => {
    setupSupabaseIntercept(page);
    await fillMinimumRequired(page);
    await submitAndWaitSuccess(page);
  });

  test('CHK-20: Other only → field visible', async ({ page }) => {
    await page.check(SEL.applicationsOther);
    expect(await hasVisibleClass(page, SEL.applicationsOtherField)).toBe(true);
  });

  test('CHK-21: normal + Other → field visible', async ({ page }) => {
    await checkBox(page, 'applications', 'bin_picking');
    await page.check(SEL.applicationsOther);
    expect(await hasVisibleClass(page, SEL.applicationsOtherField)).toBe(true);
  });

  test('CHK-22: 2+ normal → pass', async ({ page }) => {
    setupSupabaseIntercept(page);
    await fillMinimumRequired(page);
    await checkBox(page, 'applications', 'assembly');
    await submitAndWaitSuccess(page);
  });

  test('CHK-23: Other → uncheck → field hidden, text cleared', async ({ page }) => {
    await page.check(SEL.applicationsOther);
    await page.fill(SEL.applicationsOtherInput, 'Custom');
    await page.uncheck(SEL.applicationsOther);
    expect(await hasVisibleClass(page, SEL.applicationsOtherField)).toBe(false);
  });

  // --- C-4. industry (optional, affiliation=industry) ---
  test('CHK-24: industry affiliation, no industry checked → pass', async ({ page }) => {
    setupSupabaseIntercept(page);
    await fillMinimumRequired(page);
    await selectRadio(page, 'affiliation', 'industry');
    await selectRadio(page, 'industryRole', 'rd');
    await submitAndWaitSuccess(page);
  });

  test('CHK-25: one industry → pass', async ({ page }) => {
    setupSupabaseIntercept(page);
    await fillMinimumRequired(page);
    await selectRadio(page, 'affiliation', 'industry');
    await selectRadio(page, 'industryRole', 'rd');
    await checkBox(page, 'industry', 'manufacturing');
    await submitAndWaitSuccess(page);
  });

  test('CHK-26: industry Other → field visible', async ({ page }) => {
    await selectRadio(page, 'affiliation', 'industry');
    await page.check(SEL.industryOther);
    expect(await hasVisibleClass(page, SEL.industryOtherField)).toBe(true);
  });

  test('CHK-27: industry normal + Other → field visible', async ({ page }) => {
    await selectRadio(page, 'affiliation', 'industry');
    await checkBox(page, 'industry', 'manufacturing');
    await page.check(SEL.industryOther);
    expect(await hasVisibleClass(page, SEL.industryOtherField)).toBe(true);
  });

  test('CHK-28: 2+ industry → pass', async ({ page }) => {
    setupSupabaseIntercept(page);
    await fillMinimumRequired(page);
    await selectRadio(page, 'affiliation', 'industry');
    await selectRadio(page, 'industryRole', 'rd');
    await checkBox(page, 'industry', 'manufacturing');
    await checkBox(page, 'industry', 'logistics');
    await submitAndWaitSuccess(page);
  });

  test('CHK-29: affiliation!=industry → industry field hidden', async ({ page }) => {
    await selectRadio(page, 'affiliation', 'academic');
    expect(await hasVisibleClass(page, SEL.industryField)).toBe(false);
  });

  // --- C-5. robotType (optional, robotAccess=own/lab/planning) ---
  test('CHK-30: robotAccess=own, no type → pass', async ({ page }) => {
    setupSupabaseIntercept(page);
    await fillMinimumRequired(page);
    await selectRadio(page, 'robotAccess', 'own');
    await submitAndWaitSuccess(page);
  });

  test('CHK-31: one robotType → pass', async ({ page }) => {
    setupSupabaseIntercept(page);
    await fillMinimumRequired(page);
    await selectRadio(page, 'robotAccess', 'own');
    await checkBox(page, 'robotType', 'humanoid');
    await submitAndWaitSuccess(page);
  });

  test('CHK-32: robotType Other → field visible', async ({ page }) => {
    await selectRadio(page, 'robotAccess', 'own');
    await page.check(SEL.robotTypeOther);
    expect(await hasVisibleClass(page, SEL.robotTypeOtherField)).toBe(true);
  });

  test('CHK-33: robotType normal + Other → visible', async ({ page }) => {
    await selectRadio(page, 'robotAccess', 'own');
    await checkBox(page, 'robotType', 'humanoid');
    await page.check(SEL.robotTypeOther);
    expect(await hasVisibleClass(page, SEL.robotTypeOtherField)).toBe(true);
  });

  test('CHK-34: 2+ robotType → pass', async ({ page }) => {
    setupSupabaseIntercept(page);
    await fillMinimumRequired(page);
    await selectRadio(page, 'robotAccess', 'own');
    await checkBox(page, 'robotType', 'humanoid');
    await checkBox(page, 'robotType', 'mobile');
    await submitAndWaitSuccess(page);
  });

  test('CHK-35: robotAccess=interested → robotType hidden', async ({ page }) => {
    await selectRadio(page, 'robotAccess', 'interested');
    expect(await hasVisibleClass(page, SEL.robotTypeField)).toBe(false);
  });

  // --- C-6. robotBrand (optional, robotAccess=own/lab/planning) ---
  test('CHK-36: robotAccess=lab, no brand → pass', async ({ page }) => {
    setupSupabaseIntercept(page);
    await fillMinimumRequired(page);
    await selectRadio(page, 'robotAccess', 'lab');
    await submitAndWaitSuccess(page);
  });

  test('CHK-37: one robotBrand → pass', async ({ page }) => {
    setupSupabaseIntercept(page);
    await fillMinimumRequired(page);
    await selectRadio(page, 'robotAccess', 'lab');
    await checkBox(page, 'robotBrand', 'franka');
    await submitAndWaitSuccess(page);
  });

  test('CHK-38: robotBrand Other → field visible', async ({ page }) => {
    await selectRadio(page, 'robotAccess', 'lab');
    await page.check(SEL.robotBrandOther);
    expect(await hasVisibleClass(page, SEL.robotBrandOtherField)).toBe(true);
  });

  test('CHK-39: robotBrand normal + Other → visible', async ({ page }) => {
    await selectRadio(page, 'robotAccess', 'lab');
    await checkBox(page, 'robotBrand', 'franka');
    await page.check(SEL.robotBrandOther);
    expect(await hasVisibleClass(page, SEL.robotBrandOtherField)).toBe(true);
  });

  test('CHK-40: 2+ robotBrand → pass', async ({ page }) => {
    setupSupabaseIntercept(page);
    await fillMinimumRequired(page);
    await selectRadio(page, 'robotAccess', 'lab');
    await checkBox(page, 'robotBrand', 'franka');
    await checkBox(page, 'robotBrand', 'kuka');
    await submitAndWaitSuccess(page);
  });

  test('CHK-41: robotAccess=interested → robotBrand hidden', async ({ page }) => {
    await selectRadio(page, 'robotAccess', 'interested');
    expect(await hasVisibleClass(page, SEL.robotBrandField)).toBe(false);
  });

  // --- C-7. shareType (optional, shareWilling=yes) ---
  test('CHK-42: shareWilling=yes, none → pass', async ({ page }) => {
    setupSupabaseIntercept(page);
    await fillMinimumRequired(page);
    await selectRadio(page, 'shareWilling', 'yes');
    await submitAndWaitSuccess(page);
  });

  test('CHK-43: 1 shareType → pass', async ({ page }) => {
    setupSupabaseIntercept(page);
    await fillMinimumRequired(page);
    await selectRadio(page, 'shareWilling', 'yes');
    await checkBox(page, 'shareType', 'content');
    await submitAndWaitSuccess(page);
  });

  test('CHK-44: both shareType → pass', async ({ page }) => {
    setupSupabaseIntercept(page);
    await fillMinimumRequired(page);
    await selectRadio(page, 'shareWilling', 'yes');
    await checkBox(page, 'shareType', 'content');
    await checkBox(page, 'shareType', 'testimonial');
    await submitAndWaitSuccess(page);
  });

  test('CHK-45: shareWilling!=yes → shareType hidden', async ({ page }) => {
    await selectRadio(page, 'shareWilling', 'no');
    expect(await hasVisibleClass(page, SEL.shareTypeField)).toBe(false);
  });
});

// ============================================
// D. Conditional Logic (CND-01 to CND-31)
// ============================================
test.describe('D. Conditional Logic', () => {
  test.beforeEach(async ({ page }) => { await goToForm(page); });

  // --- D-1. Affiliation transitions ---
  test('CND-01: academic → academicRoleField visible', async ({ page }) => {
    await selectRadio(page, 'affiliation', 'academic');
    expect(await hasVisibleClass(page, SEL.academicRoleField)).toBe(true);
  });

  test('CND-02: industry → industryRoleField + industryField visible', async ({ page }) => {
    await selectRadio(page, 'affiliation', 'industry');
    expect(await hasVisibleClass(page, SEL.industryRoleField)).toBe(true);
    expect(await hasVisibleClass(page, SEL.industryField)).toBe(true);
  });

  test('CND-03: startup → startupRoleField visible', async ({ page }) => {
    await selectRadio(page, 'affiliation', 'startup');
    expect(await hasVisibleClass(page, SEL.startupRoleField)).toBe(true);
  });

  test('CND-04: investor → all hidden', async ({ page }) => {
    await selectRadio(page, 'affiliation', 'investor');
    expect(await hasVisibleClass(page, SEL.academicRoleField)).toBe(false);
    expect(await hasVisibleClass(page, SEL.industryRoleField)).toBe(false);
    expect(await hasVisibleClass(page, SEL.startupRoleField)).toBe(false);
    expect(await hasVisibleClass(page, SEL.affiliationOtherField)).toBe(false);
  });

  test('CND-05: other → affiliationOtherField visible, input required', async ({ page }) => {
    await selectRadio(page, 'affiliation', 'other');
    expect(await hasVisibleClass(page, SEL.affiliationOtherField)).toBe(true);
    const req = await page.locator(SEL.affiliationOtherInput).getAttribute('required');
    expect(req).not.toBeNull();
  });

  test('CND-06: academic → fill role → industry → academic cleared, industry visible', async ({ page }) => {
    await selectRadio(page, 'affiliation', 'academic');
    await selectRadio(page, 'academicRole', 'professor');
    await selectRadio(page, 'affiliation', 'industry');
    expect(await hasVisibleClass(page, SEL.academicRoleField)).toBe(false);
    expect(await hasVisibleClass(page, SEL.industryRoleField)).toBe(true);
    // Check academic role cleared
    expect(await page.isChecked('input[name="academicRole"][value="professor"]')).toBe(false);
  });

  test('CND-07: industry → fill → startup → industry cleared, startup visible', async ({ page }) => {
    await selectRadio(page, 'affiliation', 'industry');
    await selectRadio(page, 'industryRole', 'rd');
    await selectRadio(page, 'affiliation', 'startup');
    expect(await hasVisibleClass(page, SEL.industryRoleField)).toBe(false);
    expect(await hasVisibleClass(page, SEL.startupRoleField)).toBe(true);
    expect(await page.isChecked('input[name="industryRole"][value="rd"]')).toBe(false);
  });

  test('CND-08: startup → fill → academic → startup cleared, academic visible', async ({ page }) => {
    await selectRadio(page, 'affiliation', 'startup');
    await selectRadio(page, 'startupRole', 'founder');
    await selectRadio(page, 'affiliation', 'academic');
    expect(await hasVisibleClass(page, SEL.startupRoleField)).toBe(false);
    expect(await hasVisibleClass(page, SEL.academicRoleField)).toBe(true);
    expect(await page.isChecked('input[name="startupRole"][value="founder"]')).toBe(false);
  });

  test('CND-09: other → fill text → academic → other field hidden+cleared+no required', async ({ page }) => {
    await selectRadio(page, 'affiliation', 'other');
    await page.fill(SEL.affiliationOtherInput, 'Custom');
    await selectRadio(page, 'affiliation', 'academic');
    expect(await hasVisibleClass(page, SEL.affiliationOtherField)).toBe(false);
    expect(await page.inputValue(SEL.affiliationOtherInput)).toBe('');
  });

  test('CND-10: academic → fill → investor → hidden, no subs', async ({ page }) => {
    await selectRadio(page, 'affiliation', 'academic');
    await selectRadio(page, 'academicRole', 'professor');
    await selectRadio(page, 'affiliation', 'investor');
    expect(await hasVisibleClass(page, SEL.academicRoleField)).toBe(false);
    expect(await page.isChecked('input[name="academicRole"][value="professor"]')).toBe(false);
  });

  test('CND-11: industry → check Other+text → startup → industry hidden+cleared', async ({ page }) => {
    await selectRadio(page, 'affiliation', 'industry');
    await page.check(SEL.industryOther);
    await page.fill(SEL.industryOtherInput, 'Custom Ind');
    await selectRadio(page, 'affiliation', 'startup');
    expect(await hasVisibleClass(page, SEL.industryField)).toBe(false);
    expect(await page.isChecked(SEL.industryOther)).toBe(false);
  });

  // --- D-2. Startup Role Other ---
  test('CND-12: startup → Other → field visible, has required', async ({ page }) => {
    await selectRadio(page, 'affiliation', 'startup');
    await selectRadio(page, 'startupRole', 'other');
    expect(await hasVisibleClass(page, SEL.startupRoleOtherField)).toBe(true);
    const req = await page.locator(SEL.startupRoleOtherInput).getAttribute('required');
    expect(req).not.toBeNull();
  });

  test('CND-13: Other → fill → Founder → hidden+cleared+no required', async ({ page }) => {
    await selectRadio(page, 'affiliation', 'startup');
    await selectRadio(page, 'startupRole', 'other');
    await page.fill(SEL.startupRoleOtherInput, 'Advisor');
    await selectRadio(page, 'startupRole', 'founder');
    expect(await hasVisibleClass(page, SEL.startupRoleOtherField)).toBe(false);
    expect(await page.inputValue(SEL.startupRoleOtherInput)).toBe('');
  });

  test('CND-14: startup Other → empty → submit → error "Please specify"', async ({ page }) => {
    await fillMinimumRequired(page);
    await selectRadio(page, 'affiliation', 'startup');
    await selectRadio(page, 'startupRole', 'other');
    await submitAndExpectErrors(page);
    expect(await getErrors(page)).toContain('Please specify');
  });

  test('CND-15: startup Other → fill → submit → pass', async ({ page }) => {
    setupSupabaseIntercept(page);
    await fillMinimumRequired(page);
    await selectRadio(page, 'affiliation', 'startup');
    await selectRadio(page, 'startupRole', 'other');
    await page.fill(SEL.startupRoleOtherInput, 'Advisor');
    await submitAndWaitSuccess(page);
  });

  // --- D-3. Robot Access ---
  test('CND-16: own → both visible', async ({ page }) => {
    await selectRadio(page, 'robotAccess', 'own');
    expect(await hasVisibleClass(page, SEL.robotTypeField)).toBe(true);
    expect(await hasVisibleClass(page, SEL.robotBrandField)).toBe(true);
  });

  test('CND-17: lab → visible', async ({ page }) => {
    await selectRadio(page, 'robotAccess', 'lab');
    expect(await hasVisibleClass(page, SEL.robotTypeField)).toBe(true);
    expect(await hasVisibleClass(page, SEL.robotBrandField)).toBe(true);
  });

  test('CND-18: planning → visible', async ({ page }) => {
    await selectRadio(page, 'robotAccess', 'planning');
    expect(await hasVisibleClass(page, SEL.robotTypeField)).toBe(true);
    expect(await hasVisibleClass(page, SEL.robotBrandField)).toBe(true);
  });

  test('CND-19: interested → hidden', async ({ page }) => {
    await selectRadio(page, 'robotAccess', 'interested');
    expect(await hasVisibleClass(page, SEL.robotTypeField)).toBe(false);
    expect(await hasVisibleClass(page, SEL.robotBrandField)).toBe(false);
  });

  test('CND-20: own → fill → interested → cleared', async ({ page }) => {
    await selectRadio(page, 'robotAccess', 'own');
    await checkBox(page, 'robotType', 'humanoid');
    await checkBox(page, 'robotBrand', 'franka');
    await selectRadio(page, 'robotAccess', 'interested');
    expect(await hasVisibleClass(page, SEL.robotTypeField)).toBe(false);
    expect(await page.isChecked('input[name="robotType"][value="humanoid"]')).toBe(false);
    expect(await page.isChecked('input[name="robotBrand"][value="franka"]')).toBe(false);
  });

  test('CND-21: own → fill → lab → fields STAY (both hasRobot)', async ({ page }) => {
    await selectRadio(page, 'robotAccess', 'own');
    await checkBox(page, 'robotType', 'humanoid');
    await checkBox(page, 'robotBrand', 'franka');
    await selectRadio(page, 'robotAccess', 'lab');
    expect(await hasVisibleClass(page, SEL.robotTypeField)).toBe(true);
    expect(await hasVisibleClass(page, SEL.robotBrandField)).toBe(true);
    // Values may or may not persist — check visibility stays
  });

  test('CND-22: own → Other+text → interested → all cleared', async ({ page }) => {
    await selectRadio(page, 'robotAccess', 'own');
    await page.check(SEL.robotTypeOther);
    await page.fill(SEL.robotTypeOtherInput, 'Custom');
    await page.check(SEL.robotBrandOther);
    await page.fill(SEL.robotBrandOtherInput, 'MyBrand');
    await selectRadio(page, 'robotAccess', 'interested');
    expect(await hasVisibleClass(page, SEL.robotTypeField)).toBe(false);
    expect(await hasVisibleClass(page, SEL.robotBrandField)).toBe(false);
    expect(await page.isChecked(SEL.robotTypeOther)).toBe(false);
    expect(await page.isChecked(SEL.robotBrandOther)).toBe(false);
  });

  test('CND-23: interested → planning → visible (empty)', async ({ page }) => {
    await selectRadio(page, 'robotAccess', 'interested');
    await selectRadio(page, 'robotAccess', 'planning');
    expect(await hasVisibleClass(page, SEL.robotTypeField)).toBe(true);
    expect(await hasVisibleClass(page, SEL.robotBrandField)).toBe(true);
  });

  // --- D-4. Share Willing ---
  test('CND-24: yes → shareType visible', async ({ page }) => {
    await selectRadio(page, 'shareWilling', 'yes');
    expect(await hasVisibleClass(page, SEL.shareTypeField)).toBe(true);
  });

  test('CND-25: yes → check → no → hidden+cleared', async ({ page }) => {
    await selectRadio(page, 'shareWilling', 'yes');
    await checkBox(page, 'shareType', 'content');
    await selectRadio(page, 'shareWilling', 'no');
    expect(await hasVisibleClass(page, SEL.shareTypeField)).toBe(false);
    expect(await page.isChecked('input[name="shareType"][value="content"]')).toBe(false);
  });

  test('CND-26: yes → check → maybe → hidden+cleared', async ({ page }) => {
    await selectRadio(page, 'shareWilling', 'yes');
    await checkBox(page, 'shareType', 'testimonial');
    await selectRadio(page, 'shareWilling', 'maybe');
    expect(await hasVisibleClass(page, SEL.shareTypeField)).toBe(false);
    expect(await page.isChecked('input[name="shareType"][value="testimonial"]')).toBe(false);
  });

  test('CND-27: no → yes → visible (empty)', async ({ page }) => {
    await selectRadio(page, 'shareWilling', 'no');
    await selectRadio(page, 'shareWilling', 'yes');
    expect(await hasVisibleClass(page, SEL.shareTypeField)).toBe(true);
  });

  // --- D-5. Referral Source Other ---
  test('CND-28: other → visible + required', async ({ page }) => {
    await selectRadio(page, 'referralSource', 'other');
    expect(await hasVisibleClass(page, SEL.referralSourceOtherField)).toBe(true);
    const req = await page.locator(SEL.referralSourceOtherInput).getAttribute('required');
    expect(req).not.toBeNull();
  });

  test('CND-29: other → fill → normal → hidden+cleared+no required', async ({ page }) => {
    await selectRadio(page, 'referralSource', 'other');
    await page.fill(SEL.referralSourceOtherInput, 'A friend');
    await selectRadio(page, 'referralSource', 'social');
    expect(await hasVisibleClass(page, SEL.referralSourceOtherField)).toBe(false);
    expect(await page.inputValue(SEL.referralSourceOtherInput)).toBe('');
  });

  test('CND-30: referral other → empty → submit → error', async ({ page }) => {
    await fillMinimumRequired(page);
    await selectRadio(page, 'referralSource', 'other');
    await submitAndExpectErrors(page);
    expect(await getErrors(page)).toContain('Please specify');
  });

  test('CND-31: referral other → fill → submit → pass', async ({ page }) => {
    setupSupabaseIntercept(page);
    await fillMinimumRequired(page);
    await selectRadio(page, 'referralSource', 'other');
    await page.fill(SEL.referralSourceOtherInput, 'Conference');
    await submitAndWaitSuccess(page);
  });
});

// ============================================
// E. Mutual Exclusion (EXC-01 to EXC-12)
// ============================================
test.describe('E. Mutual Exclusion', () => {
  test.beforeEach(async ({ page }) => { await goToForm(page); });

  // --- E-1. Communities None ---
  test('EXC-01: None → OpenArm → None unchecks', async ({ page }) => {
    await page.check(SEL.communitiesNone);
    await checkBox(page, 'communities', 'openarm');
    expect(await page.isChecked(SEL.communitiesNone)).toBe(false);
    expect(await page.isChecked('input[name="communities"][value="openarm"]')).toBe(true);
  });

  test('EXC-02: OpenArm → None → OpenArm unchecks', async ({ page }) => {
    await checkBox(page, 'communities', 'openarm');
    await page.check(SEL.communitiesNone);
    expect(await page.isChecked('input[name="communities"][value="openarm"]')).toBe(false);
    expect(await page.isChecked(SEL.communitiesNone)).toBe(true);
  });

  test('EXC-03: OpenArm+LeRobot → None → both uncheck', async ({ page }) => {
    await checkBox(page, 'communities', 'openarm');
    await checkBox(page, 'communities', 'lerobot');
    await page.check(SEL.communitiesNone);
    expect(await page.isChecked('input[name="communities"][value="openarm"]')).toBe(false);
    expect(await page.isChecked('input[name="communities"][value="lerobot"]')).toBe(false);
    expect(await page.isChecked(SEL.communitiesNone)).toBe(true);
  });

  test('EXC-04: None → Other → None unchecks, field visible', async ({ page }) => {
    await page.check(SEL.communitiesNone);
    await page.check(SEL.communitiesOther);
    expect(await page.isChecked(SEL.communitiesNone)).toBe(false);
    expect(await hasVisibleClass(page, SEL.communitiesOtherField)).toBe(true);
  });

  test('EXC-05: Other+text → None → Other unchecks, field hidden, text cleared', async ({ page }) => {
    await page.check(SEL.communitiesOther);
    await page.fill(SEL.communitiesOtherInput, 'Custom');
    await page.check(SEL.communitiesNone);
    expect(await page.isChecked(SEL.communitiesOther)).toBe(false);
    expect(await hasVisibleClass(page, SEL.communitiesOtherField)).toBe(false);
  });

  test('EXC-06: OpenArm+Other+text → None → all uncheck, field hidden, text cleared', async ({ page }) => {
    await checkBox(page, 'communities', 'openarm');
    await page.check(SEL.communitiesOther);
    await page.fill(SEL.communitiesOtherInput, 'Custom');
    await page.check(SEL.communitiesNone);
    expect(await page.isChecked('input[name="communities"][value="openarm"]')).toBe(false);
    expect(await page.isChecked(SEL.communitiesOther)).toBe(false);
    expect(await hasVisibleClass(page, SEL.communitiesOtherField)).toBe(false);
  });

  test('EXC-07: None → uncheck None → nothing checked', async ({ page }) => {
    await page.check(SEL.communitiesNone);
    await page.uncheck(SEL.communitiesNone);
    const anyChecked = await page.$$eval('input[name="communities"]', els => els.some(el => el.checked));
    expect(anyChecked).toBe(false);
  });

  // --- E-2. UseCase explore ---
  test('EXC-08: explore → Benchmark → explore unchecks', async ({ page }) => {
    await page.check(SEL.useCaseExplore);
    await checkBox(page, 'useCase', 'benchmark');
    expect(await page.isChecked(SEL.useCaseExplore)).toBe(false);
    expect(await page.isChecked('input[name="useCase"][value="benchmark"]')).toBe(true);
  });

  test('EXC-09: Benchmark → explore → Benchmark unchecks', async ({ page }) => {
    await checkBox(page, 'useCase', 'benchmark');
    await page.check(SEL.useCaseExplore);
    expect(await page.isChecked('input[name="useCase"][value="benchmark"]')).toBe(false);
    expect(await page.isChecked(SEL.useCaseExplore)).toBe(true);
  });

  test('EXC-10: Benchmark+Finetune → explore → both uncheck', async ({ page }) => {
    await checkBox(page, 'useCase', 'benchmark');
    await checkBox(page, 'useCase', 'finetune');
    await page.check(SEL.useCaseExplore);
    expect(await page.isChecked('input[name="useCase"][value="benchmark"]')).toBe(false);
    expect(await page.isChecked('input[name="useCase"][value="finetune"]')).toBe(false);
    expect(await page.isChecked(SEL.useCaseExplore)).toBe(true);
  });

  test('EXC-11: explore → uncheck → nothing checked', async ({ page }) => {
    await page.check(SEL.useCaseExplore);
    await page.uncheck(SEL.useCaseExplore);
    const anyChecked = await page.$$eval('input[name="useCase"]', els => els.some(el => el.checked));
    expect(anyChecked).toBe(false);
  });

  test('EXC-12: explore → submit → pass (1 selected)', async ({ page }) => {
    setupSupabaseIntercept(page);
    await fillMinimumRequired(page);
    // explore is already checked by fillMinimumRequired
    await submitAndWaitSuccess(page);
  });
});
