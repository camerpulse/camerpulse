/**
 * CamerPulse Design System Enforcer
 * 
 * Automatically enforces design system compliance across the platform
 */

// Note: These would import from the actual design system files when available
// For now we'll use mock implementations to avoid build errors
const mockDesignSystemImports = {
  buttonVariants: {},
  badgeVariants: {},
  alertVariants: {},
  formVariants: {},
  modalVariants: {},
  loadingVariants: {},
  colors: {},
  spacing: {},
  typography: {},
  shadows: {},
  borders: {}
};

export interface DesignViolation {
  file: string;
  line: number;
  type: 'hardcoded-color' | 'hardcoded-spacing' | 'hardcoded-typography' | 'missing-responsive' | 'deprecated-component';
  severity: 'error' | 'warning' | 'info';
  message: string;
  suggestion: string;
}

export interface ComponentUsage {
  component: string;
  file: string;
  usageCount: number;
  isCompliant: boolean;
  violations: DesignViolation[];
}

export interface DesignSystemMetrics {
  totalComponents: number;
  compliantComponents: number;
  violations: DesignViolation[];
  tokenUsage: {
    colors: { [key: string]: number };
    spacing: { [key: string]: number };
    typography: { [key: string]: number };
  };
  responsiveCompliance: number;
  lastScanDate: Date;
}

export class DesignSystemEnforcer {
  private violationPatterns = [
    // Hardcoded colors
    { pattern: /className="[^"]*text-white[^"]*"/, type: 'hardcoded-color', suggestion: 'Use text-primary-foreground or design system tokens' },
    { pattern: /className="[^"]*bg-white[^"]*"/, type: 'hardcoded-color', suggestion: 'Use bg-background or design system tokens' },
    { pattern: /className="[^"]*text-black[^"]*"/, type: 'hardcoded-color', suggestion: 'Use text-foreground or design system tokens' },
    { pattern: /className="[^"]*bg-black[^"]*"/, type: 'hardcoded-color', suggestion: 'Use bg-primary or design system tokens' },
    { pattern: /className="[^"]*border-\w+-\d+[^"]*"/, type: 'hardcoded-color', suggestion: 'Use semantic border colors like border-primary' },
    
    // Hardcoded spacing
    { pattern: /className="[^"]*p-\d+[^"]*"/, type: 'hardcoded-spacing', suggestion: 'Use design system spacing tokens' },
    { pattern: /className="[^"]*m-\d+[^"]*"/, type: 'hardcoded-spacing', suggestion: 'Use design system spacing tokens' },
    { pattern: /className="[^"]*px-\d+[^"]*"/, type: 'hardcoded-spacing', suggestion: 'Use design system spacing tokens' },
    { pattern: /className="[^"]*py-\d+[^"]*"/, type: 'hardcoded-spacing', suggestion: 'Use design system spacing tokens' },
    
    // Hardcoded typography
    { pattern: /className="[^"]*text-\d+xl[^"]*"/, type: 'hardcoded-typography', suggestion: 'Use design system typography tokens' },
    { pattern: /className="[^"]*font-\w+[^"]*"/, type: 'hardcoded-typography', suggestion: 'Use design system font tokens' },
    
    // Missing responsive classes
    { pattern: /w-\d+(?!\s)/, type: 'missing-responsive', suggestion: 'Add responsive classes like sm:w-auto md:w-full' },
  ];

  private componentPatterns = [
    'Button',
    'Card',
    'Modal', 
    'Badge',
    'Input',
    'Select',
    'Textarea'
  ];

