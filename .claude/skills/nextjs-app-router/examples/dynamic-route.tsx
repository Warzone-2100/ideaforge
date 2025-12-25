/**
 * Dynamic Route Pattern
 *
 * Complete dynamic route with static generation and not-found handling.
 *
 * @file app/blog/[slug]/page.tsx
 */

import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { db } from '@/lib/db'

// ============================================
// TYPES
// ============================================

interface PageProps {
  params: { slug: string }
}

// ============================================
// STATIC GENERATION
// ============================================

// Generate all blog post pages at build time
export async function generateStaticParams() {
  const posts = await db.post.findMany({
    select: { slug: true },
    where: { published: true },
  })

  return posts.map((post) => ({
    slug: post.slug,
  }))
}

// ============================================
// DYNAMIC METADATA
// ============================================

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = await db.post.findUnique({
    where: { slug: params.slug },
    select: { title: true, excerpt: true, coverImage: true },
  })

  if (!post) {
    return {
      title: 'Post Not Found',
    }
  }

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.coverImage ? [post.coverImage] : [],
    },
  }
}

// ============================================
// PAGE COMPONENT
// ============================================

export default async function BlogPostPage({ params }: PageProps) {
  const post = await db.post.findUnique({
    where: { slug: params.slug, published: true },
    include: {
      author: {
        select: { name: true, avatar: true },
      },
    },
  })

  // Show 404 if post doesn't exist
  if (!post) {
    notFound()
  }

  return (
    <article className="max-w-3xl mx-auto px-4 py-12">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>

        <div className="flex items-center gap-4 text-zinc-500">
          <div className="flex items-center gap-2">
            {post.author.avatar && (
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="w-8 h-8 rounded-full"
              />
            )}
            <span>{post.author.name}</span>
          </div>
          <span>•</span>
          <time dateTime={post.createdAt.toISOString()}>
            {new Date(post.createdAt).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </time>
        </div>
      </header>

      {/* Cover Image */}
      {post.coverImage && (
        <img
          src={post.coverImage}
          alt={post.title}
          className="w-full rounded-xl mb-8"
        />
      )}

      {/* Content */}
      <div
        className="prose prose-invert prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* Related Posts */}
      <RelatedPosts currentSlug={params.slug} />
    </article>
  )
}

// ============================================
// RELATED POSTS (ALSO SERVER COMPONENT)
// ============================================

async function RelatedPosts({ currentSlug }: { currentSlug: string }) {
  const posts = await db.post.findMany({
    where: {
      slug: { not: currentSlug },
      published: true,
    },
    take: 3,
    orderBy: { createdAt: 'desc' },
    select: { slug: true, title: true, excerpt: true },
  })

  if (posts.length === 0) {
    return null
  }

  return (
    <section className="mt-16 pt-8 border-t border-zinc-800">
      <h2 className="text-2xl font-bold mb-6">Related Posts</h2>
      <div className="grid gap-4">
        {posts.map((post) => (
          <a
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="block p-4 bg-zinc-900 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <h3 className="font-medium mb-1">{post.title}</h3>
            <p className="text-sm text-zinc-500 line-clamp-2">{post.excerpt}</p>
          </a>
        ))}
      </div>
    </section>
  )
}
