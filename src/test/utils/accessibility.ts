import { Page } from '@playwright/test';
import { AxeResults, runAxe } from 'axe-core';

export interface AccessibilityTestOptions {
  includeTags?: string[];
  excludeTags?: string[];
  rules?: Record<string, { enabled: boolean }>;
}

export class AccessibilityTester {
  constructor(private page: Page) {}

  async runAudit(options: AccessibilityTestOptions = {}): Promise<AxeResults> {
    const axeConfig = {
      tags: options.includeTags || ['wcag2a', 'wcag2aa', 'wcag21aa'],
      exclude: options.excludeTags || [],
      rules: options.rules || {},
    };

    const results = await this.page.evaluate((config) => {
      return (window as any).axe.run(config);
    }, axeConfig);

    return results;
  }

  async checkColorContrast(): Promise<AxeResults> {
    return this.runAudit({
      includeTags: ['color-contrast'],
    });
  }

  async checkKeyboardNavigation(): Promise<AxeResults> {
    return this.runAudit({
      includeTags: ['keyboard'],
    });
  }

  async checkScreenReaderCompatibility(): Promise<AxeResults> {
    return this.runAudit({
      includeTags: ['screen-reader'],
    });
  }

  async checkFormAccessibility(): Promise<AxeResults> {
    return this.runAudit({
      includeTags: ['forms'],
    });
  }

  async checkImageAlternatives(): Promise<AxeResults> {
    return this.runAudit({
      rules: {
        'image-alt': { enabled: true },
        'object-alt': { enabled: true },
      },
    });
  }

  async checkHeadingStructure(): Promise<AxeResults> {
    return this.runAudit({
      rules: {
        'heading-order': { enabled: true },
        'page-has-heading-one': { enabled: true },
        'empty-heading': { enabled: true },
      },
    });
  }

  async checkLinkAccessibility(): Promise<AxeResults> {
    return this.runAudit({
      rules: {
        'link-name': { enabled: true },
        'link-in-text-block': { enabled: true },
      },
    });
  }

  async checkARIAImplementation(): Promise<AxeResults> {
    return this.runAudit({
      includeTags: ['aria'],
    });
  }

  async checkTableAccessibility(): Promise<AxeResults> {
    return this.runAudit({
      rules: {
        'table-fake-caption': { enabled: true },
        'td-headers-attr': { enabled: true },
        'th-has-data-cells': { enabled: true },
      },
    });
  }

  async getAccessibilityReport(): Promise<{
    violations: any[];
    passes: any[];
    incomplete: any[];
    score: number;
    summary: string;
  }> {
    const results = await this.runAudit();
    
    const score = this.calculateAccessibilityScore(results);
    const summary = this.generateSummary(results);

    return {
      violations: results.violations,
      passes: results.passes,
      incomplete: results.incomplete,
      score,
      summary,
    };
  }

  private calculateAccessibilityScore(results: AxeResults): number {
    const totalChecks = results.passes.length + results.violations.length;
    if (totalChecks === 0) return 100;
    
    const passRate = (results.passes.length / totalChecks) * 100;
    return Math.round(passRate);
  }

  private generateSummary(results: AxeResults): string {
    const violationCount = results.violations.length;
    const passCount = results.passes.length;
    const incompleteCount = results.incomplete.length;

    if (violationCount === 0) {
      return `Excellent! All ${passCount} accessibility checks passed.`;
    } else if (violationCount <= 3) {
      return `Good accessibility with ${violationCount} minor issues to address. ${passCount} checks passed.`;
    } else if (violationCount <= 10) {
      return `Fair accessibility with ${violationCount} issues found. ${passCount} checks passed.`;
    } else {
      return `Poor accessibility with ${violationCount} significant issues. ${passCount} checks passed.`;
    }
  }
}

export const accessibilityTestSuite = {
  async testProfilePage(page: Page): Promise<any> {
    const tester = new AccessibilityTester(page);
    
    return {
      overall: await tester.getAccessibilityReport(),
      colorContrast: await tester.checkColorContrast(),
      keyboard: await tester.checkKeyboardNavigation(),
      screenReader: await tester.checkScreenReaderCompatibility(),
      headings: await tester.checkHeadingStructure(),
      links: await tester.checkLinkAccessibility(),
      aria: await tester.checkARIAImplementation(),
    };
  },

  async testFormPage(page: Page): Promise<any> {
    const tester = new AccessibilityTester(page);
    
    return {
      overall: await tester.getAccessibilityReport(),
      forms: await tester.checkFormAccessibility(),
      colorContrast: await tester.checkColorContrast(),
      keyboard: await tester.checkKeyboardNavigation(),
    };
  },

  async testNavigationStructure(page: Page): Promise<any> {
    const tester = new AccessibilityTester(page);
    
    return {
      overall: await tester.getAccessibilityReport(),
      headings: await tester.checkHeadingStructure(),
      links: await tester.checkLinkAccessibility(),
      keyboard: await tester.checkKeyboardNavigation(),
      aria: await tester.checkARIAImplementation(),
    };
  },
};