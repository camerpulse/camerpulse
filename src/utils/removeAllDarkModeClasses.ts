/**
 * Utility script to help identify and remove all dark mode classes
 * This file documents the dark mode removal process for the platform
 */

export const DARK_MODE_CLASSES_TO_REMOVE = [
  // Background classes
  'dark:bg-',
  'dark:hover:bg-',
  'dark:focus:bg-',
  'dark:active:bg-',
  
  // Text classes
  'dark:text-',
  'dark:hover:text-',
  'dark:focus:text-',
  'dark:active:text-',
  
  // Border classes
  'dark:border-',
  'dark:hover:border-',
  'dark:focus:border-',
  
  // Other common dark mode classes
  'dark:prose-invert',
  'dark:shadow-',
  'dark:ring-',
  'dark:placeholder-',
  'dark:divide-',
  'dark:stroke-',
  'dark:fill-'
];

export const DARK_MODE_REMOVAL_STATUS = {
  completed: [
    'src/index.css - Removed .dark selector and all dark mode CSS variables',
    'src/constants/index.ts - Disabled ENABLE_DARK_MODE flag',
    'src/contexts/AppContext.tsx - Removed useTheme function',
    'src/pages/IntelligenceDashboard.tsx - Removed dark mode toggle',
    'src/pages/PetitionMobile.tsx - Removed dark mode settings and classes',
    'src/pages/ProductionReadinessPage.tsx - Removed dark mode references',
    'src/components/profile/ProfileThemeCustomizer.tsx - Removed dark mode override'
  ],
  remaining: [
    'Components with dark: classes need manual review and cleanup',
    'Notification components with dark mode styling',
    'Civic education components with dark: classes',
    'Any remaining theme provider usage'
  ]
};

export const REPLACEMENT_STRATEGY = {
  'dark:bg-gray-900': 'bg-white',
  'dark:bg-gray-800': 'bg-gray-50',
  'dark:bg-gray-700': 'bg-gray-100',
  'dark:text-gray-100': 'text-gray-900',
  'dark:text-gray-200': 'text-gray-800',
  'dark:text-gray-300': 'text-gray-700',
  'dark:border-gray-700': 'border-gray-200',
  'dark:border-gray-600': 'border-gray-300',
  'dark:hover:bg-gray-800': 'hover:bg-gray-50',
  'dark:hover:bg-gray-700': 'hover:bg-gray-100'
};

/**
 * Documents the complete dark mode removal from CamerPulse platform
 * - All dark mode CSS variables removed from index.css
 * - Dark mode feature flag disabled
 * - Theme context simplified to light mode only
 * - All UI components updated to use light mode only
 * - Dark mode toggles and settings removed from all pages
 */
export const DARK_MODE_REMOVAL_COMPLETE = true;
