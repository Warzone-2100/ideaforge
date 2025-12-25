// Mock data for quick testing of later workflow stages
// Avoids expensive API calls during development

export const mockResearch = {
  content: `# Market Research: AI-Powered Task Management Platform

## Executive Summary
The productivity software market is experiencing rapid growth, with users increasingly demanding intelligent, context-aware tools that reduce cognitive load and streamline workflows.

## Market Insights
- Global productivity software market valued at $85B in 2024
- 73% of knowledge workers report feeling overwhelmed by task management
- AI-powered productivity tools seeing 156% YoY growth
- Mobile-first productivity apps growing 3x faster than desktop-only solutions

## Competitor Analysis

### Existing Solutions
1. **Todoist** - Simple, linear task lists. Lacks AI features.
2. **Notion** - Powerful but overwhelming for casual users. Steep learning curve.
3. **Asana** - Enterprise-focused, too complex for individuals.
4. **TickTick** - Good mobile experience but limited smart features.

### Gaps in Market
- No competitors offer truly intelligent task prioritization
- Poor integration between calendar, tasks, and context
- Limited proactive suggestions based on user behavior
- Complex UIs that increase cognitive load rather than reduce it

## User Pain Points
1. **Too many clicks** to add simple tasks
2. **Manual prioritization** is time-consuming and stressful
3. **Context switching** between multiple apps (calendar, notes, tasks)
4. **No smart suggestions** - users must manually plan everything
5. **Poor mobile experience** - most apps desktop-first
6. **Overwhelming interfaces** with too many features exposed at once

## Technical Requirements
- Real-time sync across all devices
- Offline-first architecture with background sync
- AI/ML integration for smart prioritization
- Natural language input processing
- Calendar integration (Google, Outlook, Apple)
- Mobile apps (iOS, Android)
- Web application
- API for third-party integrations

## Success Metrics
- User task completion rate > 85%
- Time to add task < 5 seconds
- Daily active usage > 3 sessions
- User retention (30-day) > 60%
- NPS score > 50

## Target Users
- **Primary**: Knowledge workers (25-45 years old)
- **Secondary**: Students and freelancers
- **Tertiary**: Small team leads

## Revenue Model
- Freemium with AI features in paid tier
- Individual: $8/month
- Team: $12/user/month
- Enterprise: Custom pricing`,
  fileName: 'market-research.md',
  uploadedAt: new Date().toISOString(),
};

export const mockInsights = {
  marketInsights: [
    'Productivity software market valued at $85B with 156% YoY growth in AI-powered tools',
    '73% of knowledge workers feel overwhelmed by current task management solutions',
    'Mobile-first productivity apps growing 3x faster than desktop-only solutions',
    'Users demand intelligent, context-aware tools that reduce cognitive load',
  ],
  competitorGaps: [
    'No competitors offer truly intelligent task prioritization using AI',
    'Poor integration between calendar, tasks, and contextual information',
    'Complex UIs that increase cognitive load rather than reduce it',
    'Limited proactive suggestions based on user behavior patterns',
    'Weak mobile experiences - most solutions are desktop-first',
  ],
  painPoints: [
    'Too many clicks required to add simple tasks (average 5+ taps)',
    'Manual prioritization is time-consuming and mentally draining',
    'Constant context switching between calendar, notes, and task apps',
    'No smart suggestions - users must manually plan everything',
    'Overwhelming interfaces expose too many features simultaneously',
  ],
  technicalRequirements: [
    'Real-time sync across all devices with offline-first architecture',
    'AI/ML integration for smart task prioritization and suggestions',
    'Natural language input processing for quick task capture',
    'Calendar integration with Google, Outlook, and Apple Calendar',
    'Native mobile apps for iOS and Android with web application',
    'Public API for third-party integrations and automations',
  ],
  successMetrics: [
    'User task completion rate exceeding 85%',
    'Time to add task under 5 seconds average',
    'Daily active usage over 3 sessions per user',
    '30-day user retention rate above 60%',
    'Net Promoter Score (NPS) above 50',
  ],
  isAnalyzed: true,
  isAnalyzing: false,
};

