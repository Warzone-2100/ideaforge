# Template Inspiration System - Implementation Plan
**Using Gemini Flash 3 Vision**

Updated: December 27, 2025

---

## Overview
Build a feature where users upload design screenshots → **Gemini Flash 3** analyzes structure → Generate customized versions with user's design tokens.

**Why Gemini Flash 3?**
- ✅ Best vision quality among available models
- ✅ Faster than Claude vision (~3-5s vs 8-10s)
- ✅ Cheaper: $0.50/$3.00 per 1M tokens
- ✅ Excellent at layout/structure recognition
- ✅ Good at color palette extraction

---

## Phase 1: Screenshot Upload & Analysis (MVP)
**Timeline:** 4-6 hours
**Cost per analysis:** ~$0.015 (3x cheaper than Claude vision!)

### Step 1: Backend - Vision Analysis with Gemini Flash 3
**File:** `backend/services/aiService.js`

```javascript
// NEW: Vision-capable AI call using Gemini Flash 3
async function callGeminiVision(systemPrompt, userMessage, imageBase64, config) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = config.primary; // google/gemini-3-flash-preview

  const messages = [
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: systemPrompt + '\n\n' + userMessage
        },
        {
          type: 'image_url',
          image_url: {
            url: `data:image/jpeg;base64,${imageBase64}`,
            detail: 'high' // High detail for better analysis
          }
        }
      ]
    }
  ];

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://ideaforge.app',
      'X-Title': 'IdeaForge'
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: config.maxTokens,
      temperature: config.temperature
    })
  });

  const data = await response.json();

  return {
    content: data.choices[0].message.content,
    usage: {
      promptTokens: data.usage.prompt_tokens,
      completionTokens: data.usage.completion_tokens,
      totalTokens: data.usage.total_tokens,
      model,
      cost: calculateCost(model, data.usage.prompt_tokens, data.usage.completion_tokens)
    }
  };
}

// NEW: Analyze design screenshot
export async function analyzeDesignScreenshot(imageBase64, userNotes = '') {
  const systemPrompt = `You are a senior UI/UX designer analyzing a design screenshot.

Extract the following information and return ONLY valid JSON:

{
  "layout": "Describe layout structure (e.g., 'sidebar-left + top-nav + 3-column-grid')",
  "components": ["List component types", "e.g. metric cards", "data table", "line chart"],
  "colorPalette": {
    "primary": "#HEX",
    "secondary": "#HEX",
    "accent": "#HEX",
    "background": "#HEX",
    "text": "#HEX"
  },
  "typography": {
    "style": "Sans-serif / Serif / Monospace",
    "weight": "Light / Regular / Medium / Bold",
    "feel": "Modern, clean, professional"
  },
  "spacing": "Compact / Balanced / Generous",
  "mood": "Professional / Playful / Minimal / Bold / Elegant",
  "patterns": ["List UI patterns", "e.g. Hover lift effect", "Icon buttons", "Rounded corners"],
  "category": "dashboard / landing / settings / admin / ecommerce",
  "referenceProducts": ["Similar to...", "e.g. Linear", "Stripe", "Notion"],
  "gridSystem": "12-column / Flexbox / CSS Grid / Custom",
  "responsiveness": "Desktop-first / Mobile-first / Responsive"
}

