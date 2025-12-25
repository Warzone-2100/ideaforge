/**
 * Skills Service
 *
 * Detects required integration skills from user research/features/PRD
 * and loads the relevant skill documentation to inject into prompts.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to skills directory
const SKILLS_DIR = path.join(__dirname, '../../.claude/skills');
const SKILLS_INDEX = path.join(SKILLS_DIR, 'index.json');

/**
 * Load the skills registry
 */
function loadSkillsRegistry() {
  try {
    if (!fs.existsSync(SKILLS_INDEX)) {
      console.warn('Skills registry not found at:', SKILLS_INDEX);
      return null;
    }

    const content = fs.readFileSync(SKILLS_INDEX, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Error loading skills registry:', error);
    return null;
  }
}

/**
 * Detect which skills are needed based on text analysis
 *
 * @param {Object} context - { research, features, prd }
 * @returns {Array} - Array of detected skill objects
 */
function detectRequiredSkills(context) {
  const registry = loadSkillsRegistry();
  if (!registry) return [];

  // Combine all text for analysis
  const allText = [
    context.research || '',
    context.prd || '',
    ...(context.features || []).map(f => `${f.name} ${f.description} ${f.userStory}`)
  ].join(' ').toLowerCase();

  const detectedSkills = [];
  const detectionPatterns = registry.usage?.detection_patterns || [];

  // Check each detection pattern
  for (const pattern of detectionPatterns) {
    const triggers = pattern.trigger || [];
    const matched = triggers.some(keyword => allText.includes(keyword.toLowerCase()));

    if (matched) {
      // Find the skill in the registry
      const skill = registry.skills.find(s => s.name === pattern.skill);
      if (skill && !detectedSkills.find(s => s.name === skill.name)) {
        detectedSkills.push({
          ...skill,
          matchedKeywords: triggers.filter(k => allText.includes(k.toLowerCase()))
        });
      }
    }
  }

  // Always include foundational skills (like nextjs-app-router)
  const foundationalSkills = registry.skills.filter(s => s.complexity === 'foundational');
  for (const skill of foundationalSkills) {
    if (!detectedSkills.find(s => s.name === skill.name)) {
      detectedSkills.push({ ...skill, matchedKeywords: [] });
    }
  }

  return detectedSkills;
}

/**
 * Load skill content from reference.md (or fallback to skill.md)
 *
 * @param {string} skillName - Name of the skill
 * @param {string} section - 'quick-start' or 'full' (default: quick-start)
 * @returns {string} - Skill content or null
 */
function loadSkillContent(skillName, section = 'quick-start') {
  try {
    // Try new format first (reference.md)
    let skillPath = path.join(SKILLS_DIR, skillName, 'reference.md');

    // Fallback to old format
    if (!fs.existsSync(skillPath)) {
      skillPath = path.join(SKILLS_DIR, skillName, 'skill.md');
    }

    if (!fs.existsSync(skillPath)) {
      console.warn(`Skill not found: ${skillName}`);
      return null;
    }

    const content = fs.readFileSync(skillPath, 'utf8');

    // Extract the relevant section
    if (section === 'quick-start') {
      return extractQuickStart(content);
    } else if (section === 'full') {
      return content; // Return full content
    }

    return null;
  } catch (error) {
    console.error(`Error loading skill ${skillName}:`, error);
    return null;
  }
}

/**
 * Extract Quick Start section from skill.md
 */
function extractQuickStart(content) {
  const quickStartMatch = content.match(/## Quick Start[\s\S]*?(?=\n## )/);
  return quickStartMatch ? quickStartMatch[0] : content;
}

/**
 * Extract Full Implementation section from skill.md
 */
function extractFullImplementation(content) {
  const fullMatch = content.match(/## Full Implementation[\s\S]*?(?=\n## File Structure|$)/);
  return fullMatch ? fullMatch[0] : content;
}

/**
 * Get MCP servers required for detected skills
 *
 * @param {Array} skills - Array of skill objects
 * @returns {Array} - Array of unique MCP server names
 */
function getRequiredMCPs(skills) {
  const mcpSet = new Set();

  for (const skill of skills) {
    const mcps = skill.requires_mcp || [];
    mcps.forEach(mcp => mcpSet.add(mcp));
  }

  return Array.from(mcpSet);
}

/**
 * Generate MCP usage instructions for a skill
 *
 * @param {string} skillName - Name of the skill
 * @param {Array} mcps - Array of MCP server names
 * @returns {string} - MCP usage instructions
 */
function generateMCPInstructions(skillName, mcps) {
  if (!mcps || mcps.length === 0) return '';

  const instructions = [];

  instructions.push(`### MCP Tools for ${skillName}`);
  instructions.push('');
  instructions.push('Before implementing, use these MCP servers:');

  for (const mcp of mcps) {
    if (mcp === 'context7') {
      instructions.push(`- **context7**: Fetch the latest documentation for libraries used in this skill`);
    } else if (mcp === 'stripe') {
      instructions.push(`- **stripe**: Access Stripe API for payment integration`);
    } else if (mcp === 'firebase') {
      instructions.push(`- **firebase**: Access Firebase project configuration and services`);
    } else {
      instructions.push(`- **${mcp}**: Required for this integration`);
    }
  }

  instructions.push('');

  return instructions.join('\n');
}

/**
 * Build skills bundle for prompt injection
 *
 * @param {Object} context - { research, features, prd }
 * @param {string} implementationLevel - 'quick-start' or 'full'
 * @returns {Object} - { skillsContent, mcpInstructions, detectedSkills }
 */
function buildSkillsBundle(context, implementationLevel = 'quick-start') {
  const detectedSkills = detectRequiredSkills(context);

  if (detectedSkills.length === 0) {
    return {
      skillsContent: '',
      mcpInstructions: '',
      detectedSkills: []
    };
  }

  const skillSections = [];
  const allMCPs = getRequiredMCPs(detectedSkills);

  // Add header
  skillSections.push('# INTEGRATION SKILLS');
  skillSections.push('');
  skillSections.push(`The following integration patterns have been detected and should be used:`);
  skillSections.push('');

  // Add each skill
  for (const skill of detectedSkills) {
    skillSections.push(`---`);
    skillSections.push('');
    skillSections.push(`## ${skill.name}`);
    skillSections.push(`**Category:** ${skill.category}`);
    skillSections.push(`**Description:** ${skill.description}`);
    if (skill.matchedKeywords.length > 0) {
      skillSections.push(`**Detected from:** ${skill.matchedKeywords.join(', ')}`);
    }
    skillSections.push('');

    // Add MCP instructions for this skill
    const mcpInstructions = generateMCPInstructions(skill.name, skill.requires_mcp);
    if (mcpInstructions) {
      skillSections.push(mcpInstructions);
    }

    // Add skill content
    const skillContent = loadSkillContent(skill.name, implementationLevel);
    if (skillContent) {
      skillSections.push(skillContent);
    }
    skillSections.push('');
  }

  // Build global MCP instructions
  const mcpInstructionsSection = buildGlobalMCPInstructions(allMCPs);

  return {
    skillsContent: skillSections.join('\n'),
    mcpInstructions: mcpInstructionsSection,
    detectedSkills: detectedSkills.map(s => ({
      name: s.name,
      category: s.category,
      description: s.description,
      matchedKeywords: s.matchedKeywords
    }))
  };
}

/**
 * Build global MCP instructions section
 */
function buildGlobalMCPInstructions(mcps) {
  if (!mcps || mcps.length === 0) return '';

  const lines = [];

  lines.push('# 🔧 REQUIRED MCP SERVERS & SETUP');
  lines.push('');
  lines.push('## Pre-Flight Check');
  lines.push('');
  lines.push('**CRITICAL:** Before writing any code, verify and install required MCP servers.');
  lines.push('');
  lines.push('### Step 1: Check Claude Code Version');
  lines.push('```bash');
  lines.push('claude --version');
  lines.push('# Ensure you have Claude Code CLI installed');
  lines.push('```');
  lines.push('');
  lines.push('### Step 2: Install Required MCP Servers');
  lines.push('');

  // Context7 instructions
  if (mcps.includes('context7')) {
    lines.push('**📚 Context7** (Latest Library Documentation)');
    lines.push('```bash');
    lines.push('# Install context7 MCP server');
    lines.push('claude mcp add context7 -- npx -y @upstash/context7-mcp');
    lines.push('');
    lines.push('# Verify installation');
    lines.push('claude mcp list | grep context7');
    lines.push('```');
    lines.push('');
    lines.push('**When to use:**');
    lines.push('- Fetch latest documentation for ANY library (React, Next.js, Stripe, etc.)');
    lines.push('- Get up-to-date API references');
    lines.push('- Find code examples and best practices');
    lines.push('');
    lines.push('**How to use:**');
    lines.push('```');
    lines.push('// In your prompts to Claude:');
    lines.push('"Use context7 to get the latest Stripe Node.js SDK documentation"');
    lines.push('"Fetch Next.js 14 App Router docs via context7"');
    lines.push('```');
    lines.push('');
  }

  // Stripe instructions
  if (mcps.includes('stripe')) {
    lines.push('**💳 Stripe** (Payment Integration)');
    lines.push('```bash');
    lines.push('# Install Stripe MCP server');
    lines.push('claude mcp add stripe -- npx -y @stripe/mcp');
    lines.push('');
    lines.push('# Set Stripe API key (get from https://dashboard.stripe.com/apikeys)');
    lines.push('export STRIPE_API_KEY=sk_test_...');
    lines.push('');
    lines.push('# Verify installation');
    lines.push('claude mcp list | grep stripe');
    lines.push('```');
    lines.push('');
    lines.push('**When to use:**');
    lines.push('- Verify Stripe product and price IDs');
    lines.push('- Check webhook endpoint configuration');
    lines.push('- Validate API keys and test mode settings');
    lines.push('');
  }

  // Firebase instructions
  if (mcps.includes('firebase')) {
    lines.push('**🔥 Firebase** (Backend Services)');
    lines.push('```bash');
    lines.push('# Install Firebase MCP server');
    lines.push('claude mcp add firebase -- npx -y @firebase/mcp');
    lines.push('');
    lines.push('# Authenticate with Google');
    lines.push('# (Claude will prompt you through the flow)');
    lines.push('```');
    lines.push('');
    lines.push('**When to use:**');
    lines.push('- Access Firebase project configuration');
    lines.push('- Validate Firestore security rules');
    lines.push('- Check Firebase Auth settings');
    lines.push('');
  }

  lines.push('### Step 3: Verification');
  lines.push('```bash');
  lines.push('# List all installed MCP servers');
  lines.push('claude mcp list');
  lines.push('');
  lines.push('# You should see:');
  for (const mcp of mcps) {
    lines.push(`#   - ${mcp}`);
  }
  lines.push('```');
  lines.push('');
  lines.push('---');
  lines.push('');

  if (mcps.includes('firebase')) {
    lines.push('- Use firebase MCP to access Firebase project configuration');
  }

  lines.push('');

  return lines.join('\n');
}

/**
 * Generate exportable SKILL.md files for detected skills
 *
 * @param {Array} detectedSkills - Array of detected skill objects
 * @returns {Array} - Array of {filename, content} objects
 */
function generateSkillFiles(detectedSkills) {
  const skillFiles = [];

  for (const skill of detectedSkills) {
    try {
      const skillPath = path.join(SKILLS_DIR, skill.name, 'SKILL.md');

      // Check if SKILL.md exists (new format)
      if (fs.existsSync(skillPath)) {
        const content = fs.readFileSync(skillPath, 'utf8');
        skillFiles.push({
          filename: `${skill.name}-SKILL.md`,
          content: content,
          skillName: skill.name
        });
      } else {
        // Fallback: Generate from old skill.md format
        console.warn(`SKILL.md not found for ${skill.name}, skipping export`);
      }
    } catch (error) {
      console.error(`Error loading SKILL.md for ${skill.name}:`, error);
    }
  }

  return skillFiles;
}

export {
  loadSkillsRegistry,
  detectRequiredSkills,
  loadSkillContent,
  getRequiredMCPs,
  buildSkillsBundle,
  generateSkillFiles,
};