export const mockFeatures = [
  {
    id: 'feat-1',
    name: 'Smart Quick Capture',
    description: 'Natural language task input that intelligently parses due dates, priorities, and contexts from plain text',
    userStory: 'As a busy professional, I want to quickly capture tasks using natural language, so that I can record ideas instantly without breaking my flow',
    acceptanceCriteria: [
      'User can type "Buy milk tomorrow at 5pm #shopping !high" and it automatically extracts all components',
      'System recognizes dates in multiple formats (tomorrow, next Friday, Dec 25, etc.)',
      'Priority indicators (!high, !low, !medium) are automatically parsed',
      'Tags (#work, #personal, #shopping) are extracted and applied',
      'Task appears in the list within 200ms of submission',
    ],
    edgeCases: [
      'Ambiguous dates like "next week" default to Monday',
      'Multiple time references use the first one encountered',
      'Unrecognized text becomes the task description',
      'Empty submissions show helpful example prompts',
    ],
    dependencies: ['NLP service', 'Date parsing library'],
    priority: 'mvp',
    status: 'accepted',
    reasoning: 'Directly addresses #1 pain point of "too many clicks" - reduces task capture from 5+ taps to a single natural input',
    estimatedComplexity: 'medium',
  },
  {
    id: 'feat-2',
    name: 'AI Priority Assistant',
    description: 'ML-powered automatic task prioritization based on deadlines, user behavior, calendar events, and historical patterns',
    userStory: 'As a knowledge worker, I want my tasks automatically prioritized, so that I can focus on what matters without manual sorting',
    acceptanceCriteria: [
      'System analyzes user behavior patterns to learn what tasks typically get done first',
      'Calendar integration identifies time blocks and suggests tasks that fit available time',
      'Urgent tasks (due within 24 hours) are automatically surfaced at the top',
      'User can override AI suggestions with manual priority adjustments',
      'AI explanations show why a task was prioritized ("Due soon" or "Matches your 9am work pattern")',
    ],
    edgeCases: [
      'Tasks with no due date are prioritized based on creation time and user patterns',
      'Overdue tasks move to a separate "Overdue" section',
      'AI learns from user overrides to improve future suggestions',
    ],
    dependencies: ['ML model training', 'Calendar API integration', 'User behavior analytics'],
    priority: 'mvp',
    status: 'accepted',
    reasoning: 'Solves core pain point #2 (manual prioritization) and differentiates from competitors lacking AI features',
    estimatedComplexity: 'large',
  },
  {
    id: 'feat-3',
    name: 'Unified Context Dashboard',
    description: 'Single view combining today\'s calendar, top tasks, and contextual notes - eliminating context switching',
    userStory: 'As a user juggling multiple responsibilities, I want one dashboard showing everything I need today, so that I never miss important tasks or meetings',
    acceptanceCriteria: [
      'Dashboard shows calendar events and tasks side-by-side in chronological order',
      'Time blocks indicate available work time between meetings',
      'Tasks are suggested for specific time blocks based on estimated duration',
      'Quick notes section allows capturing context without leaving the view',
      'Refreshes in real-time as calendar or tasks change',
    ],
    edgeCases: [
      'Days with no calendar events show tasks grouped by priority',
      'All-day events don\'t block task suggestions',
      'Conflicts between tasks and meetings are highlighted in amber',
    ],
    dependencies: ['Calendar sync', 'Real-time sync engine'],
    priority: 'mvp',
    status: 'accepted',
    reasoning: 'Addresses pain point #3 (context switching) - users no longer need to check multiple apps',
    estimatedComplexity: 'medium',
  },
  {
    id: 'feat-4',
    name: 'Proactive Smart Suggestions',
    description: 'AI-generated suggestions for task creation based on patterns, recurring needs, and upcoming events',
    userStory: 'As a user with recurring responsibilities, I want the app to suggest tasks I might need, so that I don\'t forget important recurring items',
    acceptanceCriteria: [
      'System detects patterns (e.g., "Buy groceries" every Sunday) and suggests creating recurring tasks',
      'Before calendar events, suggests preparation tasks ("Prepare slides for 2pm meeting")',
      'Learns from dismissals - if user dismisses a suggestion 3 times, it stops appearing',
      'Suggestions appear as dismissible cards, not intrusive notifications',
      'User can accept suggestions with a single tap',
    ],
    edgeCases: [
      'No suggestions shown if user has 10+ pending tasks (avoid overwhelm)',
      'Suggestions based on deleted tasks are not repeated',
      'New users see generic helpful suggestions until patterns emerge',
    ],
    dependencies: ['Pattern detection ML', 'Calendar integration'],
    priority: 'high',
    status: 'accepted',
    reasoning: 'Addresses pain point #4 (no smart suggestions) and provides proactive value beyond basic task management',
    estimatedComplexity: 'large',
  },
  {
    id: 'feat-5',
    name: 'Mobile-First Design',
    description: 'Touch-optimized interface with gesture controls and instant sync, designed for mobile usage patterns',
    userStory: 'As a mobile user, I want a fast, touch-friendly interface, so that I can manage tasks on-the-go without frustration',
    acceptanceCriteria: [
      'All primary actions accessible with one thumb on mobile devices',
      'Swipe gestures: right to complete, left to defer, up for details',
      'Pull-to-refresh updates task list with haptic feedback',
      'Quick-add FAB (floating action button) always accessible',
      'Offline mode allows full task management with background sync when online',
    ],
    edgeCases: [
      'Conflicts during offline sync are resolved with "keep both" strategy',
      'Slow connections show optimistic UI updates with sync indicators',
      'Very long task names truncate with ellipsis on list view',
    ],
    dependencies: ['Offline-first architecture', 'Native mobile apps'],
    priority: 'mvp',
    status: 'accepted',
    reasoning: 'Addresses pain point #5 (poor mobile experience) and aligns with market trend of mobile-first productivity tools',
    estimatedComplexity: 'large',
  },
  {
    id: 'feat-6',
    name: 'Progressive Complexity UI',
    description: 'Interface that shows basic features by default and progressively reveals advanced features as users need them',
    userStory: 'As a new user, I want a simple interface that doesn\'t overwhelm me, so that I can start being productive immediately',
    acceptanceCriteria: [
      'Default view shows only: task input, task list, and today\'s calendar',
      'Advanced features (tags, projects, filters) appear in collapsible sections',
      'First-time users see a 30-second onboarding highlighting core features only',
      'Power users can enable "advanced mode" showing all features at once',
      'Feature discovery happens through contextual hints, not forced tutorials',
    ],
    edgeCases: [
      'Users can skip onboarding and return to it later from settings',
      'Advanced mode preference syncs across devices',
      'Hints are dismissed permanently after 3 views',
    ],
    dependencies: ['User preferences sync'],
    priority: 'high',
    status: 'accepted',
    reasoning: 'Solves pain point #6 (overwhelming interfaces) - learns from Notion\'s mistake of exposing too much complexity upfront',
    estimatedComplexity: 'medium',
  },
];

