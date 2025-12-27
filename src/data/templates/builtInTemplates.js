/**
 * Built-in Template Library
 *
 * Pre-curated, high-quality templates that ship with IdeaForge.
 * Users can select these instantly without uploading/analyzing.
 */

export const BUILT_IN_TEMPLATES = [
  {
    id: 'nexus-os-enterprise',
    name: 'NEXUS//OS',
    category: 'landing',
    description: 'Enterprise AI infrastructure landing page with advanced interactions',
    tags: ['dark', 'enterprise', 'ai', 'tech', 'interactive', 'premium'],
    source: 'built-in',

    // Pre-analyzed structure (what the AI will use to generate)
    analysis: {
      layout: 'full-screen hero + sticky nav + bento grid + sticky scroll sections + pricing table + footer',

      components: [
        'Fixed navigation with glassmorphism',
        'Full-screen hero with 3D background',
        'Animated marquee banner',
        'Bento grid with varied card sizes (2x2, 1x1, 2x1)',
        'Code terminal with syntax highlighting',
        'Sticky scroll pipeline section',
        'Pricing cards with hover effects',
        'Email capture footer'
      ],

      colorPalette: {
        primary: '#FF3B00', // Accent orange/red
        secondary: '#FFFFFF',
        accent: '#FF3B00',
        background: '#050505', // Deep black
        surface: '#0F0F0F',
        text: '#E0E0E0',
        muted: '#808080'
      },

      typography: {
        style: 'Sans-serif + Display + Mono',
        families: {
          body: 'Inter',
          display: 'Space Grotesk',
          mono: 'JetBrains Mono'
        },
        weight: 'Light to Bold range (300-700)',
        feel: 'Technical, professional, futuristic'
      },

      spacing: 'Generous - large padding, breathing room',

      mood: 'Professional, technical, cutting-edge, enterprise, dark, futuristic',

      patterns: [
        'Spotlight card effect (mouse-tracking glow)',
        'Magnetic buttons (follow cursor)',
        'Text scramble animation on scroll',
        'Liquid scroll skew effect',
        'Glassmorphism panels',
        'Scan line animations',
        'Noise overlay texture',
        'Smooth scroll physics (Lenis)',
        'Scroll-triggered fade animations (GSAP)',
        'Counter animations',
        'Marquee scrolling text',
        'Animated bar charts',
        'Pulsing status indicators',
        'Gradient borders on hover',
        'Dot grid backgrounds'
      ],

      libraries: [
        'Tailwind CSS (with custom config)',
        'GSAP (GreenSock Animation Platform)',
        'ScrollTrigger (GSAP plugin)',
        'Lenis (smooth scroll)',
        'Unicorn Studio (3D background)'
      ],

      gridSystem: 'Bento grid (CSS Grid with varied spans)',
      responsiveness: 'Desktop-first with mobile breakpoints',

      referenceProducts: [
        'Linear (clean, minimal, fast)',
        'Vercel (dark mode, developer-focused)',
        'Stripe (professional, data-dense)',
        'Apple (bold typography, smooth interactions)'
      ],

      interactionPatterns: [
        {
          name: 'Spotlight Cards',
          description: 'Mouse-tracking radial gradient that follows cursor over cards',
          implementation: 'CSS custom properties + JavaScript mousemove listener'
        },
        {
          name: 'Magnetic Buttons',
          description: 'Buttons slightly move toward cursor on hover',
          implementation: 'GSAP animations on mousemove'
        },
        {
          name: 'Text Scramble',
          description: 'Text decodes from random characters on scroll into view',
          implementation: 'Custom JavaScript class with IntersectionObserver'
        },
        {
          name: 'Liquid Scroll Skew',
          description: 'Sections skew slightly based on scroll velocity',
          implementation: 'Lenis scroll physics + transform skewY'
        },
        {
          name: 'Smooth Scroll',
          description: 'Physics-based smooth scrolling',
          implementation: 'Lenis library with lerp interpolation'
        }
      ],

      // Sections breakdown
      sections: [
        {
          name: 'Navigation',
          type: 'fixed-header',
          features: ['Logo', 'Nav links', 'Status indicator', 'CTA button', 'Glassmorphism background']
        },
        {
          name: 'Hero',
          type: 'full-screen',
          features: ['3D background (Unicorn Studio)', 'Version badge', 'Large display typography', 'Dual CTAs', 'Gradient overlays']
        },
        {
          name: 'Marquee',
          type: 'full-width-strip',
          features: ['Partner logos', 'Infinite scroll animation', 'Hover color change']
        },
        {
          name: 'Bento Features',
          type: 'bento-grid',
          features: ['Varied card sizes', 'Spotlight effects', 'Real-time metrics', 'Animated charts', 'Status indicators', 'Code snippets']
        },
        {
          name: 'Developer Section',
          type: 'two-column',
          features: ['Text + numbered steps', 'Code terminal with syntax highlighting', 'Gradient glow on hover']
        },
        {
          name: 'Pipeline Section',
          type: 'sticky-scroll',
          features: ['Sticky visual on left', 'Scrollable text steps on right', 'Fade in/out on scroll', 'Animated orbital diagram']
        },
        {
          name: 'Pricing',
          type: 'three-column-grid',
          features: ['Free/Pro/Enterprise tiers', 'Highlighted popular tier', 'Hover spotlight effects']
        },
        {
          name: 'Footer',
          type: 'full-width',
          features: ['Email capture', 'Link columns', 'Copyright info', 'Giant background text']
        }
      ],

      // Key technical details for AI to replicate
      technicalDetails: {
        animations: {
          'spin-slow': '15s linear infinite',
          'reverse-spin': '20s linear infinite reverse',
          'marquee': '30s linear infinite',
          'scan': '4s linear infinite',
          'blink': '2s ease-in-out infinite',
          'pulse-fast': '1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite'
        },

        glassmorphism: {
          background: 'rgba(10, 10, 10, 0.8)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.08)'
        },

        spotlightEffect: {
          beforeLayer: 'radial-gradient(800px circle at mouse, rgba(255,255,255,0.04), transparent 40%)',
          afterLayer: 'radial-gradient(600px circle at mouse, rgba(255, 59, 0, 0.3), transparent 40%)',
          trigger: 'hover'
        },

        scrollPhysics: {
          library: 'Lenis',
          lerp: 0.1,
          smooth: true,
          direction: 'vertical'
        }
      }
    },

    // Template preview thumbnail (we'll add this later - for now use placeholder)
    thumbnail: null, // Will be base64 screenshot or URL

    // Metadata
    createdAt: '2025-12-27T00:00:00.000Z',
    updatedAt: '2025-12-27T00:00:00.000Z',
    version: '1.0.0',

    // Usage stats (optional)
    stats: {
      timesUsed: 0,
      avgGenerationCost: 0.08 // Claude Sonnet cost estimate
    }
  }

  // More templates will be added here:
  // - Linear-style minimal landing
  // - Stripe-style data dashboard
  // - Framer-style interactive landing
  // - Analytics dashboard
  // - Admin panel
  // etc.
];

/**
 * Get all built-in templates
 */
export function getBuiltInTemplates() {
  return BUILT_IN_TEMPLATES;
}

/**
 * Get a specific built-in template by ID
 */
export function getBuiltInTemplate(id) {
  return BUILT_IN_TEMPLATES.find(t => t.id === id);
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category) {
  return BUILT_IN_TEMPLATES.filter(t => t.category === category);
}

/**
 * Search templates by tags
 */
export function searchTemplates(tags) {
  return BUILT_IN_TEMPLATES.filter(template =>
    tags.some(tag => template.tags.includes(tag))
  );
}