Be specific and detailed. Extract exact hex colors from the image.`;

  const userMessage = userNotes
    ? `User notes about this design: ${userNotes}\n\nAnalyze this UI design screenshot.`
    : 'Analyze this UI design screenshot in detail.';

  try {
    const config = MODEL_CONFIGS.templateVision; // Gemini 3 Flash with vision
    const { content, usage } = await callGeminiVision(systemPrompt, userMessage, imageBase64, config);

    // Parse JSON response
    let analysis;
    try {
      const jsonMatch = content.match(/\`\`\`json\n([\s\S]*?)\n\`\`\`/) || content.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      analysis = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Failed to parse vision analysis:', parseError);
      return {
        success: false,
        error: 'Failed to parse design analysis',
        rawResponse: content
      };
    }

    return {
      success: true,
      analysis,
      cost: usage.cost.total,
      model: usage.model,
      tokens: usage.totalTokens
    };
  } catch (error) {
    console.error('Vision analysis error:', error);

    // Try fallback model (Claude vision)
    if (error.message.includes('terminated') || error.message.includes('failed')) {
      const fallbackConfig = {
        ...MODEL_CONFIGS.templateVision,
        primary: MODEL_CONFIGS.templateVision.fallback
      };
      return await callGeminiVision(systemPrompt, userMessage, imageBase64, fallbackConfig);
    }

    throw error;
  }
}
```

**New Route:**
```javascript
// backend/server.js
app.post('/api/templates/analyze', async (req, res) => {
  try {
    const { image, notes } = req.body;
    if (!image) {
      return res.status(400).json({ success: false, error: 'Image is required' });
    }

    // Validate image is base64
    if (!image.startsWith('data:image/')) {
      return res.status(400).json({ success: false, error: 'Invalid image format' });
    }

    const result = await analyzeDesignScreenshot(image, notes);
    res.json(result);
  } catch (error) {
    console.error('Template analysis error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});
```

---

### Step 2: Frontend - Upload UI Component
**Use:** `Task` with `subagent_type: frontend-specialist`

**Prompt for subagent:**
```
Create TemplateUploadModal.jsx component for uploading design screenshots.

Requirements:
- Modal overlay (same style as DesignSystemEditor)
- Drag & drop zone for images (accept: image/png, image/jpeg, image/jpg)
- File input button as fallback
- Image preview after upload (max 400px width)
- Form fields:
  * Template name (text input, required)
  * Category (dropdown: dashboard, landing, settings, admin, ecommerce)
  * Optional notes (textarea, placeholder: "e.g., This is from Stripe's dashboard")
- "Analyze with AI" button
  * Shows cost estimate: "~$0.015"
  * Disabled if no image uploaded
- Loading state during analysis (show spinner + "Analyzing with Gemini Flash 3...")
- Success message on completion
- Error handling with clear messages

Design:
- Dark theme (zinc-900 bg, zinc-800 borders)
- Indigo accents for buttons
- Image preview with subtle shadow
- Responsive (works on mobile)

Technical:
- Convert uploaded file to base64
- Validate file size (max 5MB)
- Compress if needed using browser canvas API
- Call aiService.analyzeTemplate(base64Image, name, category, notes)
- On success: call addTemplateToLibrary(result) and close modal
- On error: show error message, keep modal open
```

**File:** `src/components/design/TemplateUploadModal.jsx`

---

### Step 3: State Management
**File:** `src/stores/useAppStore.js`

```javascript
// Add to designVariations state:
designVariations: {
  // ... existing
  templateLibrary: [], // NEW: User-uploaded templates
  isUploadingTemplate: false, // NEW: Loading state
}

// Add actions:
addTemplateToLibrary: (template) => set((state) => ({
  designVariations: {
    ...state.designVariations,
    templateLibrary: [
      {
        id: crypto.randomUUID(),
        name: template.name,
        category: template.category,
        source: 'screenshot',
        uploadedAt: new Date().toISOString(),
        analysis: template.analysis,
        thumbnail: template.thumbnail, // base64 image (compressed to 200x200)
        notes: template.notes || '',
        cost: template.cost || 0,
        model: template.model || 'gemini-3-flash',
        tokens: template.tokens || 0
      },
      ...state.designVariations.templateLibrary
    ]
  }
})),

removeTemplateFromLibrary: (id) => set((state) => ({
  designVariations: {
    ...state.designVariations,
    templateLibrary: state.designVariations.templateLibrary.filter(t => t.id !== id)
  }
})),

setUploadingTemplate: (isUploading) => set((state) => ({
  designVariations: {
    ...state.designVariations,
    isUploadingTemplate: isUploading
  }
}))
```

