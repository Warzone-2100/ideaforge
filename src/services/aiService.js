import useAppStore from '../stores/useAppStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Helper to track API usage
function trackUsage(taskName, response) {
  if (response?._meta) {
    const addUsageRecord = useAppStore.getState().addUsageRecord;
    addUsageRecord(taskName, response._meta);
  }
  return response;
}

class AIService {
  async analyzeResearch(researchContent) {
    try {
      const response = await fetch(`${API_BASE_URL}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ research: researchContent }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return trackUsage('analysis', data);
    } catch (error) {
      console.error('Analysis error:', error);
      // Return mock data for development
      return this.mockAnalyzeResearch(researchContent);
    }
  }

  async generateFeatures(researchContent, insights) {
    try {
      const response = await fetch(`${API_BASE_URL}/features/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ research: researchContent, insights }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return trackUsage('features', data);
    } catch (error) {
      console.error('Feature generation error:', error);
      return this.mockGenerateFeatures(insights);
    }
  }

  async refineFeatures(message, currentFeatures) {
    try {
      const response = await fetch(`${API_BASE_URL}/features/refine`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, features: currentFeatures }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return trackUsage('refineFeatures', data);
    } catch (error) {
      console.error('Feature refinement error:', error);
      return {
        success: true,
        response: `I understand you want to "${message}". Let me help refine the features based on your feedback.`,
        updates: [],
      };
    }
  }

