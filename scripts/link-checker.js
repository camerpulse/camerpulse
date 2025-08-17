#!/usr/bin/env node

/**
 * Automated link checker for CamerPulse platform
 * Validates all internal links and reports broken ones
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class LinkChecker {
  constructor() {
    this.results = {
      total: 0,
      working: 0,
      broken: 0,
      external: 0,
      links: []
    };
    this.checkedUrls = new Set();
  }

  async checkAllLinks() {
    console.log('🔍 Starting comprehensive link check for CamerPulse...\n');

    // Get all TypeScript/React files
    const files = this.getAllFiles('src', ['.tsx', '.ts']);
    
    for (const file of files) {
      await this.checkFileLinks(file);
    }

    this.generateReport();
  }

  getAllFiles(dir, extensions, fileList = []) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        this.getAllFiles(filePath, extensions, fileList);
      } else if (extensions.some(ext => file.endsWith(ext))) {
        fileList.push(filePath);
      }
    });
    
    return fileList;
  }

  async checkFileLinks(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Extract links from various patterns
    const patterns = [
      /to=["']([^"']+)["']/g,          // React Router Link to="..."
      /href=["']([^"']+)["']/g,        // Anchor href="..."
      /navigate\(["']([^"']+)["']\)/g, // navigate("...")
      /window\.location\.href\s*=\s*["']([^"']+)["']/g, // window.location.href = "..."
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const url = match[1];
        if (url && !this.checkedUrls.has(url)) {
          this.checkedUrls.add(url);
          await this.validateLink(url, filePath);
        }
      }
    }
  }

  async validateLink(url, sourceFile) {
    this.results.total++;
    
    const linkInfo = {
      url,
      sourceFile,
      status: 'unknown',
      type: 'internal'
    };

    // Skip certain patterns
    if (this.shouldSkipUrl(url)) {
      return;
    }

    try {
      if (this.isExternalUrl(url)) {
        linkInfo.type = 'external';
        this.results.external++;
        linkInfo.status = 'external';
      } else if (this.isInternalRoute(url)) {
        const isValid = await this.checkInternalRoute(url);
        linkInfo.status = isValid ? 'working' : 'broken';
        
        if (isValid) {
          this.results.working++;
        } else {
          this.results.broken++;
        }
      } else {
        linkInfo.status = 'unknown';
      }
    } catch (error) {
      linkInfo.status = 'error';
      linkInfo.error = error.message;
      this.results.broken++;
    }

    this.results.links.push(linkInfo);
  }

  shouldSkipUrl(url) {
    const skipPatterns = [
      /^mailto:/,
      /^tel:/,
      /^#/,
      /\$\{/,          // Template literals
      /\{.*\}/,        // Dynamic routes
      /^javascript:/,
      /^\w+:/,         // Other protocols
    ];

    return skipPatterns.some(pattern => pattern.test(url));
  }

  isExternalUrl(url) {
    return /^https?:\/\//.test(url);
  }

  isInternalRoute(url) {
    return url.startsWith('/') || url.startsWith('./') || url.startsWith('../');
  }

  async checkInternalRoute(url) {
    // Clean up the URL
    const cleanUrl = url.split('?')[0].split('#')[0];
    
    // List of known valid routes from the routing configuration
    const validRoutes = [
      '/',
      '/auth',
      '/login',
      '/register',
      '/civic-dashboard',
      '/feed',
      '/civic-feed',
      '/villages',
      '/fons',
      '/civic-education',
      '/politicians',
      '/senators',
      '/mps',
      '/ministers',
      '/political-parties',
      '/petitions',
      '/marketplace',
      '/jobs',
      '/messages',
      '/notifications',
      '/polls',
      '/civic-contributions',
      '/schools',
      '/hospitals',
      '/search',
      '/performance',
      '/admin',
      '/admin/dashboard',
      '/admin/priority-assessment',
      '/admin/user-migration'
    ];

    // Check exact matches
    if (validRoutes.includes(cleanUrl)) {
      return true;
    }

    // Check dynamic routes
    const dynamicRoutePatterns = [
      /^\/villages\/[^\/]+$/,
      /^\/fons\/[^\/]+$/,
      /^\/politicians\/[^\/]+$/,
      /^\/senators\/[^\/]+$/,
      /^\/mps\/[^\/]+$/,
      /^\/ministers\/[^\/]+$/,
      /^\/political-parties\/[^\/]+$/,
      /^\/petitions\/[^\/]+-\d+$/,
      /^\/marketplace\/products\/[^\/]+-\d+$/,
      /^\/marketplace\/vendors\/[^\/]+$/,
      /^\/jobs\/[^\/]+-\d+$/,
      /^\/messages\/[^\/]+$/,
      /^\/profile\/[^\/]+$/,
      /^\/u\/[^\/]+$/,
      /^\/@[^\/]+$/,
    ];

    return dynamicRoutePatterns.some(pattern => pattern.test(cleanUrl));
  }

  generateReport() {
    const brokenLinks = this.results.links.filter(link => link.status === 'broken');
    const workingPercentage = ((this.results.working / this.results.total) * 100).toFixed(1);

    console.log('📊 LINK CHECK RESULTS');
    console.log('='.repeat(50));
    console.log(`Total Links Checked: ${this.results.total}`);
    console.log(`✅ Working: ${this.results.working}`);
    console.log(`❌ Broken: ${this.results.broken}`);
    console.log(`🌐 External: ${this.results.external}`);
    console.log(`📈 Success Rate: ${workingPercentage}%`);
    console.log('');

    if (brokenLinks.length > 0) {
      console.log('❌ BROKEN LINKS FOUND:');
      console.log('-'.repeat(30));
      
      brokenLinks.forEach(link => {
        console.log(`• ${link.url}`);
        console.log(`  Source: ${link.sourceFile}`);
        if (link.error) {
          console.log(`  Error: ${link.error}`);
        }
        console.log('');
      });
    } else {
      console.log('🎉 No broken links found! All internal links are working.');
    }

    // Write detailed report to file
    const reportPath = 'link-check-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`📁 Detailed report saved to: ${reportPath}`);

    // Exit with error code if broken links found
    if (this.results.broken > 0) {
      process.exit(1);
    }
  }
}

// Run the link checker
if (require.main === module) {
  const checker = new LinkChecker();
  checker.checkAllLinks().catch(error => {
    console.error('Error running link checker:', error);
    process.exit(1);
  });
}

module.exports = LinkChecker;