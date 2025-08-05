# CamerPulse URL Structure & SEO Guidelines

## Table of Contents
1. [URL Naming Conventions](#url-naming-conventions)
2. [Entity-Specific URL Patterns](#entity-specific-url-patterns)
3. [SEO Best Practices](#seo-best-practices)
4. [Internationalization Support](#internationalization-support)
5. [Redirect Management](#redirect-management)
6. [Technical Specifications](#technical-specifications)
7. [Implementation Examples](#implementation-examples)

## URL Naming Conventions

### Core Principles
- **Lowercase Only**: All URLs must use lowercase letters
- **Hyphen Separators**: Use hyphens (-) to separate words, never underscores or spaces
- **Descriptive & Concise**: URLs should be readable and descriptive without being overly long
- **Hierarchical Structure**: Reflect site architecture in URL structure
- **No Session IDs**: Avoid dynamic parameters in primary URLs

### General Format
```
https://camerpulse.com/{category}/{subcategory}/{identifier}
```

### Language Support
```
https://camerpulse.com/en/{category}/{identifier}  # English
https://camerpulse.com/fr/{category}/{identifier}  # French
```

## Entity-Specific URL Patterns

### 1. Political Entities

#### Politicians
```
# List pages
/politicians
/senators  
/mps
/ministers

# Individual profiles (SEO-friendly slugs)
/politicians/{last-name}-{first-name}-{unique-id}
/senators/{last-name}-{first-name}-{unique-id}
/mps/{last-name}-{first-name}-{constituency}-{id}
/ministers/{last-name}-{first-name}-{ministry}-{id}

# Examples
/politicians/biya-paul-1
/senators/muna-bernard-fonlon-12
/mps/ayah-paul-manyu-45
/ministers/ngole-philip-mines-8
```

#### Political Parties
```
/political-parties
/political-parties/{party-acronym}-{id}

# Examples
/political-parties/cpdm-1
/political-parties/sdf-2
```

### 2. Civic Institutions

#### General Structure
```
/directory/{type}
/directory/{type}/{region}
/directory/{type}/{name-slug}-{id}

# Institution types
/schools
/hospitals  
/pharmacies
/villages
/ministries
/councils
```

#### Specific Examples
```
# Schools
/schools
/schools/centre-region
/schools/government-bilingual-high-school-yaounde-145

# Hospitals
/hospitals
/hospitals/littoral-region
/hospitals/douala-general-hospital-12

# Villages
/villages
/villages/adamawa-region
/villages/ngaoundere-vina-89
```

### 3. User Profiles

#### Profile Slugs
```
# User-friendly profile URLs
/@{username}
/@{custom-slug}

# Fallback to user ID
/profile/{user-id}

# Examples
/@john-doe
/@mayor-douala
/@dr-ngozi-okonjo
/profile/a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

### 4. Content & Features

#### Petitions
```
/petitions
/petitions/{title-slug}-{id}
/petitions/create

# Examples
/petitions/stop-illegal-logging-east-cameroon-156
/petitions/improve-roads-northwest-region-298
```

#### News & Articles
```
/news
/news/{category}
/news/{title-slug}-{date}-{id}

# Examples
/news/politics
/news/new-infrastructure-project-announced-2024-01-15-789
```

#### Jobs
```
/jobs
/jobs/{category}
/jobs/{title-slug}-{company-slug}-{id}

# Examples
/jobs/engineering
/jobs/software-engineer-mtn-cameroon-456
```

#### Events
```
/events
/events/{category}
/events/{title-slug}-{date}-{id}

# Examples  
/events/conference
/events/digital-transformation-summit-2024-03-20-123
```

### 5. Administrative Areas

#### Dashboards
```
/dashboard/{feature}
/admin/{section}

# Examples
/dashboard/analytics
/dashboard/polls
/admin/users
/admin/moderation
```

## SEO Best Practices

### 1. URL Length
- **Recommended**: 50-60 characters maximum
- **Absolute Maximum**: 255 characters
- **Path Segments**: Maximum 5 levels deep

### 2. Keywords Integration
```
# Good: Descriptive and keyword-rich
/hospitals/douala-general-hospital-emergency-services

# Bad: Generic or meaningless
/hospitals/item-123
/hospitals/h1g2e3
```

### 3. Special Characters
- **Allowed**: Hyphens (-), forward slashes (/)
- **Forbidden**: Spaces, underscores, special characters (!@#$%^&*)
- **URL Encoding**: Apply proper encoding for non-ASCII characters

### 4. Canonical URLs
```html
<!-- Always specify canonical URL to prevent duplicates -->
<link rel="canonical" href="https://camerpulse.com/politicians/biya-paul-1" />
```

## Internationalization Support

### Language Detection
```
# URL-based language detection
/en/politicians/biya-paul-1
/fr/politiciens/biya-paul-1

# Subdomain approach (alternative)
en.camerpulse.com/politicians/biya-paul-1
fr.camerpulse.com/politiciens/biya-paul-1
```

### Localized Slugs
```typescript
interface LocalizedSlug {
  en: string;
  fr: string;
  id: string;
}

// Example implementation
const politicianSlugs: LocalizedSlug = {
  en: "biya-paul-1",
  fr: "biya-paul-1", // Same for proper names
  id: "pol_001"
};
```

## Redirect Management

### 301 Redirects (Permanent)
```
# Old structure → New structure
/politician/123 → /politicians/biya-paul-1
/user-profile/456 → /@john-doe
/village-info/789 → /villages/ngaoundere-vina-89
```

### URL Migration Strategy
1. **Maintain old URLs** for 6 months minimum
2. **Implement 301 redirects** to new structure
3. **Update internal links** progressively
4. **Monitor 404 errors** and add redirects as needed

### Redirect Rules Template
```javascript
const redirectRules = [
  {
    from: "/politician/:id",
    to: "/politicians/:slug",
    type: "301"
  },
  {
    from: "/user-profile/:id", 
    to: "/@:username",
    type: "301"
  }
];
```

## Technical Specifications

### Slug Generation Algorithm
```typescript
function generateSlug(title: string, id?: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special chars
    .replace(/[\s_-]+/g, '-') // Replace spaces/underscores with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    + (id ? `-${id}` : '');
}

// Examples
generateSlug("Paul Biya", "1") // → "paul-biya-1"
generateSlug("Douala General Hospital", "12") // → "douala-general-hospital-12"
```

### Duplicate Prevention
```typescript
interface SlugGeneration {
  checkUniqueness: (slug: string, type: string) => Promise<boolean>;
  generateUnique: (base: string, type: string) => Promise<string>;
}

// Implementation
async function ensureUniqueSlug(baseSlug: string, entityType: string): Promise<string> {
  let counter = 1;
  let slug = baseSlug;
  
  while (await slugExists(slug, entityType)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
}
```

## Implementation Examples

### 1. Politician Profile URL
```typescript
// Current: /politicians/:id
// Improved: /politicians/{last-name}-{first-name}-{id}

interface Politician {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
}

function getPoliticianSlug(politician: Politician): string {
  const nameSlug = `${politician.lastName}-${politician.firstName}`.toLowerCase();
  return generateSlug(nameSlug, politician.id);
}

// Usage
const politician = { id: "1", firstName: "Paul", lastName: "Biya", position: "President" };
const slug = getPoliticianSlug(politician); // "biya-paul-1"
const url = `/politicians/${slug}`;
```

### 2. Village Profile URL
```typescript
// Current: /villages/:id  
// Improved: /villages/{name}-{region}-{id}

interface Village {
  id: string;
  name: string;
  region: string;
  division: string;
}

function getVillageSlug(village: Village): string {
  const locationSlug = `${village.name}-${village.region}`;
  return generateSlug(locationSlug, village.id);
}

// Usage
const village = { id: "89", name: "Ngaoundéré", region: "Adamawa", division: "Vina" };
const slug = getVillageSlug(village); // "ngaoundere-adamawa-89"
const url = `/villages/${slug}`;
```

### 3. Institution Directory URL
```typescript
// Current: /directory/{type}/:id
// Improved: /directory/{type}/{name-slug}-{id}

interface Institution {
  id: string;
  name: string;
  type: 'hospital' | 'school' | 'pharmacy';
  region: string;
}

function getInstitutionSlug(institution: Institution): string {
  return generateSlug(institution.name, institution.id);
}

// Usage
const hospital = { 
  id: "12", 
  name: "Douala General Hospital", 
  type: "hospital", 
  region: "Littoral" 
};
const slug = getInstitutionSlug(hospital); // "douala-general-hospital-12"
const url = `/hospitals/${slug}`;
```

### 4. User Profile Slug
```typescript
// Primary: /@{username}
// Fallback: /profile/{user-id}

interface UserProfile {
  id: string;
  username?: string;
  customSlug?: string;
  displayName: string;
}

function getUserProfileUrl(profile: UserProfile): string {
  if (profile.customSlug) {
    return `/@${profile.customSlug}`;
  }
  if (profile.username) {
    return `/@${profile.username}`;
  }
  return `/profile/${profile.id}`;
}

// Usage
const user1 = { id: "123", username: "john-doe", displayName: "John Doe" };
const user2 = { id: "456", customSlug: "mayor-douala", displayName: "Mayor of Douala" };
const user3 = { id: "789", displayName: "Anonymous User" };

console.log(getUserProfileUrl(user1)); // "/@john-doe"
console.log(getUserProfileUrl(user2)); // "/@mayor-douala"  
console.log(getUserProfileUrl(user3)); // "/profile/789"
```

## Monitoring & Analytics

### URL Performance Tracking
```typescript
interface URLAnalytics {
  path: string;
  visits: number;
  bounceRate: number;
  avgTimeOnPage: number;
  conversionRate: number;
}

// Track SEO-friendly URL performance
const urlMetrics = {
  '/politicians/biya-paul-1': {
    visits: 15420,
    bounceRate: 0.35,
    avgTimeOnPage: 245,
    conversionRate: 0.12
  }
};
```

### 404 Error Monitoring
```typescript
interface URLError {
  requestedPath: string;
  referrer: string;
  timestamp: Date;
  userAgent: string;
}

// Monitor and redirect broken URLs
function handle404(error: URLError) {
  // Attempt to find similar URL
  const similarUrls = findSimilarUrls(error.requestedPath);
  
  if (similarUrls.length > 0) {
    // Suggest redirects to admin
    createRedirectSuggestion(error.requestedPath, similarUrls[0]);
  }
}
```

## Migration Checklist

### Phase 1: Planning
- [ ] Audit current URL structure
- [ ] Map old URLs to new structure  
- [ ] Create redirect rules
- [ ] Update sitemap.xml

### Phase 2: Implementation
- [ ] Implement slug generation logic
- [ ] Update routing configuration
- [ ] Add canonical URLs to all pages
- [ ] Set up 301 redirects

### Phase 3: Testing
- [ ] Test all new URLs
- [ ] Verify redirects work correctly
- [ ] Check mobile compatibility
- [ ] Validate structured data

### Phase 4: Monitoring
- [ ] Monitor 404 errors
- [ ] Track SEO performance
- [ ] Measure page load times
- [ ] Analyze user engagement

---

## Quick Reference

### URL Pattern Examples
```
# Political Entities
/politicians/biya-paul-1
/senators/muna-bernard-fonlon-12
/political-parties/cpdm-1

# Civic Institutions  
/hospitals/douala-general-hospital-12
/schools/government-bilingual-high-school-yaounde-145
/villages/ngaoundere-adamawa-89

# User Profiles
/@john-doe
/@mayor-douala
/profile/user-id-fallback

# Content
/petitions/stop-illegal-logging-east-cameroon-156
/news/new-infrastructure-project-announced-2024-01-15-789
/jobs/software-engineer-mtn-cameroon-456
```

### Implementation Priority
1. **High Priority**: Politicians, User Profiles, Institutions
2. **Medium Priority**: Petitions, News, Events  
3. **Low Priority**: Administrative pages, Internal tools

This guideline ensures CamerPulse maintains SEO-friendly, user-friendly, and technically sound URL structure across the entire platform.