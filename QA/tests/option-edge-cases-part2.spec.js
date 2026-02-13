// ============================================
// RLDX Waitlist QA — Option Edge Cases Part 2
// Categories F–J (OTH-01 to CRS-09, 81 tests)
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
// F. Other + Text Field (OTH-01 to OTH-26)
// ============================================
test.describe('F. Other + Text Field', () => {
  test.beforeEach(async ({ page }) => {
    await goToForm(page);
  });

  // --- F-1. Required Other texts ---

  test('OTH-01: affiliation=other, empty text, submit -> error "Please specify"', async ({ page }) => {
    await fillMinimumRequired(page);
    await selectRadio(page, 'affiliation', 'other');
    // Leave affiliationOther text empty
    await submitAndExpectErrors(page);
    const errors = await getErrors(page);
    expect(errors.some(e => e.toLowerCase().includes('please specify'))).toBe(true);
  });

  test('OTH-02: affiliation=other, fill text "Custom", submit -> pass', async ({ page }) => {
    const captured = setupSupabaseIntercept(page);
    await fillMinimumRequired(page);
    await selectRadio(page, 'affiliation', 'other');
    await page.fill(SEL.affiliationOtherInput, 'Custom');
    await submitAndWaitSuccess(page);
    expect(captured.requests.length).toBe(1);
  });

  test('OTH-03: affiliation=other, spaces-only text, submit -> error (trim)', async ({ page }) => {
    await fillMinimumRequired(page);
    await selectRadio(page, 'affiliation', 'other');
    await page.fill(SEL.affiliationOtherInput, '   ');
    await submitAndExpectErrors(page);
    const errors = await getErrors(page);
    expect(errors.some(e => e.toLowerCase().includes('please specify'))).toBe(true);
  });

  test('OTH-04: affiliation=other, fill text, switch to academic, fill role -> pass', async ({ page }) => {
    const captured = setupSupabaseIntercept(page);
    await fillMinimumRequired(page);
    await selectRadio(page, 'affiliation', 'other');
    await page.fill(SEL.affiliationOtherInput, 'Custom');
    await selectRadio(page, 'affiliation', 'academic');
    await selectRadio(page, 'academicRole', 'professor');
    await submitAndWaitSuccess(page);
    expect(captured.requests.length).toBe(1);
  });

  test('OTH-05: affiliation=other, empty text, switch to academic, fill role -> pass', async ({ page }) => {
    const captured = setupSupabaseIntercept(page);
    await fillMinimumRequired(page);
    await selectRadio(page, 'affiliation', 'other');
    // Leave affiliationOther empty
    await selectRadio(page, 'affiliation', 'academic');
    await selectRadio(page, 'academicRole', 'professor');
    await submitAndWaitSuccess(page);
    expect(captured.requests.length).toBe(1);
  });

  test('OTH-06: startup, startupRole=other, empty text -> error "Please specify"', async ({ page }) => {
    await fillMinimumRequired(page);
    await selectRadio(page, 'affiliation', 'startup');
    await selectRadio(page, 'startupRole', 'other');
    // Leave startupRoleOther empty
    await submitAndExpectErrors(page);
    const errors = await getErrors(page);
    expect(errors.some(e => e.toLowerCase().includes('please specify'))).toBe(true);
  });

  test('OTH-07: startup, startupRole=other, fill text -> pass', async ({ page }) => {
    const captured = setupSupabaseIntercept(page);
    await fillMinimumRequired(page);
    await selectRadio(page, 'affiliation', 'startup');
    await selectRadio(page, 'startupRole', 'other');
    await page.fill(SEL.startupRoleOtherInput, 'Custom Role');
    await submitAndWaitSuccess(page);
    expect(captured.requests.length).toBe(1);
  });

  test('OTH-08: startup, startupRole=other, fill text, switch to founder -> pass', async ({ page }) => {
    const captured = setupSupabaseIntercept(page);
    await fillMinimumRequired(page);
    await selectRadio(page, 'affiliation', 'startup');
    await selectRadio(page, 'startupRole', 'other');
    await page.fill(SEL.startupRoleOtherInput, 'Custom Role');
    await selectRadio(page, 'startupRole', 'founder');
    await submitAndWaitSuccess(page);
    expect(captured.requests.length).toBe(1);
  });

  test('OTH-09: referralSource=other, empty text -> error "Please specify"', async ({ page }) => {
    await fillMinimumRequired(page);
    await selectRadio(page, 'referralSource', 'other');
    // Leave referralSourceOther empty
    await submitAndExpectErrors(page);
    const errors = await getErrors(page);
    expect(errors.some(e => e.toLowerCase().includes('please specify'))).toBe(true);
  });

  test('OTH-10: referralSource=other, fill text -> pass', async ({ page }) => {
    const captured = setupSupabaseIntercept(page);
    await fillMinimumRequired(page);
    await selectRadio(page, 'referralSource', 'other');
    await page.fill(SEL.referralSourceOtherInput, 'A friend');
    await submitAndWaitSuccess(page);
    expect(captured.requests.length).toBe(1);
  });

  test('OTH-11: referralSource=other, fill text, switch to social -> pass', async ({ page }) => {
    const captured = setupSupabaseIntercept(page);
    await fillMinimumRequired(page);
    await selectRadio(page, 'referralSource', 'other');
    await page.fill(SEL.referralSourceOtherInput, 'A friend');
    await selectRadio(page, 'referralSource', 'social');
    await submitAndWaitSuccess(page);
    expect(captured.requests.length).toBe(1);
  });

  // --- F-2. Optional Other texts ---

  test('OTH-12: communities Other checked, empty text -> pass', async ({ page }) => {
    const captured = setupSupabaseIntercept(page);
    await fillMinimumRequired(page);
    await checkBox(page, 'communities', 'other');
    // Leave communitiesOther text empty
    await submitAndWaitSuccess(page);
    expect(captured.requests.length).toBe(1);
  });

  test('OTH-13: communities Other checked, fill text -> pass', async ({ page }) => {
    const captured = setupSupabaseIntercept(page);
    await fillMinimumRequired(page);
    await checkBox(page, 'communities', 'other');
    await page.fill(SEL.communitiesOtherInput, 'My Community');
    await submitAndWaitSuccess(page);
    expect(captured.requests.length).toBe(1);
  });

  test('OTH-14: communities Other checked, fill text, uncheck Other -> pass (field hidden+cleared)', async ({ page }) => {
    const captured = setupSupabaseIntercept(page);
    await fillMinimumRequired(page);
    await checkBox(page, 'communities', 'other');
    await page.fill(SEL.communitiesOtherInput, 'My Community');
    await uncheckBox(page, 'communities', 'other');
    // Field hidden
    const visible = await hasVisibleClass(page, SEL.communitiesOtherField);
    expect(visible).toBe(false);
    await submitAndWaitSuccess(page);
    expect(captured.requests.length).toBe(1);
  });

  test('OTH-15: industry Other (affiliation=industry), empty text -> pass', async ({ page }) => {
    const captured = setupSupabaseIntercept(page);
    await fillMinimumRequired(page);
    await selectRadio(page, 'affiliation', 'industry');
    await selectRadio(page, 'industryRole', 'rd');
    await checkBox(page, 'industry', 'manufacturing');
    await checkBox(page, 'industry', 'other');
    // Leave industryOther text empty
    await submitAndWaitSuccess(page);
    expect(captured.requests.length).toBe(1);
  });

  test('OTH-16: industry Other, fill text -> pass', async ({ page }) => {
    const captured = setupSupabaseIntercept(page);
    await fillMinimumRequired(page);
    await selectRadio(page, 'affiliation', 'industry');
    await selectRadio(page, 'industryRole', 'rd');
    await checkBox(page, 'industry', 'manufacturing');
    await checkBox(page, 'industry', 'other');
    await page.fill(SEL.industryOtherInput, 'Robotics');
    await submitAndWaitSuccess(page);
    expect(captured.requests.length).toBe(1);
  });

  test('OTH-17: robotType Other (robotAccess=own), empty text -> pass', async ({ page }) => {
    const captured = setupSupabaseIntercept(page);
    await fillMinimumRequired(page);
    await selectRadio(page, 'robotAccess', 'own');
    await checkBox(page, 'robotType', 'humanoid');
    await checkBox(page, 'robotType', 'other');
    await checkBox(page, 'robotBrand', 'aloha');
    // Leave robotTypeOther text empty
    await submitAndWaitSuccess(page);
    expect(captured.requests.length).toBe(1);
  });

  test('OTH-18: robotType Other, fill text -> pass', async ({ page }) => {
    const captured = setupSupabaseIntercept(page);
    await fillMinimumRequired(page);
    await selectRadio(page, 'robotAccess', 'own');
    await checkBox(page, 'robotType', 'humanoid');
    await checkBox(page, 'robotType', 'other');
    await page.fill(SEL.robotTypeOtherInput, 'Custom Robot');
    await checkBox(page, 'robotBrand', 'aloha');
    await submitAndWaitSuccess(page);
    expect(captured.requests.length).toBe(1);
  });

  test('OTH-19: robotBrand Other (robotAccess=own), empty text -> pass', async ({ page }) => {
    const captured = setupSupabaseIntercept(page);
    await fillMinimumRequired(page);
    await selectRadio(page, 'robotAccess', 'own');
    await checkBox(page, 'robotType', 'humanoid');
    await checkBox(page, 'robotBrand', 'other');
    // Leave robotBrandOther text empty
    await submitAndWaitSuccess(page);
    expect(captured.requests.length).toBe(1);
  });

  test('OTH-20: robotBrand Other, fill text -> pass', async ({ page }) => {
    const captured = setupSupabaseIntercept(page);
    await fillMinimumRequired(page);
    await selectRadio(page, 'robotAccess', 'own');
    await checkBox(page, 'robotType', 'humanoid');
    await checkBox(page, 'robotBrand', 'other');
    await page.fill(SEL.robotBrandOtherInput, 'Custom Brand');
    await submitAndWaitSuccess(page);
    expect(captured.requests.length).toBe(1);
  });

  test('OTH-21: applications Other, empty text -> pass', async ({ page }) => {
    const captured = setupSupabaseIntercept(page);
    await fillMinimumRequired(page);
    await checkBox(page, 'applications', 'other');
    // Leave applicationsOther text empty
    await submitAndWaitSuccess(page);
    expect(captured.requests.length).toBe(1);
  });

  test('OTH-22: applications Other, fill text -> pass', async ({ page }) => {
    const captured = setupSupabaseIntercept(page);
    await fillMinimumRequired(page);
    await checkBox(page, 'applications', 'other');
    await page.fill(SEL.applicationsOtherInput, 'Custom Task');
    await submitAndWaitSuccess(page);
    expect(captured.requests.length).toBe(1);
  });

  // --- F-3. Other field show/hide ---

  test('OTH-23: checkbox Other (communities) check -> field appears', async ({ page }) => {
    await checkBox(page, 'communities', 'other');
    const visible = await hasVisibleClass(page, SEL.communitiesOtherField);
    expect(visible).toBe(true);
  });

  test('OTH-24: checkbox Other check then uncheck -> field hidden + text cleared', async ({ page }) => {
    await checkBox(page, 'communities', 'other');
    await page.fill(SEL.communitiesOtherInput, 'Something');
    await uncheckBox(page, 'communities', 'other');
    const visible = await hasVisibleClass(page, SEL.communitiesOtherField);
    expect(visible).toBe(false);
    const value = await page.locator(SEL.communitiesOtherInput).inputValue();
    expect(value).toBe('');
  });

  test('OTH-25: radio Other (affiliation) select -> field appears', async ({ page }) => {
    await selectRadio(page, 'affiliation', 'other');
    const visible = await hasVisibleClass(page, SEL.affiliationOtherField);
    expect(visible).toBe(true);
  });

  test('OTH-26: radio Other select then switch normal -> field hidden + text cleared + required removed', async ({ page }) => {
    await selectRadio(page, 'affiliation', 'other');
    await page.fill(SEL.affiliationOtherInput, 'Something');
    await selectRadio(page, 'affiliation', 'investor');
    const visible = await hasVisibleClass(page, SEL.affiliationOtherField);
    expect(visible).toBe(false);
    const value = await page.locator(SEL.affiliationOtherInput).inputValue();
    expect(value).toBe('');
    const required = await page.locator(SEL.affiliationOtherInput).getAttribute('required');
    expect(required).toBeNull();
  });
});

