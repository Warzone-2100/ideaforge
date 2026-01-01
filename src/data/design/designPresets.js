// ============================================================================
// DESIGN PRESETS - Default Tokens & Inspiration Options
// ============================================================================
//
// This file contains:
//   1. DEFAULT_TOKENS - Starting point for new design languages
//   2. MOOD_OPTIONS - Available mood/style tags
//   3. REFERENCE_OPTIONS - Common design reference products
//   4. PRESET_THEMES - Pre-built themes users can start from
//   5. FONT_OPTIONS - Available font families
// ============================================================================

// ==========================================================================
// DEFAULT DESIGN TOKENS
// ==========================================================================

export const DEFAULT_TOKENS = {
  colors: {
    // Primary brand color
    primary: '#6366F1',
    primaryHover: '#818CF8',

    // Secondary brand color
    secondary: '#8B5CF6',
    secondaryHover: '#A78BFA',

    // Accent for highlights, badges, notifications
    accent: '#F59E0B',
    accentHover: '#FBBF24',

    // Backgrounds
    background: '#09090B',      // Page background
    surface: '#18181B',         // Card/panel background
    surfaceHover: '#27272A',    // Hover state
    surfaceActive: '#3F3F46',   // Active/pressed state

    // Text
    text: '#FAFAFA',            // Primary text
    textSecondary: '#A1A1AA',   // Secondary text
    textMuted: '#71717A',       // Muted/disabled text

    // Borders
    border: '#27272A',          // Default border
    borderHover: '#3F3F46',     // Border on hover

    // Semantic colors
    error: '#EF4444',
    errorHover: '#F87171',
    success: '#22C55E',
    successHover: '#4ADE80',
    warning: '#F59E0B',
    warningHover: '#FBBF24',
    info: '#3B82F6',
    infoHover: '#60A5FA',
  },

  typography: {
    fontFamily: 'Inter',
    headingFont: 'Inter',
    monoFont: 'JetBrains Mono',
    baseSize: 16,
    scaleRatio: 1.25,           // Major third scale
    lineHeight: 1.5,
    headingLineHeight: 1.2,
    weights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },

  spacing: {
    base: 4,
    scale: [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128],
  },

  radii: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    '2xl': 24,
    full: 9999,
  },

  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.5)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -2px rgba(0, 0, 0, 0.5)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -4px rgba(0, 0, 0, 0.5)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
  },

  transitions: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

// ==========================================================================
// MOOD OPTIONS
// ==========================================================================

export const MOOD_OPTIONS = [
  { id: 'minimal', label: 'Minimal', description: 'Clean, simple, lots of whitespace' },
  { id: 'bold', label: 'Bold', description: 'Strong colors, high contrast, impactful' },
  { id: 'playful', label: 'Playful', description: 'Fun, colorful, rounded shapes' },
  { id: 'professional', label: 'Professional', description: 'Corporate, trustworthy, refined' },
  { id: 'dark', label: 'Dark Mode', description: 'Dark backgrounds, light text' },
  { id: 'light', label: 'Light Mode', description: 'Light backgrounds, dark text' },
  { id: 'glassmorphic', label: 'Glassmorphic', description: 'Translucent, blurred backgrounds' },
  { id: 'brutalist', label: 'Brutalist', description: 'Raw, unpolished, high contrast' },
  { id: 'retro', label: 'Retro', description: 'Vintage inspired, nostalgic' },
  { id: 'futuristic', label: 'Futuristic', description: 'Sci-fi, neon, gradients' },
  { id: 'organic', label: 'Organic', description: 'Natural, earthy, flowing shapes' },
  { id: 'geometric', label: 'Geometric', description: 'Sharp angles, structured grids' },
];

// ==========================================================================
// REFERENCE OPTIONS (Famous Products)
// ==========================================================================