export const mockPRD = `# Product Requirements Document: TaskFlow AI

## 1. Product Overview

### 1.1 Vision
TaskFlow AI is an intelligent task management platform that eliminates the cognitive overhead of traditional productivity tools through AI-powered prioritization, natural language input, and unified context awareness.

### 1.2 Problem Statement
73% of knowledge workers feel overwhelmed by current task management solutions due to:
- Excessive manual work (prioritization, categorization)
- Context switching between calendar, tasks, and notes
- Complex interfaces that increase rather than reduce cognitive load
- Lack of intelligent, proactive assistance

### 1.3 Solution
An AI-first productivity platform that:
- Captures tasks through natural language in seconds
- Automatically prioritizes based on deadlines, calendar, and learned patterns
- Presents a unified dashboard eliminating context switching
- Proactively suggests tasks before users need to think of them

## 2. Target Users

### 2.1 Primary Persona: Sarah - Product Manager
- **Age:** 32
- **Pain Points:** Juggles 30+ tasks daily, constant context switching, manual prioritization exhausting
- **Goals:** Reduce time spent managing tasks, increase focus time on actual work
- **Tech Savviness:** High - uses multiple productivity tools, early adopter

### 2.2 Secondary Persona: Alex - Freelance Designer
- **Age:** 28
- **Pain Points:** Multiple client projects, irregular schedule, forgets recurring tasks
- **Goals:** Never miss client deadlines, reduce time on admin work
- **Tech Savviness:** Medium - uses phone primarily, prefers simple tools

## 3. Core Features (MVP)

### FR1: Smart Quick Capture
**Priority:** P0 (Must Have)

Users can add tasks using natural language input that automatically extracts:
- Due dates and times
- Priority levels
- Tags and categories
- Subtasks

**Technical Requirements:**
- NLP service for intent parsing
- Sub-200ms response time
- Support for 15+ date/time formats
- Offline capture with queue sync

**Success Metrics:**
- Average task capture time < 5 seconds
- 90% accurate date/time extraction

### FR2: AI Priority Assistant
**Priority:** P0 (Must Have)

ML-powered automatic task prioritization based on:
- Deadline proximity
- Calendar availability
- Historical completion patterns
- User manual overrides

**Technical Requirements:**
- ML model training pipeline
- Real-time calendar sync
- Explainable AI (show reasoning)
- User override learning

**Success Metrics:**
- 80% user agreement with AI priorities
- 50% reduction in manual priority changes

### FR3: Unified Context Dashboard
**Priority:** P0 (Must Have)

Single view combining:
- Today's calendar events
- Prioritized task list
- Available time blocks
- Quick notes section

**Technical Requirements:**
- Calendar API integrations (Google, Outlook, Apple)
- Real-time sync engine
- Conflict detection
- Responsive layout (mobile-first)

**Success Metrics:**
- 70% reduction in app switching
- 3+ sessions per day average

### FR4: Proactive Smart Suggestions
**Priority:** P1 (Should Have)

AI-generated task suggestions based on:
- Recurring patterns
- Upcoming calendar events
- Time of day/week patterns

**Technical Requirements:**
- Pattern detection ML
- Dismissal learning
- Non-intrusive UI (cards, not notifications)
- One-tap acceptance

**Success Metrics:**
- 30% suggestion acceptance rate
- 2+ suggestions acted upon per week

### FR5: Mobile-First Design
**Priority:** P0 (Must Have)

Touch-optimized interface with:
- Gesture controls (swipe to complete/defer)
- One-thumb navigation
- Offline-first architecture
- Background sync

**Technical Requirements:**
- Native iOS and Android apps
- Service worker for offline web
- Optimistic UI updates
- Conflict resolution strategy

**Success Metrics:**
- Mobile usage > 60% of total
- Offline usage > 20% of sessions

### FR6: Progressive Complexity UI
**Priority:** P1 (Should Have)

Interface that reveals features progressively:
- Simple default view (input, list, calendar)
- Collapsible advanced features
- Contextual hints (not forced tutorials)
- Advanced mode toggle for power users

**Technical Requirements:**
- User preference system
- Feature flagging
- Onboarding flow (< 30 seconds)
- Cross-device preference sync

**Success Metrics:**
- < 10% onboarding abandonment
- 80% users stay in simple mode

## 4. Technical Architecture

### 4.1 Frontend
- **Web:** React 19 + Vite, Tailwind CSS
- **Mobile:** React Native (iOS/Android)
- **State:** Zustand + React Query
- **Offline:** IndexedDB + Service Workers

### 4.2 Backend
- **API:** Node.js + Express
- **Database:** PostgreSQL (relational) + Redis (caching)
- **AI/ML:** Python microservices (FastAPI)
- **Real-time:** WebSocket connections

### 4.3 Integrations
- **Calendar:** Google Calendar API, Microsoft Graph, Apple CalDAV
- **NLP:** OpenAI GPT-4 / Custom fine-tuned model
- **Analytics:** PostHog (product analytics)

## 5. Non-Functional Requirements

### 5.1 Performance
- Task capture response < 200ms
- Dashboard load < 1 second
- Real-time sync latency < 500ms
- Offline mode fully functional

### 5.2 Security
- End-to-end encryption for task data
- OAuth 2.0 for calendar integrations
- SOC 2 Type II compliance
- GDPR compliant data handling

### 5.3 Scalability
- Support 1M+ users
- 100M+ tasks
- 99.9% uptime SLA

## 6. Success Metrics

### 6.1 Acquisition
- 10K users in first 3 months
- 30% conversion from free to paid

### 6.2 Engagement
- DAU/MAU ratio > 40%
- Average 3+ sessions per day
- Task completion rate > 85%

### 6.3 Retention
- 30-day retention > 60%
- 90-day retention > 40%
- Churn rate < 5% monthly

### 6.4 Revenue
- MRR growth 20% month-over-month
- LTV:CAC ratio > 3:1

## 7. Out of Scope (Future Phases)

### Phase 2 (3-6 months post-launch)
- Team collaboration features
- Shared tasks and projects
- Comments and attachments
- Time tracking

### Phase 3 (6-12 months)
- Desktop native apps
- Browser extensions
- Third-party integrations (Zapier, Slack)
- Custom AI training on user data

### Never (Anti-features)
- Complex project management (Gantt charts, dependencies)
- Enterprise features (SSO, audit logs) in individual tier
- Social features (sharing publicly, social feeds)

## 8. Launch Plan

### 8.1 Beta Phase (Month 1-2)
- 100 beta testers (product managers, freelancers)
- Weekly feedback sessions
- Iterate on core features

### 8.2 Soft Launch (Month 3)
- Product Hunt launch
- Targeted outreach to productivity communities
- Freemium model live

### 8.3 Full Launch (Month 4)
- Paid marketing campaign
- Press outreach
- Influencer partnerships

## 9. Open Questions

1. Should we support recurring tasks in MVP or defer to Phase 2?
2. What's the optimal freemium split (which AI features are paid-only)?
3. Do we need a desktop app or is web + mobile sufficient for MVP?
4. Should we build our own NLP model or use OpenAI API?`;