// ============================================
// G. Form Submission & Validation (SUB-01 to SUB-29)
// ============================================
test.describe('G. Form Submission & Validation', () => {
  test.beforeEach(async ({ page }) => {
    await goToForm(page);
  });

  // --- G-1. Validation combos ---

  test('SUB-01: all required filled -> submit -> success', async ({ page }) => {
    const captured = setupSupabaseIntercept(page);
    await fillMinimumRequired(page);
    await submitAndWaitSuccess(page);
    expect(captured.requests.length).toBe(1);
  });

  test('SUB-02: only fullName empty -> error', async ({ page }) => {
    await fillMinimumRequired(page);
    await page.fill(SEL.fullName, '');
    await submitAndExpectErrors(page);
    const errors = await getErrors(page);
    expect(errors.length).toBeGreaterThan(0);
  });

  test('SUB-03: only email empty -> error', async ({ page }) => {
    await fillMinimumRequired(page);
    await page.fill(SEL.email, '');
    await submitAndExpectErrors(page);
    const errors = await getErrors(page);
    expect(errors.length).toBeGreaterThan(0);
  });

  test('SUB-04: only organization empty -> error', async ({ page }) => {
    await fillMinimumRequired(page);
    await page.fill(SEL.organization, '');
    await submitAndExpectErrors(page);
    const errors = await getErrors(page);
    expect(errors.length).toBeGreaterThan(0);
  });

  test('SUB-05: only country unselected -> error', async ({ page }) => {
    await fillMinimumRequired(page);
    await page.selectOption(SEL.country, '');
    await submitAndExpectErrors(page);
    const errors = await getErrors(page);
    expect(errors.length).toBeGreaterThan(0);
  });

  test('SUB-06: only affiliation unselected -> error', async ({ page }) => {
    await fillMinimumRequired(page);
    await page.evaluate(() => document.querySelectorAll('input[name="affiliation"]').forEach(r => r.checked = false));
    await submitAndExpectErrors(page);
    const errors = await getErrors(page);
    expect(errors.length).toBeGreaterThan(0);
  });

  test('SUB-07: only robotAccess unselected -> error', async ({ page }) => {
    await fillMinimumRequired(page);
    await page.evaluate(() => document.querySelectorAll('input[name="robotAccess"]').forEach(r => r.checked = false));
    await submitAndExpectErrors(page);
    const errors = await getErrors(page);
    expect(errors.length).toBeGreaterThan(0);
  });

  test('SUB-08: only simAccess unselected -> error', async ({ page }) => {
    await fillMinimumRequired(page);
    await page.evaluate(() => document.querySelectorAll('input[name="simAccess"]').forEach(r => r.checked = false));
    await submitAndExpectErrors(page);
    const errors = await getErrors(page);
    expect(errors.length).toBeGreaterThan(0);
  });

  test('SUB-09: only useCase unselected -> error', async ({ page }) => {
    await fillMinimumRequired(page);
    await uncheckBox(page, 'useCase', 'explore');
    await submitAndExpectErrors(page);
    const errors = await getErrors(page);
    expect(errors.length).toBeGreaterThan(0);
  });

  test('SUB-10: only applications unselected -> error', async ({ page }) => {
    await fillMinimumRequired(page);
    await uncheckBox(page, 'applications', 'bin_picking');
    await submitAndExpectErrors(page);
    const errors = await getErrors(page);
    expect(errors.length).toBeGreaterThan(0);
  });

  test('SUB-11: only shareWilling unselected -> error', async ({ page }) => {
    await fillMinimumRequired(page);
    await page.evaluate(() => document.querySelectorAll('input[name="shareWilling"]').forEach(r => r.checked = false));
    await submitAndExpectErrors(page);
    const errors = await getErrors(page);
    expect(errors.length).toBeGreaterThan(0);
  });

  test('SUB-12: only eventAttendance unselected -> error', async ({ page }) => {
    await fillMinimumRequired(page);
    await page.evaluate(() => document.querySelectorAll('input[name="eventAttendance"]').forEach(r => r.checked = false));
    await submitAndExpectErrors(page);
    const errors = await getErrors(page);
    expect(errors.length).toBeGreaterThan(0);
  });

  test('SUB-13: only referralSource unselected -> error', async ({ page }) => {
    await fillMinimumRequired(page);
    await page.evaluate(() => document.querySelectorAll('input[name="referralSource"]').forEach(r => r.checked = false));
    await submitAndExpectErrors(page);
    const errors = await getErrors(page);
    expect(errors.length).toBeGreaterThan(0);
  });

  test('SUB-14: ALL empty -> multiple errors, first error is for fullName', async ({ page }) => {
    await submitAndExpectErrors(page);
    const errors = await getErrors(page);
    expect(errors.length).toBeGreaterThan(1);
    // First error should relate to fullName
    const firstErrorGroup = await page.locator('.has-error').first();
    const containsFullName = await firstErrorGroup.locator(SEL.fullName).count();
    expect(containsFullName).toBeGreaterThan(0);
  });

  test('SUB-15: affiliation=academic + academicRole empty -> error for role', async ({ page }) => {
    await fillMinimumRequired(page);
    await selectRadio(page, 'affiliation', 'academic');
    // Leave academicRole unselected
    await submitAndExpectErrors(page);
    const errors = await getErrors(page);
    expect(errors.length).toBeGreaterThan(0);
  });

  test('SUB-16: affiliation=industry + industryRole empty -> error', async ({ page }) => {
    await fillMinimumRequired(page);
    await selectRadio(page, 'affiliation', 'industry');
    // Leave industryRole unselected
    await submitAndExpectErrors(page);
    const errors = await getErrors(page);
    expect(errors.length).toBeGreaterThan(0);
  });

  test('SUB-17: affiliation=startup + startupRole empty -> error', async ({ page }) => {
    await fillMinimumRequired(page);
    await selectRadio(page, 'affiliation', 'startup');
    // Leave startupRole unselected
    await submitAndExpectErrors(page);
    const errors = await getErrors(page);
    expect(errors.length).toBeGreaterThan(0);
  });

  test('SUB-18: affiliation=other + affiliationOther empty -> error "Please specify"', async ({ page }) => {
    await fillMinimumRequired(page);
    await selectRadio(page, 'affiliation', 'other');
    await submitAndExpectErrors(page);
    const errors = await getErrors(page);
    expect(errors.some(e => e.toLowerCase().includes('please specify'))).toBe(true);
  });

  test('SUB-19: startup + startupRole=other + text empty -> error "Please specify"', async ({ page }) => {
    await fillMinimumRequired(page);
    await selectRadio(page, 'affiliation', 'startup');
    await selectRadio(page, 'startupRole', 'other');
    await submitAndExpectErrors(page);
    const errors = await getErrors(page);
    expect(errors.some(e => e.toLowerCase().includes('please specify'))).toBe(true);
  });

  test('SUB-20: referralSource=other + text empty -> error "Please specify"', async ({ page }) => {
    await fillMinimumRequired(page);
    await selectRadio(page, 'referralSource', 'other');
    await submitAndExpectErrors(page);
    const errors = await getErrors(page);
    expect(errors.some(e => e.toLowerCase().includes('please specify'))).toBe(true);
  });

  // --- G-2. Hidden fields don't affect ---

  test('SUB-21: academic -> fill role -> switch investor -> submit -> pass', async ({ page }) => {
    const captured = setupSupabaseIntercept(page);
    await fillMinimumRequired(page);
    await selectRadio(page, 'affiliation', 'academic');
    await selectRadio(page, 'academicRole', 'professor');
    await selectRadio(page, 'affiliation', 'investor');
    await submitAndWaitSuccess(page);
    expect(captured.requests.length).toBe(1);
  });

  test('SUB-22: other -> fill text -> switch academic -> fill role -> submit -> pass', async ({ page }) => {
    const captured = setupSupabaseIntercept(page);
    await fillMinimumRequired(page);
    await selectRadio(page, 'affiliation', 'other');
    await page.fill(SEL.affiliationOtherInput, 'Something');
    await selectRadio(page, 'affiliation', 'academic');
    await selectRadio(page, 'academicRole', 'professor');
    await submitAndWaitSuccess(page);
    expect(captured.requests.length).toBe(1);
  });

  test('SUB-23: own -> fill type+brand -> switch interested -> submit -> pass', async ({ page }) => {
    const captured = setupSupabaseIntercept(page);
    await fillMinimumRequired(page);
    await selectRadio(page, 'robotAccess', 'own');
    await checkBox(page, 'robotType', 'humanoid');
    await checkBox(page, 'robotBrand', 'aloha');
    await selectRadio(page, 'robotAccess', 'interested');
    await submitAndWaitSuccess(page);
    expect(captured.requests.length).toBe(1);
  });

  test('SUB-24: yes share -> check type -> switch no -> submit -> pass', async ({ page }) => {
    const captured = setupSupabaseIntercept(page);
    await fillMinimumRequired(page);
    await selectRadio(page, 'shareWilling', 'yes');
    await checkBox(page, 'shareType', 'content');
    await selectRadio(page, 'shareWilling', 'no');
    await submitAndWaitSuccess(page);
    expect(captured.requests.length).toBe(1);
  });

  // --- G-3. Error UI ---

  test('SUB-25: submit error -> type in field -> .has-error removed from that group', async ({ page }) => {
    await submitAndExpectErrors(page);
    // fullName group should have error
    const fullNameGroup = page.locator(SEL.fullName).locator('xpath=ancestor::*[contains(@class,"form-group")]').first();
    expect(await fullNameGroup.evaluate(el => el.classList.contains('has-error'))).toBe(true);
    // Type in fullName
    await page.fill(SEL.fullName, 'Test');
    // Error should be cleared for that group
    expect(await fullNameGroup.evaluate(el => el.classList.contains('has-error'))).toBe(false);
  });

  test('SUB-26: submit error -> select radio -> error cleared for that group', async ({ page }) => {
    await submitAndExpectErrors(page);
    // Select affiliation radio
    await selectRadio(page, 'affiliation', 'investor');
    // The affiliation group error should be cleared
    const affiliationGroup = page.locator('input[name="affiliation"]').first().locator('xpath=ancestor::*[contains(@class,"form-group")]').first();
    expect(await affiliationGroup.evaluate(el => el.classList.contains('has-error'))).toBe(false);
  });

  test('SUB-27: multiple errors -> fix one -> only that one cleared', async ({ page }) => {
    await submitAndExpectErrors(page);
    const errorsBefore = await getErrorCount(page);
    expect(errorsBefore).toBeGreaterThan(1);
    // Fix fullName
    await page.fill(SEL.fullName, 'Test');
    const errorsAfter = await getErrorCount(page);
    expect(errorsAfter).toBe(errorsBefore - 1);
  });

  test('SUB-28: submit errors -> re-submit without fixing -> errors cleared then re-shown (same count)', async ({ page }) => {
    await submitAndExpectErrors(page);
    const firstCount = await getErrorCount(page);
    // Re-submit
    await submitAndExpectErrors(page);
    const secondCount = await getErrorCount(page);
    expect(secondCount).toBe(firstCount);
  });

  test('SUB-29: submit errors -> window.scrollY should have changed (scrolled to first error)', async ({ page }) => {
    // Scroll to bottom first to ensure we're not at top
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const scrollBefore = await page.evaluate(() => window.scrollY);
    await submitAndExpectErrors(page);
    const scrollAfter = await page.evaluate(() => window.scrollY);
    expect(scrollAfter).not.toBe(scrollBefore);
  });
});