export const REFERENCE_OPTIONS = [
  // Developer tools
  { id: 'linear', label: 'Linear', category: 'dev-tools', colors: ['#5E6AD2', '#2C2E33'] },
  { id: 'vercel', label: 'Vercel', category: 'dev-tools', colors: ['#000000', '#FFFFFF'] },
  { id: 'github', label: 'GitHub', category: 'dev-tools', colors: ['#24292F', '#57606A'] },
  { id: 'raycast', label: 'Raycast', category: 'dev-tools', colors: ['#FF6363', '#1A1A1A'] },
  { id: 'supabase', label: 'Supabase', category: 'dev-tools', colors: ['#3ECF8E', '#1C1C1C'] },

  // SaaS / Productivity
  { id: 'notion', label: 'Notion', category: 'saas', colors: ['#FFFFFF', '#37352F'] },
  { id: 'slack', label: 'Slack', category: 'saas', colors: ['#4A154B', '#36C5F0'] },
  { id: 'stripe', label: 'Stripe', category: 'saas', colors: ['#635BFF', '#0A2540'] },
  { id: 'figma', label: 'Figma', category: 'saas', colors: ['#F24E1E', '#1E1E1E'] },
  { id: 'framer', label: 'Framer', category: 'saas', colors: ['#0055FF', '#000000'] },

  // Consumer / Social
  { id: 'spotify', label: 'Spotify', category: 'consumer', colors: ['#1DB954', '#191414'] },
  { id: 'apple', label: 'Apple', category: 'consumer', colors: ['#000000', '#F5F5F7'] },
  { id: 'airbnb', label: 'Airbnb', category: 'consumer', colors: ['#FF5A5F', '#484848'] },
  { id: 'discord', label: 'Discord', category: 'consumer', colors: ['#5865F2', '#23272A'] },
  { id: 'twitter', label: 'X (Twitter)', category: 'consumer', colors: ['#000000', '#FFFFFF'] },
];

// ==========================================================================
// PRESET THEMES
// ==========================================================================

export const PRESET_THEMES = [
  {
    id: 'midnight-indigo',
    name: 'Midnight Indigo',
    description: 'Dark theme with indigo accents, inspired by Linear',
    mood: ['dark', 'minimal', 'professional'],
    references: ['linear'],
    tokens: {
      colors: {
        primary: '#6366F1',
        primaryHover: '#818CF8',
        secondary: '#8B5CF6',
        secondaryHover: '#A78BFA',
        accent: '#F59E0B',
        background: '#09090B',
        surface: '#18181B',
        surfaceHover: '#27272A',
        text: '#FAFAFA',
        textSecondary: '#A1A1AA',
        border: '#27272A',
      },
      typography: {
        fontFamily: 'Inter',
        headingFont: 'Inter',
      },
      radii: {
        sm: 4, md: 8, lg: 12,
      },
    },
  },
  {
    id: 'clean-slate',
    name: 'Clean Slate',
    description: 'Light, minimal theme with subtle blue accents',
    mood: ['light', 'minimal', 'professional'],
    references: ['notion', 'stripe'],
    tokens: {
      colors: {
        primary: '#2563EB',
        primaryHover: '#3B82F6',
        secondary: '#6366F1',
        secondaryHover: '#818CF8',
        accent: '#F59E0B',
        background: '#FFFFFF',
        surface: '#F9FAFB',
        surfaceHover: '#F3F4F6',
        text: '#111827',
        textSecondary: '#6B7280',
        border: '#E5E7EB',
      },
      typography: {
        fontFamily: 'Inter',
        headingFont: 'Inter',
      },
      radii: {
        sm: 6, md: 8, lg: 12,
      },
    },
  },
  {
    id: 'vercel-black',
    name: 'Vercel Black',
    description: 'High contrast black and white, Vercel inspired',
    mood: ['dark', 'minimal', 'bold'],
    references: ['vercel'],
    tokens: {
      colors: {
        primary: '#FFFFFF',
        primaryHover: '#E5E5E5',
        secondary: '#888888',
        secondaryHover: '#A3A3A3',
        accent: '#0070F3',
        background: '#000000',
        surface: '#111111',
        surfaceHover: '#1A1A1A',
        text: '#FFFFFF',
        textSecondary: '#888888',
        border: '#333333',
      },
      typography: {
        fontFamily: 'Inter',
        headingFont: 'Inter',
      },
      radii: {
        sm: 4, md: 6, lg: 8,
      },
    },
  },
  {
    id: 'emerald-dash',
    name: 'Emerald Dashboard',
    description: 'Dark theme with emerald green accents',
    mood: ['dark', 'professional'],
    references: ['supabase'],
    tokens: {
      colors: {
        primary: '#10B981',
        primaryHover: '#34D399',
        secondary: '#6366F1',
        secondaryHover: '#818CF8',
        accent: '#F59E0B',
        background: '#0F172A',
        surface: '#1E293B',
        surfaceHover: '#334155',
        text: '#F1F5F9',
        textSecondary: '#94A3B8',
        border: '#334155',
      },
      typography: {
        fontFamily: 'Inter',
        headingFont: 'Plus Jakarta Sans',
      },
      radii: {
        sm: 6, md: 8, lg: 12,
      },
    },
  },
  {
    id: 'sunset-warmth',
    name: 'Sunset Warmth',
    description: 'Warm oranges and reds on dark background',
    mood: ['dark', 'bold', 'playful'],
    references: [],
    tokens: {
      colors: {
        primary: '#F97316',
        primaryHover: '#FB923C',
        secondary: '#EF4444',
        secondaryHover: '#F87171',
        accent: '#FBBF24',
        background: '#18181B',
        surface: '#27272A',
        surfaceHover: '#3F3F46',
        text: '#FAFAFA',
        textSecondary: '#A1A1AA',
        border: '#3F3F46',
      },
      typography: {
        fontFamily: 'Inter',
        headingFont: 'Plus Jakarta Sans',
      },
      radii: {
        sm: 8, md: 12, lg: 16,
      },
    },
  },
  {
    id: 'ocean-depth',
    name: 'Ocean Depth',
    description: 'Deep blues and teals for a calm, focused feel',
    mood: ['dark', 'professional', 'minimal'],
    references: [],
    tokens: {
      colors: {
        primary: '#0EA5E9',
        primaryHover: '#38BDF8',
        secondary: '#14B8A6',
        secondaryHover: '#2DD4BF',
        accent: '#8B5CF6',
        background: '#0C1222',
        surface: '#1E293B',
        surfaceHover: '#334155',
        text: '#F1F5F9',
        textSecondary: '#94A3B8',
        border: '#334155',
      },
      typography: {
        fontFamily: 'Inter',
        headingFont: 'Inter',
      },
      radii: {
        sm: 4, md: 8, lg: 12,
      },
    },
  },
];

