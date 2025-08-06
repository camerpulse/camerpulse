import { test, expect } from '@playwright/test';

test.describe('User Authentication Flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should complete sign up flow', async ({ page }) => {
    // Navigate to auth page
    await page.click('[data-testid="auth-link"]');
    await expect(page).toHaveURL('/auth');

    // Fill sign up form
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'testpassword123');
    await page.click('[data-testid="signup-submit"]');

    // Should show success message or redirect
    await expect(page.locator('[data-testid="signup-success"]')).toBeVisible({ timeout: 10000 });
  });

  test('should complete sign in flow', async ({ page }) => {
    // Navigate to auth page
    await page.click('[data-testid="auth-link"]');
    await page.click('[data-testid="signin-tab"]');

    // Fill sign in form
    await page.fill('[data-testid="email-input"]', 'existing@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="signin-submit"]');

    // Should redirect to profile or dashboard
    await expect(page).toHaveURL(/\/(profile|dashboard)/);
  });

  test('should handle authentication errors gracefully', async ({ page }) => {
    await page.click('[data-testid="auth-link"]');
    
    // Try to sign in with invalid credentials
    await page.fill('[data-testid="email-input"]', 'invalid@example.com');
    await page.fill('[data-testid="password-input"]', 'wrongpassword');
    await page.click('[data-testid="signin-submit"]');

    // Should show error message
    await expect(page.locator('[data-testid="auth-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="auth-error"]')).toContainText('Invalid');
  });
});

test.describe('Profile Completion Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authenticated state
    await page.goto('/profile/testuser');
  });

  test('should guide user through profile completion', async ({ page }) => {
    // Check if profile completion indicator is visible
    await expect(page.locator('[data-testid="profile-completion"]')).toBeVisible();

    // Fill basic profile information
    await page.click('[data-testid="edit-profile"]');
    await page.fill('[data-testid="display-name-input"]', 'Test User');
    await page.fill('[data-testid="bio-input"]', 'This is a test bio');
    
    // Upload avatar (mock file upload)
    const fileInput = page.locator('[data-testid="avatar-upload"]');
    await fileInput.setInputFiles('test-avatar.jpg');
    
    // Save profile changes
    await page.click('[data-testid="save-profile"]');
    
    // Verify profile completion increased
    const completionBefore = await page.locator('[data-testid="completion-percentage"]').textContent();
    await expect(page.locator('[data-testid="completion-percentage"]')).not.toHaveText(completionBefore || '');
  });

  test('should allow switching between profile modules', async ({ page }) => {
    // Test music module
    await page.click('[data-testid="music-module-tab"]');
    await expect(page.locator('[data-testid="music-content"]')).toBeVisible();
    
    // Test jobs module
    await page.click('[data-testid="jobs-module-tab"]');
    await expect(page.locator('[data-testid="jobs-content"]')).toBeVisible();
    
    // Test marketplace module
    await page.click('[data-testid="marketplace-module-tab"]');
    await expect(page.locator('[data-testid="marketplace-content"]')).toBeVisible();
  });
});

test.describe('Navigation Between Sub-Platforms', () => {
  test('should navigate from main platform to music sub-platform', async ({ page }) => {
    await page.goto('/');
    
    // Click on music section
    await page.click('[data-testid="music-nav"]');
    await expect(page).toHaveURL('/music');
    
    // Verify music platform elements are visible
    await expect(page.locator('[data-testid="music-platform"]')).toBeVisible();
  });

  test('should maintain user session across sub-platforms', async ({ page }) => {
    // Start on main platform as authenticated user
    await page.goto('/profile/testuser');
    
    // Navigate to jobs platform
    await page.click('[data-testid="jobs-nav"]');
    await expect(page).toHaveURL('/jobs');
    
    // Verify user is still authenticated
    await expect(page.locator('[data-testid="user-avatar"]')).toBeVisible();
    
    // Navigate to marketplace
    await page.click('[data-testid="marketplace-nav"]');
    await expect(page).toHaveURL('/marketplace');
    
    // Verify user session persists
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });

  test('should handle deep linking to sub-platform profiles', async ({ page }) => {
    // Direct navigation to music artist profile
    await page.goto('/music/john-artist-123');
    await expect(page.locator('[data-testid="music-profile"]')).toBeVisible();
    
    // Direct navigation to job seeker profile
    await page.goto('/jobs/developer123-456');
    await expect(page.locator('[data-testid="job-profile"]')).toBeVisible();
    
    // Direct navigation to marketplace seller
    await page.goto('/marketplace/seller123-789');
    await expect(page.locator('[data-testid="marketplace-profile"]')).toBeVisible();
  });
});

test.describe('Protected Routes Validation', () => {
  test('should redirect unauthenticated users from protected routes', async ({ page }) => {
    // Try to access admin panel without authentication
    await page.goto('/admin');
    await expect(page).toHaveURL('/auth');
    
    // Try to access profile edit without authentication
    await page.goto('/profile/edit');
    await expect(page).toHaveURL('/auth');
    
    // Try to access user migration tool
    await page.goto('/admin/user-migration');
    await expect(page).toHaveURL('/auth');
  });

  test('should preserve intended destination after login', async ({ page }) => {
    // Try to access protected route
    await page.goto('/admin/user-migration');
    await expect(page).toHaveURL('/auth');
    
    // Sign in
    await page.fill('[data-testid="email-input"]', 'admin@example.com');
    await page.fill('[data-testid="password-input"]', 'adminpassword');
    await page.click('[data-testid="signin-submit"]');
    
    // Should redirect back to intended destination
    await expect(page).toHaveURL('/admin/user-migration');
  });

  test('should respect role-based access control', async ({ page }) => {
    // Sign in as regular user
    await page.goto('/auth');
    await page.fill('[data-testid="email-input"]', 'user@example.com');
    await page.fill('[data-testid="password-input"]', 'userpassword');
    await page.click('[data-testid="signin-submit"]');
    
    // Try to access admin-only route
    await page.goto('/admin');
    await expect(page).toHaveURL('/'); // Should redirect to home
    
    // Verify access denied message
    await expect(page.locator('[data-testid="access-denied"]')).toBeVisible();
  });
});

test.describe('URL and Permalink Validation', () => {
  test('should handle legacy URL redirects', async ({ page }) => {
    // Test legacy profile URL format
    await page.goto('/user/123');
    await expect(page).toHaveURL(/\/profile\/.+/);
    
    // Test legacy politician URL format
    await page.goto('/politician/old-format-123');
    await expect(page).toHaveURL(/\/politicians\/.+-123/);
  });

  test('should validate SEO-friendly URLs', async ({ page }) => {
    await page.goto('/politicians/john-doe-mayor-123');
    
    // Check canonical URL is set
    const canonicalLink = page.locator('link[rel="canonical"]');
    await expect(canonicalLink).toHaveAttribute('href', expect.stringContaining('/politicians/john-doe-mayor-123'));
    
    // Check meta tags are present
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', expect.stringContaining('/politicians/john-doe-mayor-123'));
  });

  test('should handle URL slug validation', async ({ page }) => {
    // Valid slug should work
    await page.goto('/profile/valid-username');
    await expect(page.locator('[data-testid="profile-content"]')).toBeVisible();
    
    // Invalid slug should redirect or show 404
    await page.goto('/profile/Invalid Username!');
    await expect(page).toHaveURL('/404');
  });
});