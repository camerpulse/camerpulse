/**
 * CamerPulse Application Constants
 * Central location for all application constants
 */

// === APPLICATION CONFIG ===
export const APP_CONFIG = {
  name: 'CamerPulse',
  version: '2.0.0',
  description: 'The Civic Platform for Cameroon',
  url: 'https://camerpulse.com',
  supportEmail: 'support@camerpulse.com',
  maxFileSize: 10 * 1024 * 1024, // 10MB
  defaultPageSize: 20,
  maxSearchResults: 100,
} as const;

// === CAMEROON REGIONS ===
export const CAMEROON_REGIONS = [
  'Adamawa',
  'Centre',
  'East',
  'Far North',
  'Littoral',
  'North',
  'Northwest',
  'South',
  'Southwest',
  'West',
] as const;

export type CameroonRegion = typeof CAMEROON_REGIONS[number];

// === LANGUAGES ===
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'bm', name: 'Bamoun', flag: '🏛️' },
  { code: 'ff', name: 'Fulfulde', flag: '🌾' },
] as const;

// === POLITICAL ROLES ===
export const POLITICAL_ROLES = {
  PRESIDENT: 'President',
  PRIME_MINISTER: 'Prime Minister',
  MINISTER: 'Minister',
  DEPUTY_MINISTER: 'Deputy Minister',
  SENATOR: 'Senator',
  MP: 'Member of Parliament',
  MAYOR: 'Mayor',
  COUNCIL_MEMBER: 'Council Member',
  TRADITIONAL_RULER: 'Traditional Ruler',
  FON: 'Fon',
  CHIEF: 'Village Chief',
} as const;

// === POLITICAL PARTIES ===
export const MAJOR_POLITICAL_PARTIES = [
  'CPDM', // Cameroon People\'s Democratic Movement
  'SDF', // Social Democratic Front
  'UNDP', // National Union for Democracy and Progress
  'CDU', // Cameroon Democratic Union
  'UPC', // Union of the Peoples of Cameroon
  'FSNC', // Front for the National Salvation of Cameroon
  'MRC', // Cameroon Renaissance Movement
  'Independent',
  'Other',
] as const;

// === JOB CATEGORIES ===
export const JOB_CATEGORIES = [
  'Technology',
  'Healthcare',
  'Education',
  'Finance',
  'Agriculture',
  'Construction',
  'Manufacturing',
  'Transportation',
  'Tourism',
  'Energy',
  'Mining',
  'Telecommunications',
  'Media',
  'Legal',
  'Government',
  'NGO',
  'Other',
] as const;

// === EXPERIENCE LEVELS ===
export const EXPERIENCE_LEVELS = [
  { value: 'entry', label: 'Entry Level (0-1 years)', min: 0, max: 1 },
  { value: 'junior', label: 'Junior (1-3 years)', min: 1, max: 3 },
  { value: 'mid', label: 'Mid Level (3-5 years)', min: 3, max: 5 },
  { value: 'senior', label: 'Senior (5-10 years)', min: 5, max: 10 },
  { value: 'executive', label: 'Executive (10+ years)', min: 10, max: 999 },
] as const;

// === JOB TYPES ===
export const JOB_TYPES = [
  { value: 'full_time', label: 'Full Time' },
  { value: 'part_time', label: 'Part Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
  { value: 'freelance', label: 'Freelance' },
] as const;

// === RATING SCALES ===
export const RATING_SCALES = {
  PERFORMANCE: {
    min: 0,
    max: 100,
    labels: {
      0: 'Poor',
      25: 'Below Average',
      50: 'Average',
      75: 'Good',
      100: 'Excellent',
    },
  },
  TRANSPARENCY: {
    min: 0,
    max: 10,
    labels: {
      0: 'Not Transparent',
      5: 'Moderately Transparent',
      10: 'Very Transparent',
    },
  },
  SATISFACTION: {
    min: 1,
    max: 5,
    labels: {
      1: 'Very Dissatisfied',
      2: 'Dissatisfied',
      3: 'Neutral',
      4: 'Satisfied',
      5: 'Very Satisfied',
    },
  },
} as const;

// === FILE TYPES ===
export const ALLOWED_FILE_TYPES = {
  IMAGE: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  DOCUMENT: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  AUDIO: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
  VIDEO: ['video/mp4', 'video/webm', 'video/ogg'],
} as const;

// === API ENDPOINTS ===
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    PROFILE: '/auth/profile',
  },
  POLITICIANS: {
    LIST: '/politicians',
    DETAIL: '/politicians/:id',
    SEARCH: '/politicians/search',
  },
  JOBS: {
    LIST: '/jobs',
    DETAIL: '/jobs/:id',
    SEARCH: '/jobs/search',
    APPLY: '/jobs/:id/apply',
  },
  VILLAGES: {
    LIST: '/villages',
    DETAIL: '/villages/:id',
    SEARCH: '/villages/search',
  },
  POLLS: {
    LIST: '/polls',
    DETAIL: '/polls/:id',
    VOTE: '/polls/:id/vote',
    RESULTS: '/polls/:id/results',
  },
} as const;

