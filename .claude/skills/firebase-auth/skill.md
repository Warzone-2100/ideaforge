# Skill: Firebase Auth

<!--
METADATA
-->
---
name: "firebase-auth"
version: "1.0.0"
description: "Complete Firebase Authentication: email/password, OAuth, session management, protected routes"
category: "auth"
complexity: "intermediate"
time_estimate: "2-4 hours"
requires_mcp: ["context7", "firebase"]
requires_skills: ["nextjs-app-router"]
---

## When to Use This Skill

Use this skill when you need to:
- Add user authentication to a Next.js app
- Support multiple auth providers (Google, GitHub, email)
- Manage user sessions securely
- Protect routes and API endpoints

**Do NOT use this skill if:**
- You need enterprise SSO → Consider Auth0 or Clerk
- You're using Supabase → Use `supabase-stack` skill instead
- You need passwordless only → Simpler options exist

---

## Quick Start (Minimum Viable Implementation)

### 1. Install Dependencies
```bash
npm install firebase firebase-admin
```

### 2. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create new project
3. Enable Authentication → Sign-in methods → Email/Password + Google
4. Get config from Project Settings → General → Your apps → Web

### 3. Environment Variables
```env
# Client-side Firebase config
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-app
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

# Server-side (from Service Account JSON)
FIREBASE_PROJECT_ID=your-app
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-app.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### 4. Firebase Client (lib/firebase.ts)
```typescript
import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Initialize Firebase (prevent duplicate initialization)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
export const auth = getAuth(app)
export default app
```

### 5. Simple Sign In Component
```typescript
'use client'

import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { auth } from '@/lib/firebase'

export function SignInButton() {
  const signIn = async () => {
    const provider = new GoogleAuthProvider()
    await signInWithPopup(auth, provider)
  }

  return <button onClick={signIn}>Sign in with Google</button>
}
```

### 6. Verify It Works
```bash
npm run dev
# Click sign in, complete Google flow, check console for user
```

---

## Full Implementation

### Architecture Overview
```
┌─────────────────────────────────────────────────────────────────┐
│                        NEXT.JS APP                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐        ┌──────────────────────────────┐   │
│  │   Client Side    │        │       Server Side            │   │
│  │                  │        │                              │   │
│  │  firebase/auth   │        │   firebase-admin             │   │
│  │  - signIn()      │        │   - verifyIdToken()          │   │
│  │  - signOut()     │        │   - getUser()                │   │
│  │  - onAuthChange  │        │                              │   │
│  │                  │        │   Middleware                 │   │
│  │  AuthContext     │───────►│   - Check session cookie     │   │
│  │  - user state    │        │   - Redirect if unauthorized │   │
│  │  - loading state │        │                              │   │
│  └──────────────────┘        └──────────────────────────────┘   │
│           │                              │                       │
│           ▼                              ▼                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                     SESSION COOKIE                        │   │
│  │              (HttpOnly, Secure, SameSite)                │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│                    ┌──────────────────┐                         │
│                    │   FIREBASE AUTH  │                         │
│                    │   (Google Cloud) │                         │
│                    └──────────────────┘                         │
└─────────────────────────────────────────────────────────────────┘
```

### Step-by-Step Implementation

#### Step 1: Firebase Admin SDK (Server-Side)

```typescript
// lib/firebase-admin.ts
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

const firebaseAdminConfig = {
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    // Handle newlines in private key
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
}

// Initialize Admin SDK (prevent duplicate initialization)
const adminApp = getApps().length === 0
  ? initializeApp(firebaseAdminConfig)
  : getApps()[0]

export const adminAuth = getAuth(adminApp)
```

#### Step 2: Auth Context Provider

```typescript
// contexts/auth-context.tsx
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  GithubAuthProvider,
} from 'firebase/auth'
import { auth } from '@/lib/firebase'

interface AuthContextType {
  user: User | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signInWithGithub: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      setLoading(false)

      if (user) {
        // Sync session with server
        const idToken = await user.getIdToken()
        await fetch('/api/auth/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken }),
        })
      } else {
        // Clear server session
        await fetch('/api/auth/session', { method: 'DELETE' })
      }
    })

    return () => unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider()
    await signInWithPopup(auth, provider)
  }

  const signInWithGithub = async () => {
    const provider = new GithubAuthProvider()
    await signInWithPopup(auth, provider)
  }

  const signInWithEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password)
  }

  const signUpWithEmail = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password)
  }

  const signOut = async () => {
    await firebaseSignOut(auth)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
        signInWithGithub,
        signInWithEmail,
        signUpWithEmail,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
```

#### Step 3: Session Cookie API Route

```typescript
// app/api/auth/session/route.ts
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firebase-admin'

// Session duration: 5 days
const SESSION_DURATION = 60 * 60 * 24 * 5 * 1000

export async function POST(req: Request) {
  try {
    const { idToken } = await req.json()

    // Verify the ID token
    const decodedToken = await adminAuth.verifyIdToken(idToken)

    // Only create session if token is recent (within 5 minutes)
    if (new Date().getTime() / 1000 - decodedToken.auth_time > 5 * 60) {
      return NextResponse.json(
        { error: 'Recent sign-in required' },
        { status: 401 }
      )
    }

    // Create session cookie
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: SESSION_DURATION,
    })

    // Set cookie
    cookies().set('session', sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_DURATION / 1000,
      path: '/',
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Session creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  cookies().delete('session')
  return NextResponse.json({ success: true })
}
```

#### Step 4: Get Current User (Server-Side)

```typescript
// lib/auth.ts
import { cookies } from 'next/headers'
import { adminAuth } from '@/lib/firebase-admin'

export interface SessionUser {
  uid: string
  email: string | null
  name: string | null
  picture: string | null
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const sessionCookie = cookies().get('session')?.value

    if (!sessionCookie) {
      return null
    }

    const decodedClaims = await adminAuth.verifySessionCookie(
      sessionCookie,
      true // Check if revoked
    )

    return {
      uid: decodedClaims.uid,
      email: decodedClaims.email || null,
      name: decodedClaims.name || null,
      picture: decodedClaims.picture || null,
    }
  } catch (error) {
    console.error('Session verification error:', error)
    return null
  }
}

