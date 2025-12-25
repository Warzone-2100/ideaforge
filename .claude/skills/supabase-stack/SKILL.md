# Skill: Supabase Stack

<!--
METADATA - Keep this section under 100 tokens for quick loading
-->
---
name: "supabase-stack"
version: "1.0.0"
description: "Complete Supabase integration: PostgreSQL database, Row Level Security, real-time subscriptions, auth, and storage"
category: "backend"
complexity: "intermediate"
time_estimate: "3-5 hours"
requires_mcp: ["context7"]
requires_skills: ["nextjs-app-router"]
---

## When to Use This Skill

Use this skill when you need to:
- Set up a complete backend with PostgreSQL database
- Implement Row Level Security (RLS) for multi-tenant apps
- Add real-time subscriptions to tables
- Manage file storage and user authentication
- Build a SaaS with user-scoped data

**Do NOT use this skill if:**
- You need Firebase-specific features → Use `firebase-auth` skill
- You only need simple auth → Simpler options exist
- You're building a static site → Supabase is overkill

---

## Quick Start (Minimum Viable Implementation)

### 1. Create Supabase Project
```bash
# Go to https://supabase.com/dashboard
# Create new project
# Save your project URL and anon key
```

### 2. Install Dependencies
```bash
npm install @supabase/supabase-js @supabase/ssr
```

### 3. Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # Server-side only
```

### 4. Initialize Supabase Client
```typescript
// lib/supabase/client.ts
import { createClientComponentClient } from '@supabase/ssr'

export const supabase = createClientComponentClient()
```

### 5. Create First Table
```sql
-- In Supabase SQL Editor
create table profiles (
  id uuid references auth.users primary key,
  email text,
  full_name text,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table profiles enable row level security;

-- Policy: Users can only see their own profile
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);
```

---

## Full Implementation

### Database Schema Design

#### User Profiles
```sql
create table profiles (
  id uuid references auth.users primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  subscription_tier text default 'free',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

#### Multi-Tenant Data (Example: Projects)
```sql
create table projects (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS Policies
alter table projects enable row level security;

create policy "Users can view own projects"
  on projects for select
  using (auth.uid() = user_id);

create policy "Users can insert own projects"
  on projects for insert
  with check (auth.uid() = user_id);

create policy "Users can update own projects"
  on projects for update
  using (auth.uid() = user_id);

create policy "Users can delete own projects"
  on projects for delete
  using (auth.uid() = user_id);
```

### Authentication

#### Server Component (App Router)
```typescript
// app/dashboard/page.tsx
import { createServerComponentClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function Dashboard() {
  const supabase = createServerComponentClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return <div>Welcome {user.email}</div>
}
```

#### Client Component (Sign In)
```typescript
// app/login/page.tsx
'use client'
import { useState } from 'react'
import { createClientComponentClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

export default function Login() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const { error } = await supabase.auth.signInWithPassword({
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    })

    if (error) {
      alert(error.message)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSignIn}>
      <input type="email" name="email" required />
      <input type="password" name="password" required />
      <button type="submit">Sign In</button>
    </form>
  )
}
```

### Real-Time Subscriptions

```typescript
// components/RealtimeProjects.tsx
'use client'
import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/ssr'

export function RealtimeProjects({ userId }: { userId: string }) {
  const [projects, setProjects] = useState([])
  const supabase = createClientComponentClient()

  useEffect(() => {
    // Initial fetch
    const fetchProjects = async () => {
      const { data } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
      setProjects(data || [])
    }
    fetchProjects()

    // Real-time subscription
    const channel = supabase
      .channel('projects-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'projects',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setProjects((prev) => [...prev, payload.new])
        } else if (payload.eventType === 'UPDATE') {
          setProjects((prev) =>
            prev.map((p) => p.id === payload.new.id ? payload.new : p)
          )
        } else if (payload.eventType === 'DELETE') {
          setProjects((prev) => prev.filter((p) => p.id !== payload.old.id))
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  return (
    <ul>
      {projects.map((project) => (
        <li key={project.id}>{project.name}</li>
      ))}
    </ul>
  )
}
```

### File Storage

```typescript
// Upload file
const { data, error } = await supabase.storage
  .from('avatars')
  .upload(`${userId}/avatar.png`, file)

// Get public URL
const { data: { publicUrl } } = supabase.storage
  .from('avatars')
  .getPublicUrl(`${userId}/avatar.png`)

// Storage policies (in Supabase dashboard)
// Allow users to upload to their own folder
create policy "Users can upload own files"
  on storage.objects for insert
  with check (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
```

---

## Common Gotchas & Solutions

### 1. Row Level Security (RLS) Not Working
**Problem:** Queries return empty even though data exists.

**Solution:** Check if RLS is enabled AND policies are created:
```sql
-- Enable RLS
alter table your_table enable row level security;

-- Add policies (example)
create policy "Enable read for authenticated users"
  on your_table for select
  to authenticated
  using (true);
```

### 2. "relation does not exist" Error
**Problem:** Table doesn't exist or wrong schema.

**Solution:** Run migrations in correct order:
1. Create tables
2. Enable RLS
3. Create policies

### 3. Real-Time Not Triggering
**Problem:** Subscriptions don't receive updates.

**Solution:** Enable real-time for table in Supabase dashboard:
1. Database → Replication
2. Enable replication for your table
3. Restart subscription

### 4. Auth Session Not Persisting
**Problem:** User logged out on refresh.

**Solution:** Use SSR-compatible client:
```typescript
// ❌ Wrong (client-only)
import { createClient } from '@supabase/supabase-js'

// ✅ Correct (SSR-compatible)
import { createServerComponentClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
```

---

## Security Checklist

- [ ] RLS enabled on all tables
- [ ] Policies restrict access to user's own data
- [ ] Service role key stored in server-side env only
- [ ] File storage has upload size limits
- [ ] Email confirmations enabled in Auth settings
- [ ] CORS configured for production domain

---

## Testing Checklist

- [ ] User can sign up and receive confirmation email
- [ ] User can sign in and session persists
- [ ] User can only see their own data (test with 2 users)
- [ ] Real-time updates work (test with 2 browser windows)
- [ ] File uploads work and generate public URLs
- [ ] RLS prevents unauthorized access (test with direct API calls)

---

## Performance Tips

1. **Use Indexes:** Create indexes on frequently queried columns
```sql
create index projects_user_id_idx on projects(user_id);
```

2. **Batch Queries:** Use `.select()` with joins instead of multiple queries
```sql
-- ❌ Multiple queries
const projects = await supabase.from('projects').select('*')
const tasks = await supabase.from('tasks').select('*')

-- ✅ Single query with join
const { data } = await supabase
  .from('projects')
  .select('*, tasks(*)')
```

3. **Limit Real-Time Subscriptions:** Only subscribe to data you need
```typescript
// ❌ Subscribe to all rows
supabase.channel('all-projects').on('postgres_changes', ...)

// ✅ Filter in subscription
supabase.channel('my-projects').on('postgres_changes', {
  filter: `user_id=eq.${userId}`
}, ...)
```

---

## Resources

- [Supabase Docs](https://supabase.com/docs)
- [Next.js + Supabase Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Row Level Security Examples](https://supabase.com/docs/guides/auth/row-level-security)