// ============================================
// H. Data Integrity (DAT-01 to DAT-12)
// ============================================
test.describe('H. Data Integrity', () => {
  test.beforeEach(async ({ page }) => {
    await goToForm(page);
  });

  test('DAT-01: all fields -> submit -> form_data has all keys', async ({ page }) => {
    const captured = setupSupabaseIntercept(page);
    await fillMaximumValid(page);
    await submitAndWaitSuccess(page);
    const body = captured.bodies[0];
    expect(body).toBeTruthy();
    expect(body.form_data).toBeTruthy();
    // Check key fields exist
    expect(body.form_data.affiliation).toBe('industry');
    expect(body.form_data.industryRole).toBeTruthy();
    expect(body.form_data.robotAccess).toBe('own');
    expect(body.form_data.simAccess).toBe('rtx4080_plus');
    expect(body.form_data.shareWilling).toBe('yes');
    expect(body.form_data.referralSource).toBe('other');
    expect(body.form_data.referralSourceOther).toBe('A friend');
    expect(body.form_data.robotType).toBeTruthy();
    expect(body.form_data.robotBrand).toBeTruthy();
    expect(body.form_data.useCase).toBeTruthy();
    expect(body.form_data.applications).toBeTruthy();
    expect(body.form_data.communities).toBeTruthy();
  });

  test('DAT-02: checkbox multiple (robotType humanoid+bimanual) -> form_data.robotType is array', async ({ page }) => {
    const captured = setupSupabaseIntercept(page);
    await fillMinimumRequired(page);
    await selectRadio(page, 'robotAccess', 'own');
    await checkBox(page, 'robotType', 'humanoid');
    await checkBox(page, 'robotType', 'bimanual');
    await checkBox(page, 'robotBrand', 'aloha');
    await submitAndWaitSuccess(page);
    const body = captured.bodies[0];
    expect(Array.isArray(body.form_data.robotType)).toBe(true);
    expect(body.form_data.robotType).toContain('humanoid');
    expect(body.form_data.robotType).toContain('bimanual');
  });

  test('DAT-03: checkbox single -> form_data value is string', async ({ page }) => {
    const captured = setupSupabaseIntercept(page);
    await fillMinimumRequired(page);
    await submitAndWaitSuccess(page);
    const body = captured.bodies[0];
    // useCase has single 'explore' checked, should be string
    expect(typeof body.form_data.useCase).toBe('string');
    expect(body.form_data.useCase).toBe('explore');
  });

  test('DAT-04: socialProfile empty -> social_profile is null', async ({ page }) => {
    const captured = setupSupabaseIntercept(page);
    await fillMinimumRequired(page);
    // Ensure socialProfile is empty
    await page.fill(SEL.socialProfile, '');
    await submitAndWaitSuccess(page);
    const body = captured.bodies[0];
    expect(body.social_profile).toBeNull();
  });

  test('DAT-05: Other checked + text -> form_data has both Other value and text', async ({ page }) => {
    const captured = setupSupabaseIntercept(page);
    await fillMinimumRequired(page);
    await checkBox(page, 'communities', 'other');
    await page.fill(SEL.communitiesOtherInput, 'My Community');
    await submitAndWaitSuccess(page);
    const body = captured.bodies[0];
    const communities = body.form_data.communities;
    // communities should contain 'other'
    if (Array.isArray(communities)) {
      expect(communities).toContain('other');
    } else {
      expect(communities).toBe('other');
    }
    expect(body.form_data.communitiesOther).toBe('My Community');
  });

  test('DAT-06: affiliation=industry -> fill industry+Other+text -> switch academic -> submit -> form_data should NOT have industry values', async ({ page }) => {
    const captured = setupSupabaseIntercept(page);
    await fillMinimumRequired(page);
    await selectRadio(page, 'affiliation', 'industry');
    await selectRadio(page, 'industryRole', 'rd');
    await checkBox(page, 'industry', 'manufacturing');
    await checkBox(page, 'industry', 'other');
    await page.fill(SEL.industryOtherInput, 'Robotics');
    // Switch to academic
    await selectRadio(page, 'affiliation', 'academic');
    await selectRadio(page, 'academicRole', 'professor');
    await submitAndWaitSuccess(page);
    const body = captured.bodies[0];
    // clearFieldInputs clears values but FormData still collects empty strings
    // for text inputs that were cleared. Radio groups that were unchecked won't appear.
    expect(body.form_data.industry).toBeUndefined();
    // industryOther text input is cleared to "" but still collected by FormData
    expect(body.form_data.industryOther).toBeFalsy();
    expect(body.form_data.industryRole).toBeUndefined();
  });

  test('DAT-07: hidden conditional field residual check - own -> fill type/brand -> switch interested -> submit -> no robotType/robotBrand in data', async ({ page }) => {
    const captured = setupSupabaseIntercept(page);
    await fillMinimumRequired(page);
    await selectRadio(page, 'robotAccess', 'own');
    await checkBox(page, 'robotType', 'humanoid');
    await checkBox(page, 'robotBrand', 'aloha');
    await selectRadio(page, 'robotAccess', 'interested');
    await submitAndWaitSuccess(page);
    const body = captured.bodies[0];
    expect(body.form_data.robotType).toBeUndefined();
    expect(body.form_data.robotBrand).toBeUndefined();
  });

  test('DAT-08: honeypot (website) not in form_data', async ({ page }) => {
    const captured = setupSupabaseIntercept(page);
    await fillMinimumRequired(page);
    await submitAndWaitSuccess(page);
    const body = captured.bodies[0];
    expect(body.form_data.website).toBeUndefined();
    expect(body.website).toBeUndefined();
  });

  test('DAT-09: normal submit -> POST body has email, full_name, organization, country, social_profile, form_data', async ({ page }) => {
    const captured = setupSupabaseIntercept(page);
    await fillMinimumRequired(page);
    await submitAndWaitSuccess(page);
    const body = captured.bodies[0];
    expect(body).toHaveProperty('email');
    expect(body).toHaveProperty('full_name');
    expect(body).toHaveProperty('organization');
    expect(body).toHaveProperty('country');
    expect(body).toHaveProperty('social_profile');
    expect(body).toHaveProperty('form_data');
  });

  test('DAT-10: 409 -> success UI', async ({ page }) => {
    const captured = setupSupabase409(page);
    await fillMinimumRequired(page);
    await submitAndWaitSuccess(page);
    await expect(page.locator(SEL.successMessage)).toBeVisible();
  });

  test('DAT-11: 500 -> toast error + button re-enabled', async ({ page }) => {
    const captured = setupSupabase500(page);
    await fillMinimumRequired(page);
    await submitForm(page);
    await waitForToast(page, 'error');
    const toastVisible = await isToastVisible(page);
    expect(toastVisible).toBe(true);
    await expect(page.locator(SEL.submitBtn)).toBeEnabled();
  });

  test('DAT-12: network error -> toast error + button re-enabled', async ({ page }) => {
    const captured = setupSupabaseNetworkError(page);
    await fillMinimumRequired(page);
    await submitForm(page);
    await waitForToast(page, 'error');
    const toastVisible = await isToastVisible(page);
    expect(toastVisible).toBe(true);
    await expect(page.locator(SEL.submitBtn)).toBeEnabled();
  });
});