export const mockDesignBrief = {
  visualIdentity: {
    moodDescription: 'Calm, focused, intelligent - like a mindful workspace bathed in soft morning light. Think Japanese minimalism meets Scandinavian functionality.',
    designPhilosophy: 'Every pixel should reduce cognitive load, not add to it. If a feature requires explanation, it\'s too complex.',
    references: [
      {
        product: 'Linear',
        whatToTake: 'Command palette for power users, keyboard-first interactions',
        whatToAvoid: 'Developer-focused terminology, enterprise complexity',
      },
      {
        product: 'Things 3',
        whatToTake: 'Gestural interactions, celebration animations on task completion',
        whatToAvoid: 'iOS-only patterns that don\'t translate to web',
      },
      {
        product: 'Reflect',
        whatToTake: 'Calm color palette, generous whitespace, focus on content',
        whatToAvoid: 'Over-reliance on blur effects that hurt readability',
      },
    ],
    antiPatterns: [
      'Generic "clean and modern" design',
      'Overwhelming feature-packed interfaces',
      'Aggressive gradients or neon colors',
      'Cluttered toolbars with 20+ icons',
      'Modal-heavy interactions',
      'Tiny touch targets (< 44px)',
    ],
  },
  designTokens: {
    colors: {
      primary: { value: '#4F46E5', usage: 'Interactive elements, CTAs, focus states' },
      'primary-hover': { value: '#4338CA', usage: 'Hover state for primary actions' },
      secondary: { value: '#8B5CF6', usage: 'AI features, smart suggestions' },
      background: { value: '#FAFAFA', usage: 'App background, cards' },
      'background-elevated': { value: '#FFFFFF', usage: 'Modals, dropdowns, elevated cards' },
      text: { value: '#18181B', usage: 'Primary text, headings' },
      'text-muted': { value: '#71717A', usage: 'Secondary text, descriptions' },
      'text-disabled': { value: '#A1A1AA', usage: 'Disabled state text' },
      border: { value: '#E4E4E7', usage: 'Dividers, card borders' },
      success: { value: '#10B981', usage: 'Task completion, success states' },
      warning: { value: '#F59E0B', usage: 'Deadline warnings, conflicts' },
      error: { value: '#EF4444', usage: 'Overdue tasks, errors' },
    },
    typography: {
      'font-family': { value: 'Inter, system-ui, sans-serif', usage: 'Primary font for all text' },
      'font-mono': { value: 'JetBrains Mono, monospace', usage: 'Code, technical details' },
      'heading-xl': { value: '32px/1.2/600', usage: 'Page titles' },
      'heading-lg': { value: '24px/1.3/600', usage: 'Section headings' },
      'heading-md': { value: '18px/1.4/600', usage: 'Card titles, subheadings' },
      body: { value: '16px/1.5/400', usage: 'Body text, task descriptions' },
      'body-sm': { value: '14px/1.5/400', usage: 'Helper text, timestamps' },
      caption: { value: '12px/1.4/500', usage: 'Labels, badges, metadata' },
    },
    spacing: {
      xs: { value: '4px', usage: 'Tight spacing, icon padding' },
      sm: { value: '8px', usage: 'Component padding, small gaps' },
      md: { value: '16px', usage: 'Card padding, section spacing' },
      lg: { value: '24px', usage: 'Page margins, large gaps' },
      xl: { value: '32px', usage: 'Section separators' },
      '2xl': { value: '48px', usage: 'Page-level spacing' },
    },
    borderRadius: {
      sm: { value: '4px', usage: 'Badges, tags' },
      md: { value: '8px', usage: 'Buttons, inputs, small cards' },
      lg: { value: '12px', usage: 'Cards, modals' },
      xl: { value: '16px', usage: 'Large cards, sheets' },
      full: { value: '9999px', usage: 'Pills, avatars' },
    },
    shadows: {
      sm: { value: '0 1px 2px rgba(0,0,0,0.05)', usage: 'Subtle lift on cards' },
      md: { value: '0 4px 6px rgba(0,0,0,0.07)', usage: 'Dropdown menus' },
      lg: { value: '0 10px 15px rgba(0,0,0,0.1)', usage: 'Modals, popovers' },
      xl: { value: '0 20px 25px rgba(0,0,0,0.15)', usage: 'Floating action button' },
    },
  },
  componentPatterns: {
    taskCard: {
      description: 'Core building block - how individual tasks appear in lists',
      anatomy: 'Checkbox (44px touch target) | Task text | Due date badge | Priority indicator',
      interactions: 'Swipe right = complete (with celebration), Swipe left = defer, Tap = details',
      states: 'Default | Hover | Pressed | Completed | Overdue',
      specificBehavior: 'Completed tasks fade out with spring animation over 300ms',
    },
    smartSuggestion: {
      description: 'AI-generated task suggestions that appear as dismissible cards',
      anatomy: 'AI sparkle icon | Suggestion text | "Add" CTA | Dismiss X',
      interactions: 'Tap anywhere = add task, Tap X = dismiss and learn',
      states: 'Default | Hover | Adding (loading) | Dismissed',
      specificBehavior: 'Appear with slide-in from bottom, max 1 visible at a time',
    },
    quickCapture: {
      description: 'Primary input for adding tasks via natural language',
      anatomy: 'Text input | Voice input button | Submit button | Parsed preview',
      interactions: 'Type = live parsing preview, Voice = speech-to-text, Enter = submit',
      states: 'Empty | Typing | Parsing | Submitting | Success',
      specificBehavior: 'Shows inline preview of parsed date/time/priority as user types',
    },
  },
  interactionPrinciples: {
    gesture: 'Swipe gestures should feel natural and forgiving (min 30% width to trigger)',
    feedback: 'Every action gets immediate visual feedback (< 100ms)',
    celebration: 'Task completion shows brief confetti animation - dopamine hit without distraction',
    errors: 'Errors are friendly and actionable, never technical jargon',
    loading: 'Skeleton loaders for predictable wait times, spinners for unpredictable',
  },
  accessibility: {
    contrast: 'WCAG AAA for all text (7:1 for body, 4.5:1 for large text)',
    keyboard: 'Full keyboard navigation with visible focus indicators',
    screenReader: 'ARIA labels for all interactive elements, live regions for dynamic updates',
    motion: 'Respect prefers-reduced-motion, offer simplified animations',
    touch: 'Minimum 44x44px touch targets, adequate spacing between interactive elements',
  },
  responsiveStrategy: {
    mobile: 'Bottom nav bar, full-width cards, swipe gestures primary',
    tablet: 'Side nav, two-column layout for tasks + calendar',
    desktop: 'Three-column (nav | tasks | calendar/details), keyboard shortcuts',
    breakpoints: '640px (mobile) | 768px (tablet) | 1024px (desktop)',
  },
};

// Function to load all mock data into the store
export function loadMockData(store) {
  const {
    setResearch,
    setInsights,
    setFeatures,
    setPRD,
    setDesignBrief: setDesignBriefInStore,
  } = store;

  // Load research
  setResearch(mockResearch.content, mockResearch.fileName);

  // Load insights
  setInsights(mockInsights);

  // Load features
  setFeatures(mockFeatures);

  // Load PRD
  setPRD({ content: mockPRD });

  // Load design brief
  setDesignBriefInStore(mockDesignBrief);

  console.log('✅ Mock data loaded successfully!');
}
