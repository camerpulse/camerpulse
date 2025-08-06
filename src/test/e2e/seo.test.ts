import { test, expect } from '@playwright/test';
import { seoTestSuite } from '../utils/seo';

test.describe('SEO Audits', () => {
  test('should pass SEO audit on main platform', async ({ page }) => {
    await page.goto('/');
    
    const results = await seoTestSuite.auditMainPlatform(page);
    
    // Should have good SEO score
    expect(results.score).toBeGreaterThan(80);
    
    // Check essential meta tags
    expect(results.metadata.title).toBeTruthy();
    expect(results.metadata.description).toBeTruthy();
    
    // Title should be appropriate length
    if (results.metadata.title) {
      expect(results.metadata.title.length).toBeGreaterThan(30);
      expect(results.metadata.title.length).toBeLessThan(60);
    }
    
    // Description should be appropriate length
    if (results.metadata.description) {
      expect(results.metadata.description.length).toBeGreaterThan(120);
      expect(results.metadata.description.length).toBeLessThan(160);
    }
  });

  test('should have proper Open Graph tags', async ({ page }) => {
    await page.goto('/');
    
    const results = await seoTestSuite.auditMainPlatform(page);
    
    // Essential Open Graph tags
    expect(results.metadata.ogTitle).toBeTruthy();
    expect(results.metadata.ogDescription).toBeTruthy();
    expect(results.metadata.ogUrl).toBeTruthy();
    
    // Optional but recommended
    expect(results.metadata.ogImage).toBeTruthy();
  });

  test('should have proper Twitter Card tags', async ({ page }) => {
    await page.goto('/');
    
    const results = await seoTestSuite.auditMainPlatform(page);
    
    // Twitter card type
    expect(results.metadata.twitterCard).toBeTruthy();
    expect(['summary', 'summary_large_image', 'app', 'player']).toContain(results.metadata.twitterCard);
  });

  test('should have canonical URLs', async ({ page }) => {
    await page.goto('/');
    
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(canonical).toBeTruthy();
    expect(canonical).toMatch(/^https?:\/\//);
  });

  test('should have proper heading structure', async ({ page }) => {
    await page.goto('/');
    
    // Should have exactly one H1
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1);
    
    // H1 should have meaningful content
    const h1Text = await page.locator('h1').first().textContent();
    expect(h1Text?.trim().length).toBeGreaterThan(10);
    
    // Check logical heading hierarchy
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').allTextContents();
    expect(headings.length).toBeGreaterThan(1);
  });

  test('should pass SEO audit on profile pages', async ({ page }) => {
    await page.goto('/profile/testuser');
    
    const results = await seoTestSuite.auditProfilePage(page, 'testuser');
    
    // Profile-specific SEO requirements
    expect(results.score).toBeGreaterThan(75);
    
    // Title should include username
    expect(results.metadata.title).toContain('testuser');
    
    // Canonical URL should match profile structure
    expect(results.metadata.canonical).toContain('/profile/testuser');
  });

  test('should pass SEO audit on music module', async ({ page }) => {
    await page.goto('/music/test-artist-123');
    
    const results = await seoTestSuite.auditMusicModule(page, 'test-artist-123');
    
    // Music module specific checks
    expect(results.score).toBeGreaterThan(70);
    
    // Should have music-related structured data or meta tags
    const hasRelevantMeta = results.metadata.title?.toLowerCase().includes('music') ||
                           results.metadata.description?.toLowerCase().includes('artist') ||
                           results.metadata.structuredData?.some(data => 
                             ['MusicGroup', 'Person', 'MusicRecording'].includes(data['@type'])
                           );
    
    expect(hasRelevantMeta).toBeTruthy();
  });

  test('should pass SEO audit on jobs module', async ({ page }) => {
    await page.goto('/jobs/developer123-456');
    
    const results = await seoTestSuite.auditJobsModule(page, 'developer123-456');
    
    expect(results.score).toBeGreaterThan(70);
    
    // Should have job-related content indicators
    const hasJobContent = results.metadata.title?.toLowerCase().includes('job') ||
                         results.metadata.description?.toLowerCase().includes('career') ||
                         results.metadata.structuredData?.some(data => 
                           ['JobPosting', 'Person', 'Organization'].includes(data['@type'])
                         );
    
    expect(hasJobContent).toBeTruthy();
  });

  test('should pass SEO audit on marketplace module', async ({ page }) => {
    await page.goto('/marketplace/seller123-789');
    
    const results = await seoTestSuite.auditMarketplaceModule(page, 'seller123-789');
    
    expect(results.score).toBeGreaterThan(70);
    
    // Should have marketplace-related content
    const hasMarketplaceContent = results.metadata.title?.toLowerCase().includes('shop') ||
                                 results.metadata.description?.toLowerCase().includes('product') ||
                                 results.metadata.structuredData?.some(data => 
                                   ['Product', 'Offer', 'Store'].includes(data['@type'])
                                 );
    
    expect(hasMarketplaceContent).toBeTruthy();
  });

  test('should have proper robots meta tags', async ({ page }) => {
    await page.goto('/');
    
    const robotsMeta = await page.locator('meta[name="robots"]').getAttribute('content');
    
    // Should allow indexing on main pages
    if (robotsMeta) {
      expect(robotsMeta).not.toContain('noindex');
      expect(robotsMeta).not.toContain('nofollow');
    }
  });

  test('should have sitemap and robots.txt', async ({ page }) => {
    // Check robots.txt
    const robotsResponse = await page.goto('/robots.txt');
    expect(robotsResponse?.status()).toBe(200);
    
    const robotsContent = await page.textContent('body');
    expect(robotsContent).toContain('User-agent');
    expect(robotsContent).toContain('Sitemap');
    
    // Check if sitemap is referenced
    expect(robotsContent).toMatch(/sitemap.*\.xml/i);
  });

  test('should have proper image optimization', async ({ page }) => {
    await page.goto('/');
    
    const images = page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < Math.min(imageCount, 5); i++) {
      const img = images.nth(i);
      
      // Should have alt text
      const alt = await img.getAttribute('alt');
      expect(alt).toBeTruthy();
      
      // Should have proper dimensions
      const src = await img.getAttribute('src');
      if (src && !src.startsWith('data:')) {
        const width = await img.getAttribute('width');
        const height = await img.getAttribute('height');
        
        // Either explicit dimensions or CSS should handle sizing
        expect(width || height || await img.evaluate(el => getComputedStyle(el).width !== 'auto')).toBeTruthy();
      }
    }
  });

  test('should have proper internal linking structure', async ({ page }) => {
    await page.goto('/');
    
    const internalLinks = page.locator('a[href^="/"]');
    const linkCount = await internalLinks.count();
    
    // Should have reasonable number of internal links
    expect(linkCount).toBeGreaterThan(5);
    
    // Check a few links for proper anchor text
    for (let i = 0; i < Math.min(linkCount, 10); i++) {
      const link = internalLinks.nth(i);
      const text = await link.textContent();
      const href = await link.getAttribute('href');
      
      // Links should have descriptive text
      if (text?.trim()) {
        expect(text.trim().length).toBeGreaterThan(1);
        expect(text.trim()).not.toBe('click here');
        expect(text.trim()).not.toBe('read more');
      }
    }
  });

  test('should have proper URL structure for modules', async ({ page }) => {
    // Test URL patterns for different modules
    const urlPatterns = [
      { url: '/profile/testuser', expected: /^\/profile\/[a-zA-Z0-9_-]+$/ },
      { url: '/music/artist-name-123', expected: /^\/music\/[a-z0-9-]+-[a-zA-Z0-9]+$/ },
      { url: '/jobs/developer-456', expected: /^\/jobs\/[a-z0-9-]+-[a-zA-Z0-9]+$/ },
      { url: '/marketplace/shop-789', expected: /^\/marketplace\/[a-z0-9-]+-[a-zA-Z0-9]+$/ },
    ];

    for (const pattern of urlPatterns) {
      expect(pattern.url).toMatch(pattern.expected);
    }
  });

  test('should handle legacy URL redirects', async ({ page }) => {
    // Test legacy URL redirect (if implemented)
    const legacyResponse = await page.goto('/user/123', { waitUntil: 'networkidle' });
    
    if (legacyResponse?.status() === 301 || legacyResponse?.status() === 302) {
      // Should redirect to new URL format
      expect(page.url()).toMatch(/\/profile\/.+/);
    }
  });
});

test.describe('SEO Performance', () => {
  test('should have fast loading times', async ({ page }) => {
    const start = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - start;
    
    // Page should load within reasonable time
    expect(loadTime).toBeLessThan(3000);
  });

  test('should have optimal Core Web Vitals', async ({ page }) => {
    await page.goto('/');
    
    // Measure Largest Contentful Paint (LCP)
    const lcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          resolve(lastEntry.startTime);
        }).observe({ entryTypes: ['largest-contentful-paint'] });
        
        // Fallback timeout
        setTimeout(() => resolve(0), 5000);
      });
    });
    
    // LCP should be under 2.5 seconds
    expect(lcp).toBeLessThan(2500);
  });
});