// ============================================
// I. Anti-Spam & Rate Limit (SPM-01 to SPM-05)
// ============================================
test.describe('I. Anti-Spam & Rate Limit', () => {
  test.beforeEach(async ({ page }) => {
    await goToForm(page);
  });

  test('SPM-01: honeypot filled -> fake success, NO fetch', async ({ page }) => {
    const captured = setupSupabaseIntercept(page);
    await fillMinimumRequired(page);
    await page.locator(SEL.honeypot).evaluate(el => el.value = 'bot');
    await submitForm(page);
    await page.waitForSelector(`${SEL.successMessage}.visible`, { timeout: 5000 });
    // Fake success shown
    await expect(page.locator(SEL.successMessage)).toBeVisible();
    // No Supabase request
    expect(captured.requests.length).toBe(0);
  });

  test('SPM-02: submit -> within 3s re-submit -> toast warning', async ({ page }) => {
    const captured = setupSupabase500(page);
    await fillMinimumRequired(page);
    // First submit
    await submitForm(page);
    await waitForToast(page, 'error');
    // Re-submit quickly (within 3s)
    await submitForm(page);
    await waitForToast(page, 'warning');
  });

  test('SPM-03: after success form is hidden, cannot re-submit', async ({ page }) => {
    const captured = setupSupabaseIntercept(page);
    await fillMinimumRequired(page);
    await submitAndWaitSuccess(page);
    // Form should be hidden
    const formDisplay = await page.locator(SEL.form).evaluate(el => el.style.display);
    expect(formDisplay).toBe('none');
    // Submit button not clickable (form hidden)
    const btnVisible = await page.locator(SEL.submitBtn).isVisible();
    expect(btnVisible).toBe(false);
  });

  test('SPM-04: during submit button=disabled, text="Submitting..."', async ({ page }) => {
    const captured = setupSupabaseIntercept(page, { status: 200, delay: 2000 });
    await fillMinimumRequired(page);
    // Click submit but don't wait for success
    await page.click(SEL.submitBtn);
    // Immediately check button state
    const btn = page.locator(SEL.submitBtn);
    await expect(btn).toBeDisabled();
    await expect(btn).toHaveText('Submitting...');
  });

  test('SPM-05: after failure button re-enabled with original text', async ({ page }) => {
    const captured = setupSupabase500(page);
    await fillMinimumRequired(page);
    await submitForm(page);
    await waitForToast(page, 'error');
    const btn = page.locator(SEL.submitBtn);
    await expect(btn).toBeEnabled();
    await expect(btn).toHaveText('Join Waitlist');
  });
});

