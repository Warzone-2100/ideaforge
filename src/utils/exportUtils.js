import JSZip from 'jszip';

/**
 * Generates a ZIP file with organized folder structure for all workflow files
 *
 * Structure:
 * ideaforge-export/
 * ├── CLAUDE.md                    (root - main instructions)
 * ├── .cursorrules                 (root - Cursor instructions)
 * ├── docs/
 * │   ├── research.md
 * │   ├── PRD.md
 * │   ├── GEMINI.md
 * │   └── AGENTS.md
 * ├── design/
 * │   ├── design-brief.json
 * │   └── homepage.html
 * └── stories/
 *     ├── story-001.md
 *     ├── story-002.md
 *     └── ...
 */
export async function generateWorkflowZip(data) {
  const {
    research,
    prd,
    databaseSchema,
    apiEndpoints,
    componentTree,
    agentPrompts,
    designVariations,
    storyFiles,
  } = data;

  const zip = new JSZip();

  // Generate timestamp for filename
  const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  // ROOT LEVEL: Main instruction files (Claude Code and Cursor read these first)
  if (agentPrompts.claude) {
    zip.file('CLAUDE.md', agentPrompts.claude);
  }

  if (agentPrompts.cursor) {
    zip.file('.cursorrules', agentPrompts.cursor);
  }

  // DOCS FOLDER: All documentation and reference materials
  const docsFolder = zip.folder('docs');

  if (research?.content) {
    docsFolder.file('research.md', research.content);
  }

  if (prd?.content) {
    docsFolder.file('PRD.md', prd.content);
  }

  // Specification documents (generated from PRD)
  if (databaseSchema?.content) {
    docsFolder.file('DATABASE_SCHEMA.md', databaseSchema.content);
  }

  if (apiEndpoints?.content) {
    docsFolder.file('API_ENDPOINTS.md', apiEndpoints.content);
  }

  if (componentTree?.content) {
    docsFolder.file('COMPONENT_TREE.md', componentTree.content);
  }

  if (agentPrompts.gemini) {
    docsFolder.file('GEMINI.md', agentPrompts.gemini);
  }

  if (agentPrompts.universal) {
    docsFolder.file('AGENTS.md', agentPrompts.universal);
  }

  // DESIGN FOLDER: Visual/frontend assets
  const designFolder = zip.folder('design');

  if (designVariations?.designBrief) {
    const briefContent = JSON.stringify(designVariations.designBrief, null, 2);
    designFolder.file('design-brief.json', briefContent);
  }

  if (designVariations?.homepage?.html) {
    // Generate complete HTML file
    const fullHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Generated Homepage - IdeaForge</title>
  <style>
${designVariations.homepage.css || '/* No CSS */'}
  </style>
</head>
<body>
${designVariations.homepage.html || '<!-- No HTML -->'}
  <script>
${designVariations.homepage.js || '// No JavaScript'}
  </script>
</body>
</html>`;

    designFolder.file('homepage.html', fullHTML);
  }

  // STORIES FOLDER: BMAD-style implementation stories
  if (storyFiles?.files?.length > 0) {
    const storiesFolder = zip.folder('stories');

    storyFiles.files.forEach((story) => {
      storiesFolder.file(story.filename, story.content);
    });
  }

  // Generate the ZIP file as blob
  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: {
      level: 9, // Maximum compression
    },
  });

  // Trigger download
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ideaforge-export-${timestamp}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  return {
    success: true,
    filename: `ideaforge-export-${timestamp}.zip`,
    size: blob.size,
  };
}

/**
 * Generates a milestone-based export ZIP for structured handoff to coding agents
 *
 * Structure:
 * product-plan/
 * ├── product-overview.md
 * ├── prompts/
 * │   ├── one-shot-prompt.md
 * │   └── incremental-prompt.md
 * ├── instructions/
 * │   ├── one-shot-instructions.md
 * │   └── incremental/
 * │       ├── 01-foundation.md
 * │       ├── 02-shell.md
 * │       └── 03-[feature].md, 04-[feature].md, ...
 * ├── design-system/
 * │   ├── tokens.css
 * │   └── tailwind-colors.md
 * ├── data-model/
 * │   ├── README.md
 * │   └── types.ts
 * └── sections/
 *     └── [feature-id]/
 *         ├── README.md
 *         ├── tests.md
 *         └── sample-data.json
 */
export async function generateMilestoneZip(exportData) {
  const {
    productOverview,
    milestones,
    prompts,
    tests,
    clarifyingQuestions,
    features = [],
    designBrief = null,
  } = exportData;

  const zip = new JSZip();
  const timestamp = new Date().toISOString().split('T')[0];

  // ROOT: Product Overview
  if (productOverview) {
    zip.file('product-plan/product-overview.md', productOverview);
  }

  // PROMPTS FOLDER
  const promptsFolder = zip.folder('product-plan/prompts');
  if (prompts?.oneShot) {
    promptsFolder.file('one-shot-prompt.md', prompts.oneShot);
  }
  if (prompts?.incremental) {
    promptsFolder.file('incremental-prompt.md', prompts.incremental);
  }

  // INSTRUCTIONS FOLDER
  const instructionsFolder = zip.folder('product-plan/instructions');

  // One-shot instructions (all milestones combined)
  if (milestones?.foundation && milestones?.features?.length > 0) {
    let oneShotContent = '# One-Shot Implementation Instructions\n\n';
    oneShotContent += '## Foundation\n\n' + milestones.foundation + '\n\n';
    oneShotContent += '---\n\n## Features\n\n';
    milestones.features.forEach((f, i) => {
      oneShotContent += `### ${i + 3}. ${f.title || `Feature ${i + 1}`}\n\n${f.content}\n\n`;
    });
    instructionsFolder.file('one-shot-instructions.md', oneShotContent);
  }

  // Incremental instructions
  const incrementalFolder = instructionsFolder.folder('incremental');
  if (milestones?.foundation) {
    incrementalFolder.file('01-foundation.md', milestones.foundation);
  }

  // Shell milestone (placeholder - could be expanded)
  incrementalFolder.file('02-shell.md', `# Shell Implementation

## Overview
Set up the application shell with navigation and layout.

## Tasks
1. Create the main layout wrapper component
2. Implement navigation sidebar/header
3. Set up routing structure
4. Add user menu component
5. Implement responsive breakpoints

## Acceptance Criteria
- Navigation works on all screen sizes
- Routes are properly configured
- User can navigate between sections
`);

  // Feature milestones
  if (milestones?.features?.length > 0) {
    milestones.features.forEach((feature, index) => {
      const num = String(index + 3).padStart(2, '0');
      const slug = (feature.title || `feature-${index + 1}`)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .substring(0, 30);
      incrementalFolder.file(`${num}-${slug}.md`, feature.content);
    });
  }

  // DESIGN SYSTEM FOLDER
  if (designBrief) {
    const designFolder = zip.folder('product-plan/design-system');

    // Generate CSS tokens from design brief
    const tokens = designBrief.designTokens || designBrief;
    let cssTokens = ':root {\n';
    if (tokens.colors) {
      Object.entries(tokens.colors).forEach(([key, val]) => {
        const value = typeof val === 'object' ? val.value : val;
        cssTokens += `  --color-${key}: ${value};\n`;
      });
    }
    cssTokens += '}\n';
    designFolder.file('tokens.css', cssTokens);

    // Tailwind colors guide
    let tailwindGuide = '# Tailwind Color Configuration\n\n';
    tailwindGuide += '```js\n// tailwind.config.js\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: {\n';
    if (tokens.colors) {
      Object.entries(tokens.colors).forEach(([key, val]) => {
        const value = typeof val === 'object' ? val.value : val;
        tailwindGuide += `        '${key}': '${value}',\n`;
      });
    }
    tailwindGuide += '      },\n    },\n  },\n};\n```\n';
    designFolder.file('tailwind-colors.md', tailwindGuide);
  }

  // SECTIONS FOLDER (per-feature assets)
  if (features.length > 0 && tests?.length > 0) {
    const sectionsFolder = zip.folder('product-plan/sections');

    features.forEach((feature, index) => {
      const slug = (feature.name || `feature-${index + 1}`)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .substring(0, 30);

      const featureFolder = sectionsFolder.folder(slug);

      // README
      featureFolder.file('README.md', `# ${feature.name}

## Description
${feature.description || 'No description provided.'}

## Priority
${feature.priority || 'medium'}

## User Story
${feature.userStory || `As a user, I want to ${feature.name.toLowerCase()}`}

## Acceptance Criteria
${(feature.acceptanceCriteria || ['Feature works as described']).map(c => `- ${c}`).join('\n')}
`);

      // Tests
      if (tests[index]) {
        featureFolder.file('tests.md', tests[index]);
      }

      // Sample data placeholder
      featureFolder.file('sample-data.json', JSON.stringify({
        feature: feature.name,
        sampleItems: [],
        note: 'Add sample data for testing this feature'
      }, null, 2));
    });
  }

  // CLARIFYING QUESTIONS
  if (clarifyingQuestions) {
    zip.file('product-plan/CLARIFYING_QUESTIONS.md', clarifyingQuestions);
  }

  // Generate ZIP
  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
  });

  // Download
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `product-plan-${timestamp}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  return {
    success: true,
    filename: `product-plan-${timestamp}.zip`,
    size: blob.size,
  };
}

/**
 * Helper to format file size
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Get file counts for summary
 */
export function getExportSummary(data) {
  const {
    research,
    prd,
    databaseSchema,
    apiEndpoints,
    componentTree,
    agentPrompts,
    designVariations,
    storyFiles,
  } = data;

  const summary = {
    documentation: 0,
    agentPrompts: 0,
    designAssets: 0,
    storyFiles: 0,
    total: 0,
  };

  // Count documentation files
  if (research?.content) summary.documentation++;
  if (prd?.content) summary.documentation++;
  if (databaseSchema?.content) summary.documentation++;
  if (apiEndpoints?.content) summary.documentation++;
  if (componentTree?.content) summary.documentation++;

  // Count agent prompts
  if (agentPrompts.claude) summary.agentPrompts++;
  if (agentPrompts.cursor) summary.agentPrompts++;
  if (agentPrompts.gemini) summary.agentPrompts++;
  if (agentPrompts.universal) summary.agentPrompts++;

  // Count design assets
  if (designVariations?.designBrief) summary.designAssets++;
  if (designVariations?.homepage?.html) summary.designAssets++;

  // Count story files
  summary.storyFiles = storyFiles?.files?.length || 0;

  // Total
  summary.total =
    summary.documentation +
    summary.agentPrompts +
    summary.designAssets +
    summary.storyFiles;

  return summary;
}
