/**
 * Firebase Session Cookie API Route
 *
 * Handles creating and destroying session cookies.
 * Uses Firebase Admin SDK for secure server-side verification.
 *
 * @file app/api/auth/session/route.ts
 */

import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firebase-admin'

// Session duration: 5 days (in milliseconds)
const SESSION_DURATION = 60 * 60 * 24 * 5 * 1000

// ============================================
// CREATE SESSION
// ============================================

export async function POST(req: Request) {
  try {
    const { idToken } = await req.json()

    if (!idToken) {
      return NextResponse.json(
        { error: 'ID token is required' },
        { status: 400 }
      )
    }

    // Verify the ID token
    const decodedToken = await adminAuth.verifyIdToken(idToken)

    // Security: Only create session if sign-in is recent (within 5 minutes)
    const authTime = decodedToken.auth_time
    const currentTime = Math.floor(Date.now() / 1000)

    if (currentTime - authTime > 5 * 60) {
      return NextResponse.json(
        { error: 'Recent sign-in required. Please sign in again.' },
        { status: 401 }
      )
    }

    // Create session cookie
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: SESSION_DURATION,
    })

    // Set the session cookie
    const cookieStore = cookies()
    cookieStore.set('session', sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_DURATION / 1000, // Convert to seconds
      path: '/',
    })

    return NextResponse.json({
      success: true,
      expiresIn: SESSION_DURATION / 1000,
    })
  } catch (error) {
    console.error('Session creation error:', error)

    // Handle specific Firebase errors
    if (error instanceof Error) {
      if (error.message.includes('auth/id-token-expired')) {
        return NextResponse.json(
          { error: 'Token expired. Please sign in again.' },
          { status: 401 }
        )
      }
      if (error.message.includes('auth/id-token-revoked')) {
        return NextResponse.json(
          { error: 'Session revoked. Please sign in again.' },
          { status: 401 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    )
  }
}

// ============================================
// DELETE SESSION
// ============================================

export async function DELETE() {
  try {
    const cookieStore = cookies()

    // Get the current session to potentially revoke it
    const sessionCookie = cookieStore.get('session')?.value

    if (sessionCookie) {
      try {
        // Verify and get user ID from session
        const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie)

        // Optional: Revoke all refresh tokens for this user
        // This invalidates all sessions across all devices
        // Uncomment if you want strict sign-out behavior:
        // await adminAuth.revokeRefreshTokens(decodedClaims.uid)
      } catch {
        // Session was already invalid, continue with deletion
      }
    }

    // Delete the session cookie
    cookieStore.delete('session')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Session deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete session' },
      { status: 500 }
    )
  }
}

// ============================================
// GET CURRENT SESSION
// ============================================

export async function GET() {
  try {
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get('session')?.value

    if (!sessionCookie) {
      return NextResponse.json({ user: null })
    }

    // Verify the session cookie
    const decodedClaims = await adminAuth.verifySessionCookie(
      sessionCookie,
      true // Check if revoked
    )

    return NextResponse.json({
      user: {
        uid: decodedClaims.uid,
        email: decodedClaims.email,
        name: decodedClaims.name,
        picture: decodedClaims.picture,
        emailVerified: decodedClaims.email_verified,
      }
    })
  } catch (error) {
    // Session is invalid or expired
    console.error('Session verification error:', error)

    // Clear invalid cookie
    cookies().delete('session')

    return NextResponse.json({ user: null })
  }
}
