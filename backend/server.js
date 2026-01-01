import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import { analyzeResearch, generateFeatures, refineFeatures, generatePRD, generateDatabaseSchema, generateApiEndpoints, generateComponentTree, generatePrompt, generateStoryFiles, generateDesignBrief, chatWithExport, generateDesignVariations, expandToHomepage, chatWithDesignBrief, regenerateDesignBrief, analyzeDesignScreenshot, generateFromTemplate, generateDesignLanguage, chatWithDesignLanguage, generateDesignVariation, adaptTemplateContent, extractDesignIntent } from './services/aiService.js';
import { generateSkillFiles } from './services/skillsService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Log to file for debugging
const logFile = '/tmp/ideaforge-backend.log';
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(logFile, logMessage);
  console.log(message);
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Analyze research
app.post('/api/analyze', async (req, res) => {
  try {
    const { research } = req.body;
    if (!research) {
      return res.status(400).json({ success: false, error: 'Research content is required' });
    }

    const result = await analyzeResearch(research);
    res.json(result);
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Generate features
app.post('/api/features/generate', async (req, res) => {
  try {
    const { research, insights } = req.body;
    if (!research || !insights) {
      return res.status(400).json({ success: false, error: 'Research and insights are required' });
    }

    const result = await generateFeatures(research, insights);
    res.json(result);
  } catch (error) {
    console.error('Feature generation error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Refine features via chat
app.post('/api/features/refine', async (req, res) => {
  try {
    const { message, features } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }

    const result = await refineFeatures(message, features);
    res.json(result);
  } catch (error) {
    console.error('Feature refinement error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Generate PRD
app.post('/api/prd/generate', async (req, res) => {
  try {
    const { research, insights, features } = req.body;
    if (!features || features.length === 0) {
      return res.status(400).json({ success: false, error: 'Features are required' });
    }

    const result = await generatePRD(research, insights, features);
    res.json(result);
  } catch (error) {
    console.error('PRD generation error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// NEW: Generate Database Schema (specification-focused)
app.post('/api/schema/generate', async (req, res) => {
  log('📊 [SCHEMA] Request received');
  try {
    const { features, prd } = req.body;
    if (!features || features.length === 0) {
      return res.status(400).json({ success: false, error: 'Features are required' });
    }

    const result = await generateDatabaseSchema(features, prd);
    res.json(result);
  } catch (error) {
    console.error('Database schema generation error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// NEW: Generate API Endpoints (specification-focused)
app.post('/api/endpoints/generate', async (req, res) => {
  log('🔌 [ENDPOINTS] Request received');
  try {
    const { features, databaseSchema, prd } = req.body;
    if (!features || features.length === 0) {
      return res.status(400).json({ success: false, error: 'Features are required' });
    }

    const result = await generateApiEndpoints(features, databaseSchema, prd);
    res.json(result);
  } catch (error) {
    console.error('API endpoints generation error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// NEW: Generate Component Tree (specification-focused)
app.post('/api/components/generate', async (req, res) => {
  log('🎨 [COMPONENTS] Request received');
  try {
    const { features, apiEndpoints, prd } = req.body;
    if (!features || features.length === 0) {
      return res.status(400).json({ success: false, error: 'Features are required' });
    }

    const result = await generateComponentTree(features, apiEndpoints, prd);
    res.json(result);
  } catch (error) {
    console.error('Component tree generation error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Generate story files (specification-focused, references spec docs)
app.post('/api/stories/generate', async (req, res) => {
  try {
    const { features, prd, databaseSchema, apiEndpoints, componentTree } = req.body;
    if (!features || features.length === 0) {
      return res.status(400).json({ success: false, error: 'Features are required' });
    }

    const result = await generateStoryFiles(features, prd, databaseSchema, apiEndpoints, componentTree);
    res.json(result);
  } catch (error) {
    console.error('Story generation error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Generate design brief (specific UI/UX direction)
app.post('/api/design/generate', async (req, res) => {
  try {
    const { research, insights, features, productContext } = req.body;
    if (!features || features.length === 0) {
      return res.status(400).json({ success: false, error: 'Features are required' });
    }

    const result = await generateDesignBrief(research, insights, features, productContext);
    res.json(result);
  } catch (error) {
    console.error('Design brief generation error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Chat interface for design system editing
app.post('/api/design/chat', async (req, res) => {
  try {
    const { message, designBrief } = req.body;
    if (!message || !designBrief) {
      return res.status(400).json({ success: false, error: 'Message and design brief are required' });
    }

    const result = await chatWithDesignBrief(message, designBrief);
    res.json(result);
  } catch (error) {
    console.error('Design chat error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Regenerate design brief based on edited tokens
app.post('/api/design/regenerate', async (req, res) => {
  try {
    const { editedDesignBrief, originalDesignBrief } = req.body;
    if (!editedDesignBrief) {
      return res.status(400).json({ success: false, error: 'Edited design brief is required' });
    }

    const result = await regenerateDesignBrief(editedDesignBrief, originalDesignBrief);
    res.json(result);
  } catch (error) {
    console.error('Design brief regeneration error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Chat/ideation for export refinement
app.post('/api/export/chat', async (req, res) => {
  try {
    const { message, context } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }

    const result = await chatWithExport(message, context || {});
    res.json(result);
  } catch (error) {
    console.error('Export chat error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Generate prompts for different formats
app.post('/api/export/:format', async (req, res) => {
  try {
    const { format } = req.params;
    const { research, insights, features, prd } = req.body;

    if (!['claude', 'cursor', 'gemini', 'universal'].includes(format)) {
      return res.status(400).json({ success: false, error: 'Invalid format' });
    }

    const result = await generatePrompt(format, research, insights, features, prd);

    // Add exportable SKILL.md files
    if (result.success && result.detectedSkills && result.detectedSkills.length > 0) {
      const skillFiles = generateSkillFiles(result.detectedSkills);
      result.skillFiles = skillFiles;
    }

    res.json(result);
  } catch (error) {
    console.error('Prompt generation error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Generate design variations (3 models in parallel)
app.post('/api/design/variations', async (req, res) => {
  try {
    const { designBrief, pageType } = req.body;
    if (!designBrief) {
      return res.status(400).json({ success: false, error: 'Design brief is required' });
    }

    const result = await generateDesignVariations(designBrief, pageType || 'landing');
    res.json(result);
  } catch (error) {
    console.error('Design variations generation error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Expand variation to full page
app.post('/api/design/expand', async (req, res) => {
  try {
    const { selectedVariation, designBrief, pageType } = req.body;
    if (!selectedVariation || !designBrief) {
      return res.status(400).json({ success: false, error: 'Selected variation and design brief are required' });
    }

    const result = await expandToHomepage(selectedVariation, designBrief, pageType || 'landing');
    res.json(result);
  } catch (error) {
    console.error('Page expansion error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// DESIGN STUDIO V2 ENDPOINTS
// ============================================================================

// Generate design language from PRD context
app.post('/api/design/language/generate', async (req, res) => {
  try {
    const { research, insights, features, prd } = req.body;
    const result = await generateDesignLanguage({ research, insights, features, prd });
    res.json(result);
  } catch (error) {
    console.error('Design language generation error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Chat with design language to modify tokens
app.post('/api/design/language/chat', async (req, res) => {
  try {
    const { message, currentTokens } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }
    const result = await chatWithDesignLanguage(message, currentTokens || {});
    res.json(result);
  } catch (error) {
    console.error('Design language chat error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Generate a design variation using design language + layout
app.post('/api/design/variation/generate', async (req, res) => {
  try {
    const { pageType, layout, designLanguage, variationIndex, prdContext } = req.body;
    if (!pageType || !designLanguage) {
      return res.status(400).json({ success: false, error: 'Page type and design language are required' });
    }
    // Log PRD context for debugging
    console.log('[DESIGN] PRD context received:', prdContext ? 'Yes' : 'No',
      prdContext?.prd ? `PRD: ${prdContext.prd.substring(0, 100)}...` : 'No PRD');
    const result = await generateDesignVariation({ pageType, layout, designLanguage, variationIndex, prdContext });
    res.json(result);
  } catch (error) {
    console.error('Design variation generation error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Extract design intent from PRD context
app.post('/api/design/extract-intent', async (req, res) => {
  try {
    const { prdContext } = req.body;

    if (!prdContext) {
      return res.status(400).json({
        success: false,
        error: 'prdContext is required'
      });
    }

    console.log('[INTENT] Extracting design intent from PRD context');

    const result = await extractDesignIntent(prdContext);
    res.json(result);
  } catch (error) {
    console.error('Design intent extraction error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Analyze design screenshot (template inspiration)
app.post('/api/templates/analyze', async (req, res) => {
  try {
    const { image, notes } = req.body;

    if (!image) {
      return res.status(400).json({
        success: false,
        error: 'Image is required'
      });
    }

    // Validate image format (should be data:image/... base64)
    if (!image.startsWith('data:image/')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid image format. Must be base64 data URL (data:image/...)'
      });
    }

    // Check image size (approximate - base64 is ~33% larger than binary)
    const base64Length = image.length;
    const estimatedBytes = (base64Length * 3) / 4;
    const estimatedMB = estimatedBytes / (1024 * 1024);

    if (estimatedMB > 10) {
      return res.status(400).json({
        success: false,
        error: `Image too large (${estimatedMB.toFixed(1)}MB). Maximum 10MB.`
      });
    }

    console.log(`[TEMPLATE] Analyzing screenshot (${estimatedMB.toFixed(2)}MB)`);

    const result = await analyzeDesignScreenshot(image, notes);

    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('Template analysis error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to analyze screenshot'
    });
  }
});

// Adapt code template content based on PRD context (now archetype-aware)
app.post('/api/templates/adapt', async (req, res) => {
  try {
    const { templateSlots, prdContext, designIntent } = req.body;

    if (!templateSlots || !prdContext) {
      return res.status(400).json({
        success: false,
        error: 'templateSlots and prdContext are required'
      });
    }

    console.log(`[TEMPLATE] Adapting ${templateSlots.length} content slots${designIntent?.archetype ? ` (archetype: ${designIntent.archetype})` : ''}`);

    const result = await adaptTemplateContent(templateSlots, prdContext, designIntent);
    res.json(result);
  } catch (error) {
    console.error('Template content adaptation error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to adapt template content'
    });
  }
});

// Generate from template (apply design tokens to template structure)
app.post('/api/templates/generate', async (req, res) => {
  try {
    const { templateId, template, designBrief, pageType } = req.body;

    if (!template || !designBrief) {
      return res.status(400).json({
        success: false,
        error: 'Template and design brief are required'
      });
    }

    if (!template.analysis) {
      return res.status(400).json({
        success: false,
        error: 'Template must have analysis data'
      });
    }

    console.log(`[TEMPLATE] Generating ${pageType || 'dashboard'} from template: ${template.name || 'Unnamed'}`);

    const result = await generateFromTemplate(
      template.analysis,
      designBrief,
      pageType || 'dashboard'
    );

    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('Template generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate from template'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════════════════╗
  ║                                                   ║
  ║   💡 IdeaForge Backend                            ║
  ║                                                   ║
  ║   Server running on http://localhost:${PORT}         ║
  ║                                                   ║
  ║   Endpoints:                                      ║
  ║   POST /api/analyze          - Analyze research   ║
  ║   POST /api/features/generate - Generate features ║
  ║   POST /api/features/refine  - Chat refinement    ║
  ║   POST /api/prd/generate     - Generate PRD       ║
  ║   POST /api/design/generate  - Generate design    ║
  ║   POST /api/design/variations - 🎨 3 UI variations ║
  ║   POST /api/design/expand    - 🚀 Expand homepage  ║
  ║   POST /api/templates/analyze - 📸 Analyze screenshot║
  ║   POST /api/templates/generate - ✨ Generate from template║
  ║   POST /api/stories/generate - Generate stories   ║
  ║   POST /api/export/chat      - Export ideation    ║
  ║   POST /api/export/:format   - Export prompts     ║
  ║                                                   ║
  ╚═══════════════════════════════════════════════════╝
  `);
});