export async function requireAuth(): Promise<SessionUser> {
  const session = await getSession()

  if (!session) {
    throw new Error('Unauthorized')
  }

  return session
}
```

#### Step 5: Middleware for Protected Routes

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that require authentication
const protectedRoutes = ['/dashboard', '/settings', '/app']

// Routes that should redirect to dashboard if authenticated
const authRoutes = ['/login', '/signup']

export function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value
  const { pathname } = request.nextUrl

  // Check if accessing protected route without session
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!session) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Redirect authenticated users away from auth pages
  if (authRoutes.includes(pathname)) {
    if (session) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)' ,
  ],
}
```

#### Step 6: Server Component Usage

```typescript
// app/dashboard/page.tsx
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <div>
      <h1>Welcome, {session.name || session.email}</h1>
      {session.picture && (
        <img src={session.picture} alt="Profile" className="w-10 h-10 rounded-full" />
      )}
    </div>
  )
}
```

---

## File Structure

```
src/
├── app/
│   ├── api/
│   │   └── auth/
│   │       └── session/
│   │           └── route.ts     # Session cookie management
│   ├── login/
│   │   └── page.tsx             # Login page
│   ├── signup/
│   │   └── page.tsx             # Signup page
│   └── dashboard/
│       └── page.tsx             # Protected page
├── lib/
│   ├── firebase.ts              # Client SDK
│   ├── firebase-admin.ts        # Admin SDK
│   └── auth.ts                  # Session helpers
├── contexts/
│   └── auth-context.tsx         # Auth provider & hook
├── components/
│   ├── auth-provider.tsx        # Client wrapper
│   ├── sign-in-form.tsx         # Email/password form
│   └── oauth-buttons.tsx        # Social login buttons
└── middleware.ts                # Route protection
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Yes | Firebase Web API Key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Yes | Auth domain (xxx.firebaseapp.com) |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Yes | Project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Yes | Storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Yes | Messaging sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Yes | App ID |
| `FIREBASE_PROJECT_ID` | Yes | Same as public project ID |
| `FIREBASE_CLIENT_EMAIL` | Yes | Service account email |
| `FIREBASE_PRIVATE_KEY` | Yes | Service account private key |

---

## Common Gotchas

### Gotcha 1: Private Key Newlines
**Problem:** `FIREBASE_PRIVATE_KEY` fails to parse
**Solution:** Replace `\n` with actual newlines: `key.replace(/\\n/g, '\n')`

### Gotcha 2: Popup Blocked
**Problem:** `signInWithPopup` blocked by browser
**Solution:** Use `signInWithRedirect` as fallback, or trigger from user action

### Gotcha 3: Session Not Syncing
**Problem:** Server thinks user is logged out
**Solution:** Call session API after `onAuthStateChanged` fires with user

### Gotcha 4: CORS Errors in Development
**Problem:** Firebase Auth fails with CORS errors
**Solution:** Add `localhost` to authorized domains in Firebase Console

### Gotcha 5: Middleware Loops
**Problem:** Infinite redirects between login and dashboard
**Solution:** Check middleware matcher excludes API routes and static files

---

## Security Checklist

- [ ] Session cookies are HttpOnly, Secure, SameSite
- [ ] Private key is in environment variables, never committed
- [ ] Session verification checks for revocation
- [ ] Middleware protects all sensitive routes
- [ ] API routes verify session before processing
- [ ] Error messages don't expose internal details

---

## Testing Checklist

- [ ] Email/password sign up works
- [ ] Email/password sign in works
- [ ] Google OAuth works
- [ ] Sign out clears session
- [ ] Protected routes redirect to login
- [ ] Login redirects to dashboard when authenticated
- [ ] Session persists across page refreshes
- [ ] Session expires after timeout

---

## MCP Usage

When implementing with Claude Code:
```
Use context7 to fetch the latest Firebase Auth documentation
Use firebase MCP to check project configuration
```

---

## Related Skills

- `stripe-billing` - Link payments to authenticated users
- `nextjs-app-router` - Server components and middleware

---

## References

- [Firebase Auth Web Docs](https://firebase.google.com/docs/auth/web/start)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