  scanFile(content: string, filePath: string): DesignViolation[] {
    const violations: DesignViolation[] = [];
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      this.violationPatterns.forEach(pattern => {
        if (pattern.pattern.test(line)) {
          violations.push({
            file: filePath,
            line: index + 1,
            type: pattern.type as any,
            severity: this.getSeverity(pattern.type),
            message: `${pattern.type} detected: ${line.trim()}`,
            suggestion: pattern.suggestion
          });
        }
      });
    });

    return violations;
  }

  private getSeverity(type: string): 'error' | 'warning' | 'info' {
    switch (type) {
      case 'hardcoded-color':
      case 'hardcoded-spacing':
        return 'error';
      case 'hardcoded-typography':
      case 'missing-responsive':
        return 'warning';
      default:
        return 'info';
    }
  }

  generateAutoFix(violation: DesignViolation): string {
    switch (violation.type) {
      case 'hardcoded-color':
        return this.fixHardcodedColors(violation.message);
      case 'hardcoded-spacing':
        return this.fixHardcodedSpacing(violation.message);
      case 'hardcoded-typography':
        return this.fixHardcodedTypography(violation.message);
      default:
        return violation.suggestion;
    }
  }

  private fixHardcodedColors(message: string): string {
    const colorMappings = {
      'text-white': 'text-primary-foreground',
      'bg-white': 'bg-background',
      'text-black': 'text-foreground',
      'bg-black': 'bg-primary',
      'text-gray-500': 'text-muted-foreground',
      'bg-gray-100': 'bg-muted',
      'text-red-500': 'text-destructive',
      'bg-red-500': 'bg-destructive',
      'text-green-500': 'text-cm-green',
      'bg-green-500': 'bg-cm-green',
      'text-yellow-500': 'text-cm-yellow',
      'bg-yellow-500': 'bg-cm-yellow',
    };

    let fixed = message;
    Object.entries(colorMappings).forEach(([hardcoded, semantic]) => {
      fixed = fixed.replace(new RegExp(hardcoded, 'g'), semantic);
    });

    return fixed;
  }

  private fixHardcodedSpacing(message: string): string {
    const spacingMappings = {
      'p-1': 'p-space-xs',
      'p-2': 'p-space-sm', 
      'p-4': 'p-space-md',
      'p-6': 'p-space-lg',
      'p-8': 'p-space-xl',
      'm-1': 'm-space-xs',
      'm-2': 'm-space-sm',
      'm-4': 'm-space-md',
      'm-6': 'm-space-lg',
      'm-8': 'm-space-xl',
    };

    let fixed = message;
    Object.entries(spacingMappings).forEach(([hardcoded, semantic]) => {
      fixed = fixed.replace(new RegExp(hardcoded, 'g'), semantic);
    });

    return fixed;
  }

  private fixHardcodedTypography(message: string): string {
    const typographyMappings = {
      'text-xs': 'text-typography-xs',
      'text-sm': 'text-typography-sm',
      'text-base': 'text-typography-base',
      'text-lg': 'text-typography-lg',
      'text-xl': 'text-typography-xl',
      'text-2xl': 'text-typography-2xl',
      'text-3xl': 'text-typography-3xl',
      'font-normal': 'font-typography-normal',
      'font-medium': 'font-typography-medium',
      'font-semibold': 'font-typography-semibold',
      'font-bold': 'font-typography-bold',
    };

    let fixed = message;
    Object.entries(typographyMappings).forEach(([hardcoded, semantic]) => {
      fixed = fixed.replace(new RegExp(hardcoded, 'g'), semantic);
    });

    return fixed;
  }

  analyzeComponentUsage(content: string, filePath: string): ComponentUsage[] {
    const usage: ComponentUsage[] = [];
    
    this.componentPatterns.forEach(component => {
      const regex = new RegExp(`<${component}[^>]*>`, 'g');
      const matches = content.match(regex) || [];
      
      if (matches.length > 0) {
        const violations = this.scanFile(content, filePath);
        usage.push({
          component,
          file: filePath,
          usageCount: matches.length,
          isCompliant: violations.filter(v => v.severity === 'error').length === 0,
          violations: violations.filter(v => v.message.includes(component))
        });
      }
    });

    return usage;
  }

  generateComplianceReport(files: { path: string; content: string }[]): DesignSystemMetrics {
    const allViolations: DesignViolation[] = [];
    const tokenUsage = { colors: {}, spacing: {}, typography: {} };
    let totalComponents = 0;
    let compliantComponents = 0;

    files.forEach(file => {
      const violations = this.scanFile(file.content, file.path);
      allViolations.push(...violations);

      const usage = this.analyzeComponentUsage(file.content, file.path);
      totalComponents += usage.length;
      compliantComponents += usage.filter(u => u.isCompliant).length;

      // Analyze token usage
      this.analyzeTokenUsage(file.content, tokenUsage);
    });

    const responsiveCompliance = this.calculateResponsiveCompliance(files);

    return {
      totalComponents,
      compliantComponents,
      violations: allViolations,
      tokenUsage,
      responsiveCompliance,
      lastScanDate: new Date()
    };
  }

  private analyzeTokenUsage(content: string, usage: any): void {
    // Track semantic color usage
    const semanticColors = ['primary', 'secondary', 'accent', 'muted', 'destructive', 'cm-green', 'cm-red', 'cm-yellow'];
    semanticColors.forEach(color => {
      const matches = content.match(new RegExp(`(text-${color}|bg-${color}|border-${color})`, 'g'));
      if (matches) {
        usage.colors[color] = (usage.colors[color] || 0) + matches.length;
      }
    });

    // Track spacing token usage  
    const spacingTokens = ['space-xs', 'space-sm', 'space-md', 'space-lg', 'space-xl'];
    spacingTokens.forEach(space => {
      const matches = content.match(new RegExp(`(p-${space}|m-${space})`, 'g'));
      if (matches) {
        usage.spacing[space] = (usage.spacing[space] || 0) + matches.length;
      }
    });

    // Track typography token usage
    const typographyTokens = ['typography-xs', 'typography-sm', 'typography-base', 'typography-lg', 'typography-xl'];
    typographyTokens.forEach(typo => {
      const matches = content.match(new RegExp(`text-${typo}`, 'g'));
      if (matches) {
        usage.typography[typo] = (usage.typography[typo] || 0) + matches.length;
      }
    });
  }

  private calculateResponsiveCompliance(files: { path: string; content: string }[]): number {
    let totalChecks = 0;
    let compliantChecks = 0;

    files.forEach(file => {
      const widthClasses = file.content.match(/w-\d+/g) || [];
      totalChecks += widthClasses.length;

      widthClasses.forEach(widthClass => {
        const context = this.getClassContext(file.content, widthClass);
        if (context.includes('sm:') || context.includes('md:') || context.includes('lg:')) {
          compliantChecks++;
        }
      });
    });

    return totalChecks > 0 ? (compliantChecks / totalChecks) * 100 : 100;
  }

  private getClassContext(content: string, className: string): string {
    const index = content.indexOf(className);
    const start = Math.max(0, index - 100);
    const end = Math.min(content.length, index + 100);
    return content.slice(start, end);
  }

  generateAutomationRules(): string {
    return `
// Auto-generated design system enforcement rules
module.exports = {
  rules: {
    'no-hardcoded-colors': {
      pattern: /className="[^"]*(?:text|bg|border)-(?:white|black|gray-\\d+|red-\\d+|blue-\\d+)[^"]*"/,
      message: 'Use semantic color tokens from the design system',
      autofix: true
    },
    'require-responsive-classes': {
      pattern: /w-\\d+(?!.*(?:sm:|md:|lg:))/,
      message: 'Add responsive breakpoint classes',
      autofix: false
    },
    'use-component-library': {
      components: ['Button', 'Card', 'Modal', 'Badge'],
      message: 'Use CamerPulse component library instead of custom implementations',
      autofix: false
    }
  }
};`;
  }
}

export const designSystemEnforcer = new DesignSystemEnforcer();