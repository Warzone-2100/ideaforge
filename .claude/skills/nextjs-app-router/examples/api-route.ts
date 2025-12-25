/**
 * API Route Pattern
 *
 * Complete REST API route with all HTTP methods.
 *
 * @file app/api/posts/route.ts
 */

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

// ============================================
// VALIDATION
// ============================================

const createPostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().max(500).optional(),
  published: z.boolean().default(false),
})

// ============================================
// GET - List Posts
// ============================================

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    // Parse query parameters
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')
    const published = searchParams.get('published')

    // Build query
    const where = published !== null
      ? { published: published === 'true' }
      : {}

    // Fetch posts
    const [posts, total] = await Promise.all([
      db.post.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          published: true,
          createdAt: true,
          author: {
            select: { name: true },
          },
        },
      }),
      db.post.count({ where }),
    ])

    return NextResponse.json({
      data: posts,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + posts.length < total,
      },
    })
  } catch (error) {
    console.error('GET /api/posts error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}

// ============================================
// POST - Create Post
// ============================================

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse and validate body
    const body = await request.json()
    const result = createPostSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: result.error.errors,
        },
        { status: 400 }
      )
    }

    // Generate slug from title
    const slug = result.data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Check for duplicate slug
    const existing = await db.post.findUnique({ where: { slug } })
    if (existing) {
      return NextResponse.json(
        { error: 'A post with this title already exists' },
        { status: 409 }
      )
    }

    // Create post
    const post = await db.post.create({
      data: {
        ...result.data,
        slug,
        authorId: session.uid,
      },
    })

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    console.error('POST /api/posts error:', error)
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    )
  }
}

// ============================================
// Dynamic Route: /api/posts/[id]/route.ts
// ============================================

/**
 * @file app/api/posts/[id]/route.ts
 */

interface RouteParams {
  params: { id: string }
}

export async function GET_BY_ID(
  request: Request,
  { params }: RouteParams
) {
  try {
    const post = await db.post.findUnique({
      where: { id: params.id },
      include: {
        author: {
          select: { id: true, name: true, avatar: true },
        },
      },
    })

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error('GET /api/posts/[id] error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    )
  }
}

export async function PATCH_BY_ID(
  request: Request,
  { params }: RouteParams
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check ownership
    const post = await db.post.findUnique({
      where: { id: params.id },
      select: { authorId: true },
    })

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    if (post.authorId !== session.uid) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const body = await request.json()

    const updated = await db.post.update({
      where: { id: params.id },
      data: body,
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('PATCH /api/posts/[id] error:', error)
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    )
  }
}

export async function DELETE_BY_ID(
  request: Request,
  { params }: RouteParams
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check ownership
    const post = await db.post.findUnique({
      where: { id: params.id },
      select: { authorId: true },
    })

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    if (post.authorId !== session.uid) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    await db.post.delete({
      where: { id: params.id },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('DELETE /api/posts/[id] error:', error)
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    )
  }
}
