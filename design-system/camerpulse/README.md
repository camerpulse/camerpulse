# CamerPulse Design System

A comprehensive design system for the CamerPulse civic engagement platform, built on Cameroon's national identity with modern UX principles.

## 🎨 Overview

The CamerPulse Design System provides a unified visual language and component library that enables consistent, accessible, and engaging user experiences across the platform. Our design philosophy centers on:

- **Civic Pride**: Incorporating Cameroon's flag colors and national symbols
- **Accessibility**: WCAG 2.1 AA compliance with inclusive design patterns  
- **Mobile-First**: Optimized for mobile civic engagement
- **Performance**: Static design tokens for optimal loading speeds

## 🏛️ Brand Colors

### Primary Palette
- **CamerPulse Red**: `#B9121B` - Primary brand color for main actions
- **National Green**: `#1F7D2C` - Secondary color representing growth and prosperity  
- **Pulse Yellow**: `#F59E0B` - Accent color for highlights and call-to-actions

### Cameroon Flag Colors (Exact)
- **Green**: `#007E33` - National green from the flag
- **Red**: `#C8102E` - National red from the flag
- **Yellow**: `#FFD700` - National yellow from the flag

## 📐 Design Tokens

### Typography
- **Font Family**: Inter (unified across all text)
- **Scale**: Mobile-first responsive typography
- **Weights**: 300, 400, 500, 600, 700, 800

### Spacing
- **Base Grid**: 8px system for consistent spacing
- **Touch Targets**: Minimum 44px for accessibility
- **Container Padding**: Responsive (16px mobile, 24px tablet, 32px desktop)

### Shadows
- **Elevation System**: 6 levels from subtle to prominent
- **Brand Shadows**: Color-tinted shadows using brand colors
- **Interactive States**: Hover, focus, and active shadow variations

### Border Radius
- **Soft Rounded**: 8px for buttons and inputs
- **Welcoming**: 12px for cards and containers
- **Prominent**: 16px for modals and major sections

## 🧩 Components

### Buttons
```tsx
// Primary civic action
<Button className="bg-gradient-civic">Vote Now</Button>

// Government verified action  
<Button className="bg-gradient-flag">Official Response</Button>

// Standard actions
<Button variant="primary">Submit</Button>
<Button variant="secondary">Cancel</Button>
<Button variant="outline">Learn More</Button>
```

### Badges
```tsx
// Government positions
<Badge className="bg-gradient-civic">Minister</Badge>
<Badge variant="secondary">Deputy</Badge>

// Verification status
<Badge className="bg-blue-500">Verified</Badge>
<Badge className="bg-gradient-flag">Government Verified</Badge>

// Status indicators
<Badge className="bg-green-500">Active</Badge>
<Badge className="bg-yellow-500">Pending</Badge>
```

### Alerts
```tsx
// Civic announcements
<Alert className="bg-gradient-civic text-white">
  <AlertTitle>National Update</AlertTitle>
  <AlertDescription>Important civic information...</AlertDescription>
</Alert>

// Emergency notifications
<Alert className="border-red-500 bg-red-50">
  <AlertTitle>Emergency</AlertTitle>
  <AlertDescription>Urgent civic alert...</AlertDescription>
</Alert>
```

## 🎯 Usage Guidelines

### Do's ✅
- Use semantic color tokens instead of hardcoded values
- Follow the 8px spacing grid for consistency
- Implement proper focus states for accessibility
- Use brand gradients for primary civic actions
- Maintain minimum 44px touch targets on mobile

### Don'ts ❌
- Don't use custom colors outside the design system
- Don't create new spacing values outside the grid
- Don't use animations (static design for performance)
- Don't override component styles with arbitrary values
- Don't use dark mode variants (light mode only)

## 📱 Responsive Design

The design system follows a mobile-first approach:

- **Mobile**: 320px - 640px (primary focus)
- **Tablet**: 641px - 1024px  
- **Desktop**: 1025px+ (enhanced experience)

All components automatically adapt across breakpoints with responsive utilities.

## ♿ Accessibility

### Color Contrast
- All text meets WCAG 2.1 AA standards (4.5:1 ratio minimum)
- Interactive elements have clear focus indicators
- Color is never the only means of conveying information

### Touch & Interaction
- Minimum 44px touch targets for mobile
- Keyboard navigation support across all components
- Screen reader friendly markup and ARIA labels

### Motion & Animation
- Respects `prefers-reduced-motion` settings
- Static design by default for performance
- Meaningful motion only when necessary

## 🚀 Getting Started

### Installation
```bash
npm install @camerpulse/design-system
```

### Basic Usage
```tsx
import { Button, Badge, Alert } from '@camerpulse/design-system';
import '@camerpulse/design-system/styles.css';

function MyComponent() {
  return (
    <div>
      <Button variant="primary">Civic Action</Button>
      <Badge className="bg-gradient-civic">Official</Badge>
    </div>
  );
}
```

### With Tailwind CSS
Add the design system to your `tailwind.config.js`:

```js
module.exports = {
  content: [
    './node_modules/@camerpulse/design-system/**/*.{js,ts,jsx,tsx}',
    // your other content paths
  ],
  theme: {
    extend: {
      colors: {
        primary: 'hsl(var(--primary))',
        secondary: 'hsl(var(--secondary))',
        accent: 'hsl(var(--accent))',
        // ... other design tokens
      }
    }
  }
}
```

## 📖 Documentation

### Component Library
Each component includes:
- Usage examples and code snippets
- Accessibility guidelines
- Responsive behavior documentation  
- Civic-specific variants and use cases

### Design Tokens
Comprehensive token documentation covering:
- Color systems and semantic meanings
- Typography scales and usage
- Spacing and layout patterns
- Shadow and elevation systems

## 🏛️ Civic Specific Features

### Government Badge System
Visual hierarchy for government officials:
- Ministers: Gradient civic background
- Deputies: Secondary green background  
- Mayors: Primary red background
- Councilors: Accent yellow background

### Verification System
Multi-level verification indicators:
- Blue checkmark: General verification
- Flag gradient: Government verified
- Custom badges: Role-specific verification

### Regional Support
Design tokens for Cameroon's 10 regions:
- Color-coded regional indicators
- Localized content patterns
- Cultural sensitivity considerations

## 🔄 Updates & Versioning

The design system follows semantic versioning:
- **Major**: Breaking changes to component APIs
- **Minor**: New components or non-breaking additions
- **Patch**: Bug fixes and small improvements

## 🤝 Contributing

We welcome contributions to improve the design system:

1. Follow existing code patterns and naming conventions
2. Include accessibility considerations in all changes
3. Test across mobile and desktop breakpoints
4. Document new components and patterns
5. Maintain civic design principles

## 📞 Support

For questions, issues, or contributions:
- GitHub Issues: [Design System Repository]
- Design Team: design@camerpulse.cm
- Developer Support: dev@camerpulse.cm

---

**CamerPulse Design System** - Building inclusive civic engagement through thoughtful design.
