---
name: nextjs-app-router
description: Modern Next.js 14+ patterns including App Router, Server Components, Server Actions, and Middleware. Use when building Next.js applications, converting from Pages Router, implementing server-side rendering, or when the user mentions Next.js, React Server Components, or App Router. Requires context7 MCP for latest documentation.
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
---

# Next.js App Router

Build modern Next.js applications using App Router, Server Components, and Server Actions.

## When to Use This Skill

Use this skill when you need to:
- Build a new Next.js application from scratch
- Convert Pages Router to App Router  
- Implement Server Components and Server Actions
- Set up authentication middleware
- Understand RSC patterns and data fetching

**Do NOT use this skill if:**
- You're using Pages Router (different patterns)
- You need static site only → Consider Astro or plain Vite
- You're building a SPA without SSR → Use Vite + React

## Quick Start (Minimum Viable Implementation)

### 1. Create New Project
```bash
npx create-next-app@latest my-app --typescript --tailwind --eslint --app --src-dir
cd my-app
```

### 2. Understand the File Structure
```
src/
├── app/
│   ├── layout.tsx        # Root layout (wraps all pages)
│   ├── page.tsx          # Home page (/)
│   ├── globals.css       # Global styles
│   └── dashboard/
│       └── page.tsx      # Dashboard page (/dashboard)
```

### 3. Your First Server Component
```typescript
// app/page.tsx
// This is a Server Component by default!
export default async function Home() {
  // You can fetch data directly - no useEffect needed
  const data = await fetch('https://api.example.com/data')
  const items = await data.json()

  return (
    <main>
      <h1>My App</h1>
      {items.map(item => <div key={item.id}>{item.name}</div>)}
    </main>
  )
}
```

### 4. Your First Client Component
```typescript
// components/counter.tsx
'use client' // This directive makes it a Client Component

import { useState } from 'react'

export function Counter() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>
}
```

### 5. Run It
```bash
npm run dev
# Open http://localhost:3000
```

For complete implementation patterns including middleware, server actions, and error handling, see [reference.md](reference.md).

## References

- Use context7 to fetch latest Next.js 14 documentation
- [Next.js App Router Docs](https://nextjs.org/docs/app)
- [Server Components RFC](https://github.com/reactjs/rfcs/blob/main/text/0188-server-components.md)