// === STATUS CODES ===
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// === ERROR MESSAGES ===
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You need to log in to access this resource.',
  FORBIDDEN: 'You don\'t have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'Something went wrong. Please try again later.',
  FILE_TOO_LARGE: 'File size exceeds the maximum allowed limit.',
  INVALID_FILE_TYPE: 'File type is not supported.',
} as const;

// === SUCCESS MESSAGES ===
export const SUCCESS_MESSAGES = {
  PROFILE_UPDATED: 'Profile updated successfully!',
  PASSWORD_CHANGED: 'Password changed successfully!',
  EMAIL_VERIFIED: 'Email verified successfully!',
  DATA_SAVED: 'Data saved successfully!',
  FILE_UPLOADED: 'File uploaded successfully!',
  MESSAGE_SENT: 'Message sent successfully!',
  VOTE_SUBMITTED: 'Vote submitted successfully!',
} as const;

// === PAGINATION ===
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const;

// === CACHE DURATION ===
export const CACHE_DURATION = {
  SHORT: 5 * 60 * 1000, // 5 minutes
  MEDIUM: 30 * 60 * 1000, // 30 minutes
  LONG: 24 * 60 * 60 * 1000, // 24 hours
  WEEK: 7 * 24 * 60 * 60 * 1000, // 1 week
} as const;

// === BREAKPOINTS ===
export const BREAKPOINTS = {
  XS: 375,
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  XXL: 1536,
} as const;

// === ANIMATION DURATIONS ===
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  VERY_SLOW: 1000,
} as const;

// === LOCAL STORAGE KEYS ===
export const STORAGE_KEYS = {
  THEME: 'camerpulse_theme',
  LANGUAGE: 'camerpulse_language',
  USER_PREFERENCES: 'camerpulse_user_preferences',
  RECENT_SEARCHES: 'camerpulse_recent_searches',
  DRAFT_MESSAGES: 'camerpulse_draft_messages',
} as const;

// === NOTIFICATION TYPES ===
export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
} as const;

// === CIVIC CATEGORIES ===
export const CIVIC_CATEGORIES = {
  EDUCATION: 'education',
  HEALTHCARE: 'healthcare',
  INFRASTRUCTURE: 'infrastructure',
  ENVIRONMENT: 'environment',
  SECURITY: 'security',
  ECONOMY: 'economy',
  GOVERNANCE: 'governance',
  CULTURE: 'culture',
} as const;

// === SOCIAL MEDIA PLATFORMS ===
export const SOCIAL_PLATFORMS = [
  { name: 'Facebook', icon: 'facebook', baseUrl: 'https://facebook.com/' },
  { name: 'Twitter', icon: 'twitter', baseUrl: 'https://twitter.com/' },
  { name: 'Instagram', icon: 'instagram', baseUrl: 'https://instagram.com/' },
  { name: 'LinkedIn', icon: 'linkedin', baseUrl: 'https://linkedin.com/in/' },
  { name: 'WhatsApp', icon: 'whatsapp', baseUrl: 'https://wa.me/' },
  { name: 'Telegram', icon: 'telegram', baseUrl: 'https://t.me/' },
] as const;

// === VALIDATION RULES ===
export const VALIDATION_RULES = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^\+?[1-9]\d{1,14}$/,
  PASSWORD_MIN_LENGTH: 8,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 30,
  BIO_MAX_LENGTH: 500,
  TITLE_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 2000,
} as const;

// === FEATURE FLAGS ===
export const FEATURE_FLAGS = {
  ENABLE_DARK_MODE: true,
  ENABLE_NOTIFICATIONS: true,
  ENABLE_ANALYTICS: true,
  ENABLE_PWA: true,
  ENABLE_OFFLINE_MODE: true,
  ENABLE_CHAT: true,
  ENABLE_POLLS: true,
  ENABLE_EVENTS: true,
  ENABLE_MARKETPLACE: true,
} as const;