---

### Step 4: Frontend API Service
**File:** `src/services/aiService.js`

```javascript
async analyzeTemplate(imageBase64, name, category, notes = '') {
  try {
    const response = await fetch(`${API_BASE_URL}/templates/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: imageBase64,
        notes
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Analysis failed');
    }

    return {
      ...data,
      name,
      category,
      thumbnail: imageBase64 // Will compress later
    };
  } catch (error) {
    console.error('Template analysis error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
```

---

### Step 5: Template Library Grid
**Use:** `Task` with `subagent_type: frontend-specialist`

**Prompt for subagent:**
```
Update DesignStudioStep.jsx to show template library before design brief generation.

Add a new section ABOVE the "Generate Design Brief" card:

<div className="template-section">
  <div className="flex items-center justify-between mb-4">
    <div>
      <h3>Templates & Inspiration</h3>
      <p className="text-sm text-zinc-400">
        Upload designs you love or use built-in templates
      </p>
    </div>
    <button onClick={() => setShowUploadModal(true)}>
      + Upload Template
    </button>
  </div>

  <div className="grid grid-cols-5 gap-4">
    {/* Built-in templates */}
    <TemplateCard
      name="Linear"
      thumbnail="/templates/linear.png"
      category="dashboard"
      isBuiltIn={true}
    />
    <TemplateCard
      name="Stripe"
      thumbnail="/templates/stripe.png"
      category="dashboard"
      isBuiltIn={true}
    />

    {/* User templates */}
    {templateLibrary.map(template => (
      <TemplateCard
        key={template.id}
        name={template.name}
        thumbnail={template.thumbnail}
        category={template.category}
        analysis={template.analysis}
        cost={template.cost}
        onDelete={() => removeTemplateFromLibrary(template.id)}
      />
    ))}

    {/* Add button */}
    <AddTemplateCard onClick={() => setShowUploadModal(true)} />
  </div>
</div>

TemplateCard component:
- 200px × 160px card
- Shows thumbnail image (object-fit: cover)
- Category badge at top-right
- Name at bottom
- Hover: Shows "Use" button overlay + delete icon (if not built-in)
- Click: setSelectedTemplate(template)
- Visual indicator if currently selected (indigo border)

Design:
- Rounded-xl corners
- Zinc-800 background
- Subtle shadow
- Smooth hover transition
```

---

### Step 6: Generate from Template
**File:** `backend/services/aiService.js`

```javascript
export async function generateFromTemplate(templateAnalysis, designBrief, pageType = 'dashboard') {
  const systemPrompt = `You are generating a ${pageType} UI based on a template structure analysis.

TEMPLATE STRUCTURE TO FOLLOW:
${JSON.stringify(templateAnalysis, null, 2)}

USER'S DESIGN BRIEF (apply these tokens):
- Primary Color: ${designBrief.designTokens.colors.primary.value}
- Secondary Color: ${designBrief.designTokens.colors.secondary.value}
- Accent Color: ${designBrief.designTokens.colors.accent.value}
- Font Family: ${designBrief.designTokens.typography.fontFamilies.primary.value}
- Brand Mood: ${designBrief.visualIdentity.mood}
- Product Name: ${designBrief.projectOverview.productName}

CRITICAL REQUIREMENTS:
1. **KEEP** the template's layout structure (${templateAnalysis.layout})
2. **KEEP** the template's component types (${templateAnalysis.components.join(', ')})
3. **APPLY** user's colors (replace template palette with user's palette)
4. **APPLY** user's fonts
5. **MATCH** user's brand mood in content/copy
6. **USE** the template's patterns (${templateAnalysis.patterns.join(', ')})

Output production-ready HTML with inline CSS. Make it look like the template but with the user's brand identity.`;

  const userMessage = `Generate a ${pageType} page following the template structure but with my design tokens.`;

  const config = MODEL_CONFIGS.expandHomepage; // Claude Sonnet for quality
  const { content, usage } = await callAIWithFallback(systemPrompt, userMessage, config);

  // Extract HTML
  const htmlMatch = content.match(/```html\n([\s\S]*?)\n```/);
  const html = htmlMatch ? htmlMatch[1] : content;

  return {
    success: true,
    html,
    templateUsed: templateAnalysis.category || 'custom',
    cost: usage.cost.total,
    tokens: usage.totalTokens
  };
}
```

**New Route:**
```javascript
app.post('/api/templates/generate', async (req, res) => {
  try {
    const { templateId, designBrief, pageType } = req.body;

    if (!templateId || !designBrief) {
      return res.status(400).json({
        success: false,
        error: 'Template ID and design brief required'
      });
    }

    // Get template from request (frontend sends full template object)
    const template = req.body.template;

    const result = await generateFromTemplate(
      template.analysis,
      designBrief,
      pageType || 'dashboard'
    );

    res.json(result);
  } catch (error) {
    console.error('Template generation error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});
```

---

### Step 7: Integration with Design Variations
**File:** `src/components/design/DesignVariationsStep.jsx`

```javascript
// Add template selector before "Generate Variations" button

const [selectedTemplate, setSelectedTemplate] = useState(null);

<div className="template-option">
  <label>Generate from:</label>
  <select
    value={selectedTemplate?.id || ''}
    onChange={(e) => {
      const id = e.target.value;
      if (!id) {
        setSelectedTemplate(null);
      } else {
        const template = templateLibrary.find(t => t.id === id);
        setSelectedTemplate(template);
      }
    }}
  >
    <option value="">From scratch (3 AI variations)</option>
    <optgroup label="Built-in Templates">
      <option value="linear">Linear Style</option>
      <option value="stripe">Stripe Style</option>
      <option value="notion">Notion Style</option>
    </optgroup>
    {templateLibrary.length > 0 && (
      <optgroup label="Your Templates">
        {templateLibrary.map(t => (
          <option key={t.id} value={t.id}>
            {t.name} ({t.category})
          </option>
        ))}
      </optgroup>
    )}
  </select>
</div>

// Modify generate handler:
const handleGenerateVariations = async () => {
  if (selectedTemplate) {
    // Generate from specific template
    setLoading(true);
    const result = await aiService.generateFromTemplate(
      selectedTemplate.id,
      selectedTemplate,
      activeDesignBrief,
      currentPage
    );
    setVariations([result]); // Show single result
    setLoading(false);
  } else {
    // Original: 3 variations from scratch
    const result = await aiService.generateDesignVariations(activeDesignBrief, currentPage);
    setVariations(result.variations);
  }
};
```

---

## Cost Breakdown

| Action | Model | Tokens | Cost |
|--------|-------|--------|------|
| Screenshot analysis | Gemini 3 Flash | ~3000 | $0.015 |
| Generate from template | Claude Sonnet | ~8000 | $0.08 |
| **Total per template use** | | | **$0.095** |

**Comparison:**
- Current (3 variations from scratch): $0.020
- Template-based (1 targeted result): $0.095
- **Trade-off:** 5x cost BUT infinitely more personalized + diverse

---

## Success Metrics

✅ Users can upload screenshots (PNG/JPG, max 5MB)
✅ Gemini Flash 3 accurately analyzes layout (>90% accuracy)
✅ Templates save to library with thumbnails
✅ Generate from template applies user tokens correctly
✅ Cost tracking shows template usage
✅ Error handling for invalid/large images

---

## Next Steps

1. ✅ Add Gemini 3 Flash vision config to models.js
2. Build backend vision analysis endpoint
3. Build upload modal (frontend-specialist)
4. Add template library to state
5. Build template grid display (frontend-specialist)
6. Build generate-from-template endpoint
7. Integrate with design variations
8. Test with 5 sample screenshots
9. Commit & push to GitHub

---

**Ready to start building?**
