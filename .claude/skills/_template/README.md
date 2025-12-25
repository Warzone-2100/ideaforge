# Skill Template

This folder contains the template for creating new skills.

## How to Create a New Skill

1. **Copy this folder:**
   ```bash
   cp -r _template your-skill-name
   ```

2. **Edit `skill.md`:**
   - Update the METADATA section at the top
   - Fill in all sections with your skill's content
   - Keep Quick Start minimal (under 5 minutes to implement)
   - Make Full Implementation comprehensive

3. **Add examples:**
   - Put working code in `examples/`
   - Each example should be copy-paste ready
   - Include TypeScript types

4. **Register your skill:**
   - Add entry to `../index.json`

## Skill Design Principles

1. **Progressive Disclosure**
   - Metadata loads first (~100 tokens)
   - Quick Start for fast implementation
   - Full Implementation for complete understanding

2. **Copy-Paste Ready**
   - All code should work when copied
   - Include all imports
   - Show file paths in comments

3. **Opinionated but Flexible**
   - Recommend specific approaches
   - Explain trade-offs
   - Allow customization

4. **Security First**
   - Include security checklist
   - Warn about common vulnerabilities
   - Show secure patterns by default

## File Structure

```
your-skill-name/
├── skill.md           # Main documentation (required)
├── README.md          # Quick overview (optional)
├── examples/          # Working code examples
│   ├── basic.tsx      # Minimal implementation
│   ├── advanced.tsx   # Full-featured implementation
│   └── hooks.ts       # Reusable hooks/utilities
└── patterns/          # Optional: specific patterns
    ├── webhooks.md
    └── error-handling.md
```
