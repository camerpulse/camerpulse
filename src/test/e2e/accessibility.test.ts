import { test, expect } from '@playwright/test';
import { AccessibilityTester, accessibilityTestSuite } from '../utils/accessibility';

test.describe('Accessibility Audits', () => {
  test.beforeEach(async ({ page }) => {
    // Inject axe-core for accessibility testing
    await page.addScriptTag({
      url: 'https://unpkg.com/axe-core@4.10.3/axe.min.js'
    });
  });

  test('should pass accessibility audit on main platform', async ({ page }) => {
    await page.goto('/');
    
    const results = await accessibilityTestSuite.testNavigationStructure(page);
    
    // Ensure no critical violations
    expect(results.overall.violations.filter((v: any) => v.impact === 'critical')).toHaveLength(0);
    
    // Expect high accessibility score
    expect(results.overall.score).toBeGreaterThan(85);
  });

  test('should pass accessibility audit on profile pages', async ({ page }) => {
    await page.goto('/profile/testuser');
    
    const results = await accessibilityTestSuite.testProfilePage(page);
    
    // Check color contrast
    expect(results.colorContrast.violations).toHaveLength(0);
    
    // Check keyboard navigation
    expect(results.keyboard.violations.filter((v: any) => v.impact === 'critical')).toHaveLength(0);
    
    // Check screen reader compatibility
    expect(results.screenReader.violations.filter((v: any) => v.impact === 'critical')).toHaveLength(0);
  });

  test('should pass accessibility audit on auth forms', async ({ page }) => {
    await page.goto('/auth');
    
    const results = await accessibilityTestSuite.testFormPage(page);
    
    // Check form accessibility
    expect(results.forms.violations.filter((v: any) => v.impact === 'critical')).toHaveLength(0);
    
    // Ensure all form inputs have proper labels
    const formInputs = await page.locator('input, select, textarea').count();
    const labeledInputs = await page.locator('input[aria-label], input[aria-labelledby], label input, select[aria-label], select[aria-labelledby], label select, textarea[aria-label], textarea[aria-labelledby], label textarea').count();
    
    expect(labeledInputs).toBe(formInputs);
  });

  test('should have proper heading structure', async ({ page }) => {
    await page.goto('/');
    
    const tester = new AccessibilityTester(page);
    const headingResults = await tester.checkHeadingStructure();
    
    // Should have no heading structure violations
    expect(headingResults.violations).toHaveLength(0);
    
    // Check that page has exactly one H1
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1);
  });

  test('should have proper ARIA implementation', async ({ page }) => {
    await page.goto('/profile/testuser');
    
    const tester = new AccessibilityTester(page);
    const ariaResults = await tester.checkARIAImplementation();
    
    // No critical ARIA violations
    expect(ariaResults.violations.filter(v => v.impact === 'critical')).toHaveLength(0);
  });

  test('should have proper link accessibility', async ({ page }) => {
    await page.goto('/');
    
    const tester = new AccessibilityTester(page);
    const linkResults = await tester.checkLinkAccessibility();
    
    // All links should have accessible names
    expect(linkResults.violations.filter(v => v.id === 'link-name')).toHaveLength(0);
  });

  test('should have proper image alternatives', async ({ page }) => {
    await page.goto('/profile/testuser');
    
    const tester = new AccessibilityTester(page);
    const imageResults = await tester.checkImageAlternatives();
    
    // All images should have alt text
    expect(imageResults.violations.filter(v => v.id === 'image-alt')).toHaveLength(0);
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/');
    
    // Test tab navigation through main navigation
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toBeVisible();
    
    // Continue tabbing and ensure focus is visible
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      const focusedElement = await page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    }
  });

  test('should support screen reader navigation landmarks', async ({ page }) => {
    await page.goto('/');
    
    // Check for proper landmark roles
    await expect(page.locator('[role="main"], main')).toBeVisible();
    await expect(page.locator('[role="navigation"], nav')).toBeVisible();
    await expect(page.locator('[role="banner"], header')).toBeVisible();
    
    // Check for skip links
    const skipLink = page.locator('a[href="#main-content"], a[href="#content"]').first();
    if (await skipLink.count() > 0) {
      await expect(skipLink).toBeVisible();
    }
  });

  test('should have sufficient color contrast', async ({ page }) => {
    await page.goto('/');
    
    const tester = new AccessibilityTester(page);
    const contrastResults = await tester.checkColorContrast();
    
    // No color contrast violations
    expect(contrastResults.violations).toHaveLength(0);
  });

  test('should work with high contrast mode', async ({ page }) => {
    // Simulate high contrast mode
    await page.emulateMedia({ colorScheme: 'dark', forcedColors: 'active' });
    await page.goto('/');
    
    // Basic functionality should still work
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('nav')).toBeVisible();
    
    // Test navigation still works
    const navLinks = page.locator('nav a');
    const linkCount = await navLinks.count();
    if (linkCount > 0) {
      await navLinks.first().click();
      // Should navigate without errors
    }
  });

  test('should handle focus management in modals', async ({ page }) => {
    await page.goto('/');
    
    // Look for modal trigger (if exists)
    const modalTrigger = page.locator('[data-testid*="modal"], [aria-haspopup="dialog"]').first();
    
    if (await modalTrigger.count() > 0) {
      await modalTrigger.click();
      
      // Focus should move to modal
      const modal = page.locator('[role="dialog"], [data-testid*="modal-content"]');
      await expect(modal).toBeVisible();
      
      // Focus should be trapped in modal
      await page.keyboard.press('Tab');
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
      
      // Escape should close modal
      await page.keyboard.press('Escape');
      await expect(modal).not.toBeVisible();
    }
  });
});

test.describe('Mobile Accessibility', () => {
  test.use({ 
    viewport: { width: 375, height: 667 }, // iPhone SE size
    isMobile: true 
  });

  test('should be accessible on mobile devices', async ({ page }) => {
    await page.goto('/');
    
    const tester = new AccessibilityTester(page);
    const results = await tester.getAccessibilityReport();
    
    // Mobile should have same accessibility standards
    expect(results.score).toBeGreaterThan(85);
    expect(results.violations.filter(v => v.impact === 'critical')).toHaveLength(0);
  });

  test('should have proper touch targets', async ({ page }) => {
    await page.goto('/');
    
    // Check that interactive elements are large enough for touch
    const buttons = page.locator('button, a, input[type="button"], input[type="submit"]');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < Math.min(buttonCount, 10); i++) {
      const button = buttons.nth(i);
      const box = await button.boundingBox();
      
      if (box) {
        // Touch targets should be at least 44x44 pixels
        expect(Math.min(box.width, box.height)).toBeGreaterThanOrEqual(44);
      }
    }
  });
});