  async generatePRD(researchContent, insights, acceptedFeatures) {
    try {
      const response = await fetch(`${API_BASE_URL}/prd/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          research: researchContent,
          insights,
          features: acceptedFeatures,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return trackUsage('prd', data);
    } catch (error) {
      console.error('PRD generation error:', error);
      return this.mockGeneratePRD(acceptedFeatures);
    }
  }

  async generateDatabaseSchema(acceptedFeatures, prdContent) {
    try {
      const response = await fetch(`${API_BASE_URL}/schema/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          features: acceptedFeatures,
          prd: prdContent,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return trackUsage('databaseSchema', data);
    } catch (error) {
      console.error('Database schema generation error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async generateApiEndpoints(acceptedFeatures, databaseSchema, prdContent) {
    try {
      const response = await fetch(`${API_BASE_URL}/endpoints/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          features: acceptedFeatures,
          databaseSchema,
          prd: prdContent,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return trackUsage('apiEndpoints', data);
    } catch (error) {
      console.error('API endpoints generation error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async generateComponentTree(acceptedFeatures, apiEndpoints, prdContent) {
    try {
      const response = await fetch(`${API_BASE_URL}/components/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          features: acceptedFeatures,
          apiEndpoints,
          prd: prdContent,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return trackUsage('componentTree', data);
    } catch (error) {
      console.error('Component tree generation error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async generatePrompt(format, researchContent, insights, features, prdContent) {
    try {
      const response = await fetch(`${API_BASE_URL}/export/${format}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          research: researchContent,
          insights,
          features,
          prd: prdContent,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return trackUsage('export', data);
    } catch (error) {
      console.error('Prompt generation error:', error);
      return this.mockGeneratePrompt(format, features, prdContent);
    }
  }

  async generateStories(features, prdContent, databaseSchema, apiEndpoints, componentTree) {
    try {
      const response = await fetch(`${API_BASE_URL}/stories/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          features,
          prd: prdContent,
          databaseSchema,
          apiEndpoints,
          componentTree,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return trackUsage('storyFiles', data);
    } catch (error) {
      console.error('Story generation error:', error);
      return this.mockGenerateStories(features);
    }
  }

  async generateDesignBrief(research, insights, features, productContext) {
    try {
      const response = await fetch(`${API_BASE_URL}/design/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          research,
          insights,
          features,
          productContext,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return trackUsage('designBrief', data);
    } catch (error) {
      console.error('Design brief generation error:', error);
      return this.mockGenerateDesignBrief();
    }
  }

  async chatWithDesignBrief(message, designBrief) {
    try {
      const response = await fetch(`${API_BASE_URL}/design/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, designBrief }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return trackUsage('designChat', data);
    } catch (error) {
      console.error('Design chat error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async regenerateDesignBrief(editedDesignBrief, originalDesignBrief = null) {
    try {
      const response = await fetch(`${API_BASE_URL}/design/regenerate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ editedDesignBrief, originalDesignBrief }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return trackUsage('designBrief', data);
    } catch (error) {
      console.error('Design brief regeneration error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async chatExport(message, context) {
    try {
      const response = await fetch(`${API_BASE_URL}/export/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, context }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return trackUsage('chatWithExport', data);
    } catch (error) {
      console.error('Export chat error:', error);
      return {
        success: true,
        response: `I understand you want to "${message}". Let me help you refine your exports. What specific aspect would you like to improve?`,
      };
    }
  }

  // Mock methods for development/fallback
  mockAnalyzeResearch(content) {
    const words = content.toLowerCase();
    return {
      success: true,
      insights: {
        marketInsights: [
          'Growing market with significant opportunity',
          'Users seeking simpler, more intuitive solutions',
          'Mobile-first approach gaining traction',
        ],
        competitorGaps: [
          'Existing solutions are overly complex',
          'Poor mobile experience across competitors',
          'Lack of AI-powered features',
        ],
        painPoints: [
          'Too many clicks to complete simple tasks',
          'Overwhelming interfaces with too many features',
          'Lack of smart recommendations',
        ],
        technicalRequirements: [
          'Responsive web application',
          'Real-time data synchronization',
          'AI/ML integration for smart features',
        ],
        successMetrics: [
          'User task completion rate',
          'Time to complete key actions',
          'User retention and engagement',
        ],
      },
    };
  }

  mockGenerateFeatures(insights) {
    return {
      success: true,
      features: [
        {
          name: 'Quick Action Dashboard',
          description: 'A streamlined dashboard that surfaces the most relevant actions based on user context',
          priority: 'mvp',
          reasoning: 'Addresses pain point of too many clicks and overwhelming interfaces',
        },
        {
          name: 'Smart Suggestions',
          description: 'AI-powered recommendations that learn from user behavior to suggest next actions',
          priority: 'mvp',
          reasoning: 'Differentiates from competitors lacking AI features',
        },
        {
          name: 'Mobile-First Design',
          description: 'Fully responsive interface optimized for touch interactions on mobile devices',
          priority: 'mvp',
          reasoning: 'Addresses competitor gap in mobile experience',
        },
        {
          name: 'Real-Time Sync',
          description: 'Instant synchronization across all devices with offline support',
          priority: 'high',
          reasoning: 'Technical requirement for seamless user experience',
        },
        {
          name: 'Contextual Shortcuts',
          description: 'Keyboard shortcuts and quick actions that adapt to current context',
          priority: 'medium',
          reasoning: 'Reduces time to complete key actions',
        },
        {
          name: 'Analytics Dashboard',
          description: 'Personal productivity insights and progress tracking',
          priority: 'medium',
          reasoning: 'Supports success metrics tracking',
        },
      ],
    };
  }

  mockGeneratePRD(features) {
    const featureList = features.map((f) => `- **${f.name}**: ${f.description}`).join('\n');

    return {
      success: true,
      prd: `# Product Requirements Document

## 1. Product Overview

### 1.1 Purpose
This document outlines the product requirements for a new application designed to address key user pain points identified through market research.

### 1.2 Goals
- Reduce complexity and time-to-action for users
- Provide intelligent, context-aware assistance
- Deliver a superior mobile experience

## 2. Target Users

### 2.1 Primary Persona
**Busy Professional**
- Age: 25-45
- Tech-savvy but time-constrained
- Values efficiency and simplicity
- Uses multiple devices throughout the day

### 2.2 User Needs
- Quick task completion with minimal friction
- Smart recommendations based on context
- Seamless experience across devices

## 3. Features

### 3.1 Core Features (MVP)
${featureList}

### 3.2 Feature Specifications

${features.map((f) => `#### ${f.name}
**Description:** ${f.description}

**Priority:** ${f.priority.toUpperCase()}

**Acceptance Criteria:**
- Users can access this feature within 2 clicks
- Performance: Response time under 200ms
- Accessibility: WCAG 2.1 AA compliant

---
`).join('\n')}

## 4. Technical Requirements

### 4.1 Architecture
- React 18+ with TypeScript
- Tailwind CSS for styling
- Zustand for state management
- REST API backend

### 4.2 Performance
- Initial load time: < 3 seconds
- Time to interactive: < 2 seconds
- Lighthouse score: 90+

### 4.3 Security
- HTTPS everywhere
- JWT-based authentication
- Input validation and sanitization

## 5. UI/UX Guidelines

### 5.1 Design Principles
- Clarity over cleverness
- Progressive disclosure
- Mobile-first responsive design

### 5.2 Visual Style
- Modern, clean aesthetic
- Dark mode support
- Consistent spacing and typography

## 6. Out of Scope

- Native mobile applications (Phase 2)
- Enterprise SSO integration (Phase 2)
- Advanced analytics (Phase 2)
- API for third-party integrations (Phase 2)

---
*Generated by IdeaForge*`,
    };
  }

  mockGeneratePrompt(format, features, prdContent) {
    const featureList = features.map((f) => f.name).join(', ');

    const prompts = {
      claude: `# Claude Code Instructions

<context>
You are building an application with the following core features: ${featureList}
</context>

<requirements>
${prdContent || 'See PRD for detailed requirements'}
</requirements>

<coding_standards>
- Use functional components with React hooks
- Follow TypeScript best practices
- Implement proper error handling
- Write clean, maintainable code
- Add comments for complex logic
</coding_standards>

<implementation_approach>
1. Start with the core layout and navigation
2. Implement features in priority order (MVP first)
3. Add proper error states and loading indicators
4. Ensure responsive design at all breakpoints
5. Test each feature before moving on
</implementation_approach>

<output_format>
When generating code:
- Provide complete, working implementations
- Include necessary imports
- Add TypeScript types where applicable
- Follow the established project structure
</output_format>`,

      cursor: `---
description: Project coding standards and feature requirements
globs: ["**/*.tsx", "**/*.ts", "**/*.jsx", "**/*.js"]
alwaysApply: true
---

# Project: ${features[0]?.name || 'Application'} Development

## Core Features
${features.map((f) => `- ${f.name}: ${f.description}`).join('\n')}

## Coding Standards

### React/TypeScript
- Use functional components with hooks
- Prefer TypeScript for type safety
- Keep components focused and small (<150 lines)
- Extract reusable logic into custom hooks

### Styling
- Use Tailwind CSS utility classes
- Follow mobile-first responsive design
- Maintain consistent spacing scale

### State Management
- Use Zustand for global state
- Keep state minimal and derived where possible
- Avoid prop drilling with context/stores

### Error Handling
- Implement proper try/catch blocks
- Show user-friendly error messages
- Log errors for debugging

## Implementation Priority
1. MVP features first
2. Core user flows
3. Polish and edge cases
4. Performance optimization`,

      gemini: `# Gemini Development Instructions

## Project Overview
Building an application with core features: ${featureList}

## Implementation Guide

### Step 1: Project Setup
Set up the development environment with:
- React 18+ with Vite
- TypeScript configuration
- Tailwind CSS
- Zustand for state management

### Step 2: Core Architecture
Implement the following structure:
\`\`\`
src/
├── components/     # UI components
├── hooks/          # Custom hooks
├── stores/         # Zustand stores
├── services/       # API services
└── utils/          # Utility functions
\`\`\`

### Step 3: Feature Implementation
${features.map((f, i) => `
#### ${i + 1}. ${f.name}
${f.description}
Priority: ${f.priority}
`).join('')}

### Step 4: Quality Assurance
- Test all user flows
- Verify responsive behavior
- Check accessibility compliance
- Optimize performance

## Technical Constraints
- Browser support: Last 2 versions
- Performance: 90+ Lighthouse score
- Accessibility: WCAG 2.1 AA

## Code Style
- Use consistent naming conventions
- Add JSDoc comments for functions
- Follow ESLint/Prettier rules`,

      universal: `# Agent Instructions

## Project Context
This project implements: ${featureList}

## Requirements Summary
${prdContent ? prdContent.substring(0, 1000) + '...' : 'See full PRD for details'}

## Implementation Guidelines

### Architecture
- React 18+ functional components
- TypeScript for type safety
- Tailwind CSS for styling
- Zustand for state management

### Coding Standards
1. Write clean, readable code
2. Use meaningful variable names
3. Keep functions small and focused
4. Handle errors gracefully
5. Add comments for complex logic

### Feature Priority
${features.map((f, i) => `${i + 1}. ${f.name} (${f.priority})`).join('\n')}

### Testing Requirements
- Unit tests for utilities
- Component tests for UI
- Integration tests for flows

### Documentation
- Inline code comments
- README with setup instructions
- API documentation

---
Generated by IdeaForge`,
    };

    return {
      success: true,
      prompt: prompts[format] || prompts.universal,
    };
  }

  mockGenerateDesignBrief() {
    return {
      success: true,
      designBrief: {
        visualIdentity: {
          moodDescription: "Confident and precise, like Linear meets Vercel. Dark-first with sharp edges and purposeful use of color. Feels like a tool for professionals who value their time.",
          designPhilosophy: "Every pixel earns its place - no decoration without function.",
          references: [
            { product: "Linear", whatToTake: "Command palette, keyboard-first navigation, subtle animations", whatToAvoid: "The purple brand color" },
            { product: "Vercel", whatToTake: "Typography scale, dark theme execution, deployment status patterns", whatToAvoid: "The heavy use of gradients on marketing pages" },
            { product: "Raycast", whatToTake: "Dense information display, quick actions, floating panels", whatToAvoid: "macOS-specific UI patterns" }
          ],
          antiPatterns: [
            "Generic blue call-to-action buttons",
            "Rounded-full buttons on everything",
            "Gradient backgrounds on cards",
            "Stock illustration style empty states",
            "Cookie-cutter dashboard layouts with sidebar + topbar + cards",
            "Animated gradients or blobs"
          ]
        },
        designTokens: {
          colors: {
            background: { value: "#09090B", usage: "Primary background, reduces eye strain" },
            backgroundSubtle: { value: "#18181B", usage: "Cards, elevated surfaces" },
            foreground: { value: "#FAFAFA", usage: "Primary text" },
            foregroundMuted: { value: "#71717A", usage: "Secondary text, placeholders" },
            primary: { value: "#6366F1", usage: "Interactive elements, focus states" },
            primaryHover: { value: "#818CF8", usage: "Hover state for primary elements" },
            accent: { value: "#8B5CF6", usage: "Highlights, selected states" },
            border: { value: "#27272A", usage: "Subtle borders, dividers" },
            error: { value: "#EF4444", usage: "Error states, destructive actions" },
            success: { value: "#10B981", usage: "Success states, positive indicators" }
          },
          typography: {
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            scale: {
              xs: "11px/1.4",
              sm: "13px/1.5",
              base: "14px/1.6",
              lg: "16px/1.5",
              xl: "20px/1.4",
              "2xl": "24px/1.3"
            },
            weights: "400 for body, 500 for emphasis, 600 for headings"
          },
          spacing: {
            unit: "4px",
            scale: "4, 8, 12, 16, 20, 24, 32, 48, 64"
          },
          radius: {
            sm: "4px - inputs, small buttons",
            md: "8px - cards, modals",
            lg: "12px - large containers",
            full: "9999px - pills, avatars only"
          },
          shadows: {
            subtle: "0 1px 2px rgba(0,0,0,0.3) - elevated elements",
            medium: "0 4px 12px rgba(0,0,0,0.4) - dropdowns, popovers",
            strong: "0 8px 24px rgba(0,0,0,0.5) - modals, command palette"
          }
        },
        componentPatterns: {
          buttons: {
            primary: "bg-indigo-500, text-white, font-medium, subtle shadow, 200ms transitions",
            secondary: "bg-zinc-800, text-zinc-200, border border-zinc-700",
            ghost: "transparent bg, text-zinc-400, hover:bg-zinc-800",
            states: "Hover: slight brightness increase. Active: scale(0.98). Disabled: 50% opacity. Loading: spinner replaces text"
          },
          inputs: {
            default: "bg-zinc-800/50, border-zinc-700, focus:border-indigo-500, focus:ring-1",
            error: "border-red-500, red error text below input with icon",
            sizes: "sm: 32px height, md: 40px height, lg: 48px height"
          },
          cards: {
            default: "bg-zinc-900/50, border border-zinc-800/50, rounded-xl, p-4",
            interactive: "hover:border-zinc-700, cursor-pointer, transition-colors"
          },
          feedback: {
            loading: "Skeleton for content, spinner for actions, progress bar for uploads",
            empty: "Subtle icon + short message + action button, no illustrations",
            error: "Red tint, icon, clear message, retry action",
            success: "Green accent, checkmark, auto-dismiss toast after 3s"
          },
          navigation: {
            pattern: "Left sidebar (collapsed on mobile) + contextual top bar",
            activeState: "bg-zinc-800/50, left border accent, font-medium",
            transitions: "Fade between pages, 150ms duration"
          }
        },
        interactionPatterns: {
          animations: {
            duration: "150ms for micro, 200ms for transitions, ease-out",
            microInteractions: "Button scale on click, input focus glow, toggle slide",
            pageTransitions: "Fade-in content, 150ms"
          },
          feedback: {
            clickFeedback: "Subtle scale(0.98) on press",
            hoverStates: "Background color shift, border color change",
            focusRing: "2px ring, primary color, offset-2"
          }
        },
        responsiveApproach: {
          breakpoints: "sm:640px, md:768px, lg:1024px, xl:1280px",
          mobileFirst: "Stack layouts, hide sidebar to sheet, larger touch targets",
          touchTargets: "Minimum 44px for interactive elements"
        },
        accessibilityRequirements: {
          contrastRatio: "4.5:1 minimum for text, 3:1 for large text",
          focusManagement: "Visible focus rings, logical tab order, focus trap in modals",
          screenReader: "Semantic HTML, ARIA labels, live regions for updates",
          motionSensitivity: "Respect prefers-reduced-motion, disable non-essential animations"
        },
        contentGuidelines: {
          toneOfVoice: "Direct and helpful, not cute or corporate. 'Save changes' not 'Let's save those changes!'",
          microcopy: {
            buttons: "Action verbs: Save, Create, Delete. Not 'Submit' or 'OK'",
            errors: "What went wrong + how to fix it. 'Email is required' not 'Invalid input'",
            empty: "Explain what goes here + how to add it. Keep under 20 words."
          }
        }
      }
    };
  }

  mockGenerateStories(features) {
    const stories = features.map((f, i) => {
      const epicNum = Math.floor(i / 3) + 1;
      const storyNum = (i % 3) + 1;
      const slug = f.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 30);

      return {
        epicNumber: epicNum,
        storyNumber: storyNum,
        title: f.name,
        filename: `story-${epicNum}-${storyNum}-${slug}.md`,
        content: `# Story ${epicNum}.${storyNum}: ${f.name}

**Status:** ready-for-dev
**Priority:** ${f.priority || 'medium'}
**Complexity:** ${f.estimatedComplexity || 'medium'}

---

## User Story

${f.userStory || `As a user, I want to ${f.name.toLowerCase()}, so that I can be more productive.`}

---

## Acceptance Criteria

${(f.acceptanceCriteria || ['Feature works as described', 'No errors in console', 'Responsive on mobile']).map((c, j) => `${j + 1}. [ ] ${c}`).join('\n')}

---

## Implementation Tasks

- [ ] **Task 1:** Create component structure (AC: #1)
  - [ ] Subtask 1.1: Set up component file
  - [ ] Subtask 1.2: Define props interface
- [ ] **Task 2:** Implement core functionality (AC: #2)
  - [ ] Subtask 2.1: Add business logic
  - [ ] Subtask 2.2: Connect to state
- [ ] **Task 3:** Add tests and validation (AC: #3)
  - [ ] Subtask 3.1: Write unit tests
  - [ ] Subtask 3.2: Manual testing

---

## Dev Notes

### Architecture
- Component location: src/components/${slug}/
- State: Zustand store for this feature
- Styling: Tailwind CSS utilities

### Edge Cases
${(f.edgeCases || ['Handle empty state', 'Handle loading state', 'Handle error state']).map(e => `- ${e}`).join('\n')}

---

## Dependencies

- **Requires:** ${(f.dependencies || ['Base app setup']).join(', ')}
- **Blocks:** None

---

## References

- PRD: See Functional Requirements section
- Feature: ${f.name}
`,
      };
    });

    return {
      success: true,
      stories,
      epicSummary: {
        '1': 'Core Features',
        '2': 'Enhanced Features',
      },
      implementationOrder: stories.map(s => s.filename),
      totalComplexity: `${stories.length} stories`,
    };
  }

  // ============================================================================
  // DESIGN VARIATIONS - Multi-model UI component generation
  // ============================================================================
  async generateDesignVariations(designBrief, pageType = 'landing') {
    try {
      const response = await fetch(`${API_BASE_URL}/design/variations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ designBrief, pageType }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Track usage for each variation
      if (data._meta && data.variations) {
        data.variations.forEach((variation) => {
          if (variation._meta) {
            trackUsage('designVariations', variation);
          }
        });
      }

      return data;
    } catch (error) {
      console.error('Design variations generation failed:', error);
      throw error;
    }
  }

  // ============================================================================
  // EXPAND TO HOMEPAGE - Transform component into full homepage
  // ============================================================================
  async expandToHomepage(selectedVariation, designBrief, pageType = 'landing') {
    try {
      const response = await fetch(`${API_BASE_URL}/design/expand`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedVariation, designBrief, pageType }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Track usage
      if (data._meta) {
        trackUsage('expandHomepage', data);
      }

      return data;
    } catch (error) {
      console.error('Homepage expansion failed:', error);
      throw error;
    }
  }
}

export const aiService = new AIService();
