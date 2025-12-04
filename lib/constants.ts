/**
 * Application-wide constants
 * Centralized configuration for consistency
 */

// Animation Durations (in milliseconds)
export const ANIMATION_DURATION = {
  FAST: 200,
  NORMAL: 300,
  SLOW: 500,
  VERY_SLOW: 1000,
} as const;

// Breakpoints (matches CSS media queries)
export const BREAKPOINTS = {
  XS: 320,
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const;

// Z-Index Layers
export const Z_INDEX = {
  DROPDOWN: 1000,
  STICKY: 1020,
  FIXED: 1030,
  MODAL_BACKDROP: 1040,
  MODAL: 1050,
  POPOVER: 1060,
  TOOLTIP: 1070,
} as const;

// Color Contrast Ratios (WCAG AA)
export const CONTRAST_RATIOS = {
  NORMAL_TEXT: 4.5,
  LARGE_TEXT: 3.0,
  UI_COMPONENTS: 3.0,
} as const;

// Feature Flags
export const FEATURES = {
  ENABLE_PARTICLES: true,
  ENABLE_3D_EFFECTS: true,
  ENABLE_ANALYTICS: false,
  ENABLE_BLOG: false,
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  CONTACT_FORM: 'https://painpal.onrender.com/api/v1/other/feedback',
  STATUS_CHECK: 'https://painpal.onrender.com/api/v1/status',
} as const;

// File Paths
export const FILE_PATHS = {
  RESUME_PDF: '/Shylesh-S-Resume.pdf',
  DATA_JSON: '/data.json',
} as const;

// Social Links
export const SOCIAL_LINKS = {
  GITHUB: 'https://github.com/shylesh128',
  LINKEDIN: 'https://www.linkedin.com/in/s-shylesh/',
  PORTFOLIO: 'https://shylesh-s.vercel.app/',
} as const;

// Skill Categories
export const SKILL_CATEGORIES = {
  FRONTEND: 'Frontend',
  BACKEND: 'Backend',
  DEVOPS: 'DevOps',
  AI_ML: 'AI/ML',
  MOBILE: 'Mobile',
  TOOLS: 'Tools',
} as const;

// Project Categories
export const PROJECT_CATEGORIES = {
  WEB: 'web',
  MOBILE: 'mobile',
  AI: 'ai',
  TOOL: 'tool',
  GAME: 'game',
} as const;

// Scroll Thresholds
export const SCROLL_THRESHOLDS = {
  BACK_TO_TOP: 300,
  STICKY_NAV: 100,
  PROGRESS_BAR: 0,
} as const;

// Performance Budgets
export const PERFORMANCE = {
  MAX_BUNDLE_SIZE: 300 * 1024, // 300KB gzipped
  MAX_IMAGE_SIZE: 500 * 1024, // 500KB
  LAZY_LOAD_THRESHOLD: 0.1, // 10% visibility
} as const;

// Debounce Delays
export const DEBOUNCE_DELAYS = {
  SEARCH: 300,
  RESIZE: 150,
  SCROLL: 100,
} as const;

// Animation Variants (Framer Motion)
export const FADE_IN_VARIANTS = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
} as const;

export const SLIDE_IN_VARIANTS = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
} as const;

export const SCALE_IN_VARIANTS = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
} as const;
