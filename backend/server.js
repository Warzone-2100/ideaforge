import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import { analyzeResearch, generateFeatures, refineFeatures, generatePRD, generateDatabaseSchema, generateApiEndpoints, generateComponentTree, generatePrompt, generateStoryFiles, generateDesignBrief, chatWithExport, generateDesignVariations, expandToHomepage } from './services/aiService.js';
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
    const { designBrief } = req.body;
    if (!designBrief) {
      return res.status(400).json({ success: false, error: 'Design brief is required' });
    }

    const result = await generateDesignVariations(designBrief);
    res.json(result);
  } catch (error) {
    console.error('Design variations generation error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Expand variation to full homepage
app.post('/api/design/expand', async (req, res) => {
  try {
    const { selectedVariation, designBrief } = req.body;
    if (!selectedVariation || !designBrief) {
      return res.status(400).json({ success: false, error: 'Selected variation and design brief are required' });
    }

    const result = await expandToHomepage(selectedVariation, designBrief);
    res.json(result);
  } catch (error) {
    console.error('Homepage expansion error:', error);
    res.status(500).json({ success: false, error: error.message });
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
  ║   POST /api/stories/generate - Generate stories   ║
  ║   POST /api/export/chat      - Export ideation    ║
  ║   POST /api/export/:format   - Export prompts     ║
  ║                                                   ║
  ╚═══════════════════════════════════════════════════╝
  `);
});
