// ARCHETYPE DEFINITIONS
// Core personality types for template matching

export const ARCHETYPES = {
  'enterprise-technical': {
    id: 'enterprise-technical',
    name: 'Enterprise Technical',
    description: 'B2B, DevTools, APIs, Infrastructure',
    icon: 'Building2',
    color: '#3B82F6', // blue

    // Content approach
    heroApproach: 'metrics-first', // Lead with numbers, scale, reliability
    trustStyle: 'certifications', // SLAs, SOC2, logos
    ctaStyle: 'demo-first', // "Book a Demo", "Contact Sales"

    // Tone guidance
    tone: {
      primary: 'confident',
      secondary: 'technical',
      avoid: ['playful', 'casual', 'emoji', 'exclamation-heavy'],
    },

    // Audience fit
    audienceMatch: {
      developers: 95,
      enterprise: 90,
      startup: 70,
      consumer: 30,
      creator: 20,
    },

    // Content strategy
    contentStrategy: {
      hero: { style: 'metrics-first', maxLength: 80 },
      features: { style: 'capability-grid', count: { min: 4, max: 8 } },
      trust: { style: 'logo-strip', elements: ['certifications', 'enterprise-logos', 'uptime'] },
      cta: { primary: 'Book Demo', secondary: 'View Docs' },
    },
  },

  'creator-aspirational': {
    id: 'creator-aspirational',
    name: 'Creator Aspirational',
    description: 'Creative tools, Courses, Personal brands',
    icon: 'Sparkles',
    color: '#EC4899', // pink

    heroApproach: 'transformation', // Before/after, journey, potential
    trustStyle: 'testimonials', // Creator stories, community
    ctaStyle: 'start-free', // "Start Creating", "Join Free"

    tone: {
      primary: 'inspiring',
      secondary: 'warm',
      avoid: ['corporate', 'jargon', 'stiff'],
    },

    audienceMatch: {
      creator: 95,
      consumer: 80,
      startup: 50,
      developers: 30,
      enterprise: 20,
    },

    contentStrategy: {
      hero: { style: 'transformation', maxLength: 60 },
      features: { style: 'benefit-cards', count: { min: 3, max: 6 } },
      trust: { style: 'testimonials', elements: ['creator-stories', 'community-size', 'results'] },
      cta: { primary: 'Start Free', secondary: 'See Examples' },
    },
  },

  'consumer-premium': {
    id: 'consumer-premium',
    name: 'Consumer Premium',
    description: 'Lifestyle apps, Premium products, Luxury',
    icon: 'Crown',
    color: '#A855F7', // purple

    heroApproach: 'experience', // Feeling, aesthetic, lifestyle
    trustStyle: 'awards', // Press logos, awards, reviews
    ctaStyle: 'exclusive', // "Get Access", "Join Waitlist"

    tone: {
      primary: 'sophisticated',
      secondary: 'aspirational',
      avoid: ['salesy', 'cheap', 'urgent'],
    },

    audienceMatch: {
      consumer: 95,
      creator: 60,
      startup: 40,
      developers: 25,
      enterprise: 20,
    },

    contentStrategy: {
      hero: { style: 'experience-first', maxLength: 50 },
      features: { style: 'visual-gallery', count: { min: 3, max: 5 } },
      trust: { style: 'press-awards', elements: ['press-logos', 'awards', 'ratings'] },
      cta: { primary: 'Get Started', secondary: 'Learn More' },
    },
  },

  'startup-velocity': {
    id: 'startup-velocity',
    name: 'Startup Velocity',
    description: 'SaaS, Productivity, Growth-focused',
    icon: 'Rocket',
    color: '#10B981', // emerald

    heroApproach: 'benefit-first', // Speed, efficiency, results
    trustStyle: 'social-proof', // YC, growth metrics, user count
    ctaStyle: 'try-free', // "Try Free", "Start Now"

    tone: {
      primary: 'energetic',
      secondary: 'direct',
      avoid: ['slow', 'complex', 'bureaucratic'],
    },

    audienceMatch: {
      startup: 95,
      developers: 75,
      creator: 60,
      consumer: 50,
      enterprise: 45,
    },

    contentStrategy: {
      hero: { style: 'benefit-first', maxLength: 70 },
      features: { style: 'bento-grid', count: { min: 3, max: 9 } },
      trust: { style: 'social-proof', elements: ['user-count', 'growth', 'investors'] },
      cta: { primary: 'Try Free', secondary: 'See Demo' },
    },
  },
};

// Detection signals for AI extraction
export const ARCHETYPE_SIGNALS = {
  'enterprise-technical': {
    keywords: ['enterprise', 'api', 'infrastructure', 'scale', 'security', 'compliance', 'sla', 'uptime', 'b2b', 'devtools', 'sdk', 'integration'],
    audienceIndicators: ['developers', 'engineers', 'cto', 'technical teams', 'devops'],
    productIndicators: ['platform', 'infrastructure', 'api', 'sdk', 'backend'],
  },
  'creator-aspirational': {
    keywords: ['create', 'design', 'build', 'express', 'share', 'community', 'portfolio', 'course', 'content', 'audience'],
    audienceIndicators: ['creators', 'designers', 'artists', 'influencers', 'educators', 'coaches'],
    productIndicators: ['tool', 'platform', 'course', 'community', 'marketplace'],
  },
  'consumer-premium': {
    keywords: ['premium', 'exclusive', 'luxury', 'experience', 'lifestyle', 'aesthetic', 'curated', 'membership'],
    audienceIndicators: ['consumers', 'enthusiasts', 'collectors', 'lifestyle-focused'],
    productIndicators: ['app', 'subscription', 'membership', 'experience'],
  },
  'startup-velocity': {
    keywords: ['fast', 'simple', 'efficient', 'productivity', 'automate', 'save time', 'growth', 'saas', 'startup'],
    audienceIndicators: ['teams', 'startups', 'founders', 'small business', 'professionals'],
    productIndicators: ['saas', 'tool', 'app', 'automation', 'workflow'],
  },
};

export default { ARCHETYPES, ARCHETYPE_SIGNALS };
