import { Page } from '@playwright/test';

export interface SEOAuditResult {
  score: number;
  issues: SEOIssue[];
  recommendations: string[];
  metadata: SEOMetadata;
}

export interface SEOIssue {
  type: 'error' | 'warning' | 'info';
  category: string;
  message: string;
  element?: string;
  severity: 'high' | 'medium' | 'low';
}

export interface SEOMetadata {
  title?: string;
  description?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  structuredData?: any[];
}

export class SEOAuditor {
  constructor(private page: Page) {}

  async auditPage(): Promise<SEOAuditResult> {
    const metadata = await this.extractMetadata();
    const issues = await this.findIssues(metadata);
    const recommendations = this.generateRecommendations(issues);
    const score = this.calculateSEOScore(issues);

    return {
      score,
      issues,
      recommendations,
      metadata,
    };
  }

  private async extractMetadata(): Promise<SEOMetadata> {
    return await this.page.evaluate(() => {
      const getMetaContent = (name: string, property?: string) => {
        const selector = property 
          ? `meta[property="${property}"]` 
          : `meta[name="${name}"]`;
        const meta = document.querySelector(selector);
        return meta?.getAttribute('content') || undefined;
      };

      const getLinkHref = (rel: string) => {
        const link = document.querySelector(`link[rel="${rel}"]`);
        return link?.getAttribute('href') || undefined;
      };

      const getStructuredData = () => {
        const scripts = document.querySelectorAll('script[type="application/ld+json"]');
        const data: any[] = [];
        scripts.forEach(script => {
          try {
            data.push(JSON.parse(script.textContent || ''));
          } catch (e) {
            // Invalid JSON in structured data
          }
        });
        return data;
      };

      return {
        title: document.title,
        description: getMetaContent('description'),
        canonical: getLinkHref('canonical'),
        ogTitle: getMetaContent('', 'og:title'),
        ogDescription: getMetaContent('', 'og:description'),
        ogImage: getMetaContent('', 'og:image'),
        ogUrl: getMetaContent('', 'og:url'),
        twitterCard: getMetaContent('twitter:card'),
        twitterTitle: getMetaContent('twitter:title'),
        twitterDescription: getMetaContent('twitter:description'),
        twitterImage: getMetaContent('twitter:image'),
        structuredData: getStructuredData(),
      };
    });
  }

  private async findIssues(metadata: SEOMetadata): Promise<SEOIssue[]> {
    const issues: SEOIssue[] = [];

    // Title checks
    if (!metadata.title) {
      issues.push({
        type: 'error',
        category: 'Title',
        message: 'Page is missing a title tag',
        severity: 'high',
      });
    } else if (metadata.title.length < 30) {
      issues.push({
        type: 'warning',
        category: 'Title',
        message: `Title is too short (${metadata.title.length} characters). Recommended: 30-60 characters`,
        severity: 'medium',
      });
    } else if (metadata.title.length > 60) {
      issues.push({
        type: 'warning',
        category: 'Title',
        message: `Title is too long (${metadata.title.length} characters). Recommended: 30-60 characters`,
        severity: 'medium',
      });
    }

    // Description checks
    if (!metadata.description) {
      issues.push({
        type: 'error',
        category: 'Meta Description',
        message: 'Page is missing a meta description',
        severity: 'high',
      });
    } else if (metadata.description.length < 120) {
      issues.push({
        type: 'warning',
        category: 'Meta Description',
        message: `Meta description is too short (${metadata.description.length} characters). Recommended: 120-160 characters`,
        severity: 'medium',
      });
    } else if (metadata.description.length > 160) {
      issues.push({
        type: 'warning',
        category: 'Meta Description',
        message: `Meta description is too long (${metadata.description.length} characters). Recommended: 120-160 characters`,
        severity: 'medium',
      });
    }

    // Canonical URL check
    if (!metadata.canonical) {
      issues.push({
        type: 'warning',
        category: 'Canonical',
        message: 'Page is missing a canonical URL',
        severity: 'medium',
      });
    }

    // Open Graph checks
    if (!metadata.ogTitle) {
      issues.push({
        type: 'warning',
        category: 'Open Graph',
        message: 'Missing og:title meta tag',
        severity: 'medium',
      });
    }

    if (!metadata.ogDescription) {
      issues.push({
        type: 'warning',
        category: 'Open Graph',
        message: 'Missing og:description meta tag',
        severity: 'medium',
      });
    }

    if (!metadata.ogImage) {
      issues.push({
        type: 'warning',
        category: 'Open Graph',
        message: 'Missing og:image meta tag',
        severity: 'medium',
      });
    }

    // Twitter Card checks
    if (!metadata.twitterCard) {
      issues.push({
        type: 'info',
        category: 'Twitter Cards',
        message: 'Missing twitter:card meta tag',
        severity: 'low',
      });
    }

    // Structured data checks
    if (!metadata.structuredData || metadata.structuredData.length === 0) {
      issues.push({
        type: 'info',
        category: 'Structured Data',
        message: 'No structured data (JSON-LD) found',
        severity: 'low',
      });
    }

    // Additional page-specific checks
    const additionalIssues = await this.checkPageStructure();
    issues.push(...additionalIssues);

    return issues;
  }