// ============================================
// J. Cross-Field (CRS-01 to CRS-09)
// ============================================
test.describe('J. Cross-Field', () => {
  test.beforeEach(async ({ page }) => {
    await goToForm(page);
  });

  test('CRS-01: minimum valid (investor/interested/no/explore/bin_picking/no/no/social) -> success', async ({ page }) => {
    const captured = setupSupabaseIntercept(page);
    await fillMinimumRequired(page);
    await submitAndWaitSuccess(page);
    expect(captured.requests.length).toBe(1);
  });

  test('CRS-02: CRS-01 + socialProfile -> success', async ({ page }) => {
    const captured = setupSupabaseIntercept(page);
    await fillMinimumRequired(page);
    await page.fill(SEL.socialProfile, 'https://x.com/testuser');
    await submitAndWaitSuccess(page);
    expect(captured.requests.length).toBe(1);
    const body = captured.bodies[0];
    expect(body.social_profile).toBe('https://x.com/testuser');
  });

  test('CRS-03: maximum valid (fillMaximumValid) -> success', async ({ page }) => {
    const captured = setupSupabaseIntercept(page);
    await fillMaximumValid(page);
    await submitAndWaitSuccess(page);
    expect(captured.requests.length).toBe(1);
  });

  test('CRS-04: chain academic->industry->startup->other->investor -> submit -> pass', async ({ page }) => {
    const captured = setupSupabaseIntercept(page);
    await fillMinimumRequired(page);
    await selectRadio(page, 'affiliation', 'academic');
    await selectRadio(page, 'academicRole', 'professor');
    await selectRadio(page, 'affiliation', 'industry');
    await selectRadio(page, 'industryRole', 'rd');
    await checkBox(page, 'industry', 'manufacturing');
    await selectRadio(page, 'affiliation', 'startup');
    await selectRadio(page, 'startupRole', 'founder');
    await selectRadio(page, 'affiliation', 'other');
    await page.fill(SEL.affiliationOtherInput, 'Custom');
    await selectRadio(page, 'affiliation', 'investor');
    await submitAndWaitSuccess(page);
    expect(captured.requests.length).toBe(1);
    const body = captured.bodies[0];
    expect(body.form_data.affiliation).toBe('investor');
  });

  test('CRS-05: robotAccess own->interested->own -> submit -> type+brand empty (cleared on interested)', async ({ page }) => {
    await fillMinimumRequired(page);
    await selectRadio(page, 'robotAccess', 'own');
    await checkBox(page, 'robotType', 'humanoid');
    await checkBox(page, 'robotBrand', 'aloha');
    await selectRadio(page, 'robotAccess', 'interested');
    await selectRadio(page, 'robotAccess', 'own');
    // After switching back to own, type+brand should be cleared
    const typeChecked = await page.locator('input[name="robotType"][value="humanoid"]').isChecked();
    expect(typeChecked).toBe(false);
    const brandChecked = await page.locator('input[name="robotBrand"][value="aloha"]').isChecked();
    expect(brandChecked).toBe(false);
  });

  test('CRS-06: shareWilling yes->no->yes -> submit -> shareType empty', async ({ page }) => {
    await fillMinimumRequired(page);
    await selectRadio(page, 'shareWilling', 'yes');
    await checkBox(page, 'shareType', 'content');
    await selectRadio(page, 'shareWilling', 'no');
    await selectRadio(page, 'shareWilling', 'yes');
    // shareType should have been cleared
    const contentChecked = await page.locator('input[name="shareType"][value="content"]').isChecked();
    expect(contentChecked).toBe(false);
  });

  test('CRS-07: academic + academicRole empty -> submit(error) -> switch investor -> submit -> pass', async ({ page }) => {
    const captured = setupSupabaseIntercept(page);
    await fillMinimumRequired(page);
    await selectRadio(page, 'affiliation', 'academic');
    // Leave academicRole empty -> error
    await submitAndExpectErrors(page);
    const errors = await getErrorCount(page);
    expect(errors).toBeGreaterThan(0);
    // Switch to investor
    await selectRadio(page, 'affiliation', 'investor');
    // Wait for rate limit cooldown
    await page.waitForTimeout(3100);
    await submitAndWaitSuccess(page);
    expect(captured.requests.length).toBe(1);
  });

  test('CRS-08: other + text empty -> submit(error) -> switch academic -> fill role -> submit -> pass', async ({ page }) => {
    const captured = setupSupabaseIntercept(page);
    await fillMinimumRequired(page);
    await selectRadio(page, 'affiliation', 'other');
    // Leave affiliationOther empty -> error
    await submitAndExpectErrors(page);
    // Switch to academic + fill role
    await selectRadio(page, 'affiliation', 'academic');
    await selectRadio(page, 'academicRole', 'professor');
    // Wait for rate limit cooldown
    await page.waitForTimeout(3100);
    await submitAndWaitSuccess(page);
    expect(captured.requests.length).toBe(1);
  });

  test('CRS-09: referralSource=other + text empty -> submit(error) -> switch social -> submit -> pass', async ({ page }) => {
    const captured = setupSupabaseIntercept(page);
    await fillMinimumRequired(page);
    await selectRadio(page, 'referralSource', 'other');
    // Leave referralSourceOther empty -> error
    await submitAndExpectErrors(page);
    // Switch to social
    await selectRadio(page, 'referralSource', 'social');
    // Wait for rate limit cooldown
    await page.waitForTimeout(3100);
    await submitAndWaitSuccess(page);
    expect(captured.requests.length).toBe(1);
  });
});