// ==========================================================================
// FONT OPTIONS
// ==========================================================================

export const FONT_OPTIONS = [
  // Sans-serif
  { id: 'inter', name: 'Inter', category: 'sans-serif', googleFont: true },
  { id: 'plus-jakarta', name: 'Plus Jakarta Sans', category: 'sans-serif', googleFont: true },
  { id: 'dm-sans', name: 'DM Sans', category: 'sans-serif', googleFont: true },
  { id: 'geist', name: 'Geist', category: 'sans-serif', googleFont: false },
  { id: 'satoshi', name: 'Satoshi', category: 'sans-serif', googleFont: false },
  { id: 'cabinet-grotesk', name: 'Cabinet Grotesk', category: 'sans-serif', googleFont: false },
  { id: 'manrope', name: 'Manrope', category: 'sans-serif', googleFont: true },
  { id: 'outfit', name: 'Outfit', category: 'sans-serif', googleFont: true },
  { id: 'space-grotesk', name: 'Space Grotesk', category: 'sans-serif', googleFont: true },

  // Serif
  { id: 'source-serif', name: 'Source Serif 4', category: 'serif', googleFont: true },
  { id: 'playfair', name: 'Playfair Display', category: 'serif', googleFont: true },
  { id: 'lora', name: 'Lora', category: 'serif', googleFont: true },
  { id: 'merriweather', name: 'Merriweather', category: 'serif', googleFont: true },

  // Monospace
  { id: 'jetbrains-mono', name: 'JetBrains Mono', category: 'monospace', googleFont: true },
  { id: 'fira-code', name: 'Fira Code', category: 'monospace', googleFont: true },
  { id: 'source-code-pro', name: 'Source Code Pro', category: 'monospace', googleFont: true },
  { id: 'ibm-plex-mono', name: 'IBM Plex Mono', category: 'monospace', googleFont: true },
];

// ==========================================================================
// COLOR PALETTES (for quick selection)
// ==========================================================================

export const COLOR_PALETTES = {
  primary: [
    '#6366F1', // Indigo
    '#8B5CF6', // Violet
    '#EC4899', // Pink
    '#EF4444', // Red
    '#F97316', // Orange
    '#F59E0B', // Amber
    '#22C55E', // Green
    '#14B8A6', // Teal
    '#0EA5E9', // Sky
    '#3B82F6', // Blue
  ],
  neutral: [
    '#09090B', // Zinc 950
    '#18181B', // Zinc 900
    '#27272A', // Zinc 800
    '#3F3F46', // Zinc 700
    '#52525B', // Zinc 600
    '#71717A', // Zinc 500
    '#A1A1AA', // Zinc 400
    '#D4D4D8', // Zinc 300
    '#E4E4E7', // Zinc 200
    '#FAFAFA', // Zinc 50
  ],
};

// ==========================================================================
// HELPER FUNCTIONS
// ==========================================================================

export const getPresetById = (id) => {
  return PRESET_THEMES.find(p => p.id === id) || null;
};

export const getMoodById = (id) => {
  return MOOD_OPTIONS.find(m => m.id === id) || null;
};

export const getReferenceById = (id) => {
  return REFERENCE_OPTIONS.find(r => r.id === id) || null;
};

export const getFontById = (id) => {
  return FONT_OPTIONS.find(f => f.id === id) || null;
};

export default {
  DEFAULT_TOKENS,
  MOOD_OPTIONS,
  REFERENCE_OPTIONS,
  PRESET_THEMES,
  FONT_OPTIONS,
  COLOR_PALETTES,
};