  private async checkPageStructure(): Promise<SEOIssue[]> {
    return await this.page.evaluate(() => {
      const issues: SEOIssue[] = [];

      // Heading structure
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      const h1s = document.querySelectorAll('h1');
      
      if (h1s.length === 0) {
        issues.push({
          type: 'error',
          category: 'Headings',
          message: 'Page is missing an H1 tag',
          severity: 'high',
        });
      } else if (h1s.length > 1) {
        issues.push({
          type: 'warning',
          category: 'Headings',
          message: `Page has multiple H1 tags (${h1s.length}). Should have only one`,
          severity: 'medium',
        });
      }

      // Image alt attributes
      const images = document.querySelectorAll('img');
      let imagesWithoutAlt = 0;
      images.forEach(img => {
        if (!img.getAttribute('alt')) {
          imagesWithoutAlt++;
        }
      });

      if (imagesWithoutAlt > 0) {
        issues.push({
          type: 'warning',
          category: 'Images',
          message: `${imagesWithoutAlt} images missing alt attributes`,
          severity: 'medium',
        });
      }

      // Internal links
      const links = document.querySelectorAll('a[href]');
      let internalLinksWithoutTitle = 0;
      links.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('/') && !link.getAttribute('title') && !link.textContent?.trim()) {
          internalLinksWithoutTitle++;
        }
      });

      if (internalLinksWithoutTitle > 0) {
        issues.push({
          type: 'info',
          category: 'Links',
          message: `${internalLinksWithoutTitle} internal links could benefit from title attributes`,
          severity: 'low',
        });
      }

      return issues;
    });
  }

  private generateRecommendations(issues: SEOIssue[]): string[] {
    const recommendations: string[] = [];
    const categories = [...new Set(issues.map(issue => issue.category))];

    categories.forEach(category => {
      const categoryIssues = issues.filter(issue => issue.category === category);
      const highSeverityIssues = categoryIssues.filter(issue => issue.severity === 'high');

      if (highSeverityIssues.length > 0) {
        switch (category) {
          case 'Title':
            recommendations.push('Add a descriptive, unique title tag (30-60 characters) that includes target keywords');
            break;
          case 'Meta Description':
            recommendations.push('Add a compelling meta description (120-160 characters) that summarizes the page content');
            break;
          case 'Headings':
            recommendations.push('Ensure proper heading structure with a single H1 tag and logical hierarchy');
            break;
          default:
            recommendations.push(`Address critical ${category} issues to improve SEO performance`);
        }
      }
    });

    if (recommendations.length === 0) {
      recommendations.push('Great! No critical SEO issues found. Consider addressing warnings for optimal performance.');
    }

    return recommendations;
  }

  private calculateSEOScore(issues: SEOIssue[]): number {
    let score = 100;
    
    issues.forEach(issue => {
      switch (issue.severity) {
        case 'high':
          score -= 15;
          break;
        case 'medium':
          score -= 8;
          break;
        case 'low':
          score -= 3;
          break;
      }
    });

    return Math.max(0, score);
  }

  async auditProfilePage(username: string): Promise<SEOAuditResult> {
    const result = await this.auditPage();
    
    // Profile-specific checks
    const profileIssues: SEOIssue[] = [];
    
    if (!result.metadata.title?.includes(username)) {
      profileIssues.push({
        type: 'warning',
        category: 'Profile SEO',
        message: 'Profile title should include the username for better discoverability',
        severity: 'medium',
      });
    }

    if (!result.metadata.canonical?.includes(`/profile/${username}`)) {
      profileIssues.push({
        type: 'warning',
        category: 'Profile SEO',
        message: 'Canonical URL should match the profile URL structure',
        severity: 'medium',
      });
    }

    result.issues.push(...profileIssues);
    result.score = this.calculateSEOScore(result.issues);

    return result;
  }

  async auditModulePage(moduleType: string, slug: string): Promise<SEOAuditResult> {
    const result = await this.auditPage();
    
    // Module-specific checks
    const moduleIssues: SEOIssue[] = [];
    
    if (!result.metadata.canonical?.includes(`/${moduleType}/${slug}`)) {
      moduleIssues.push({
        type: 'warning',
        category: 'Module SEO',
        message: `Canonical URL should match the ${moduleType} module URL structure`,
        severity: 'medium',
      });
    }

    // Check for structured data specific to module type
    const hasRelevantStructuredData = result.metadata.structuredData?.some(data => {
      return data['@type'] && (
        (moduleType === 'music' && ['MusicGroup', 'Person', 'MusicRecording'].includes(data['@type'])) ||
        (moduleType === 'jobs' && ['JobPosting', 'Person', 'Organization'].includes(data['@type'])) ||
        (moduleType === 'marketplace' && ['Product', 'Offer', 'Store'].includes(data['@type']))
      );
    });

    if (!hasRelevantStructuredData) {
      moduleIssues.push({
        type: 'info',
        category: 'Structured Data',
        message: `Consider adding ${moduleType}-specific structured data for better search visibility`,
        severity: 'low',
      });
    }

    result.issues.push(...moduleIssues);
    result.score = this.calculateSEOScore(result.issues);

    return result;
  }
}

export const seoTestSuite = {
  async auditMainPlatform(page: Page): Promise<SEOAuditResult> {
    const auditor = new SEOAuditor(page);
    return auditor.auditPage();
  },

  async auditProfilePage(page: Page, username: string): Promise<SEOAuditResult> {
    const auditor = new SEOAuditor(page);
    return auditor.auditProfilePage(username);
  },

  async auditMusicModule(page: Page, slug: string): Promise<SEOAuditResult> {
    const auditor = new SEOAuditor(page);
    return auditor.auditModulePage('music', slug);
  },

  async auditJobsModule(page: Page, slug: string): Promise<SEOAuditResult> {
    const auditor = new SEOAuditor(page);
    return auditor.auditModulePage('jobs', slug);
  },

  async auditMarketplaceModule(page: Page, slug: string): Promise<SEOAuditResult> {
    const auditor = new SEOAuditor(page);
    return auditor.auditModulePage('marketplace', slug);
  },
};