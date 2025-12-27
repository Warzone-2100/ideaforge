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
