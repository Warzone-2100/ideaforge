/**
 * Server Action Form Pattern
 *
 * Complete form with Server Action, validation, and optimistic updates.
 *
 * @file app/settings/profile-form.tsx
 */

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

// ============================================
// VALIDATION SCHEMA
// ============================================

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  bio: z.string().max(500, 'Bio must be 500 characters or less').optional(),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
})

// ============================================
// SERVER ACTION
// ============================================

async function updateProfile(formData: FormData) {
  'use server'

  // Get current user
  const session = await getSession()
  if (!session) {
    redirect('/login')
  }

  // Parse and validate form data
  const rawData = {
    name: formData.get('name') as string,
    bio: formData.get('bio') as string,
    website: formData.get('website') as string,
  }

  const result = profileSchema.safeParse(rawData)

  if (!result.success) {
    // Return validation errors
    // Note: In a real app, you'd use useFormState to show these
    throw new Error(result.error.errors[0].message)
  }

  // Update database
  await db.user.update({
    where: { id: session.uid },
    data: {
      name: result.data.name,
      bio: result.data.bio || null,
      website: result.data.website || null,
    },
  })

  // Revalidate the page to show new data
  revalidatePath('/settings')
}

// ============================================
// SERVER COMPONENT (PAGE)
// ============================================

export default async function ProfileSettingsPage() {
  const session = await getSession()
  if (!session) {
    redirect('/login')
  }

  const user = await db.user.findUnique({
    where: { id: session.uid },
  })

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>

      <form action={updateProfile} className="space-y-6">
        {/* Name Field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-2">
            Display Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            defaultValue={user?.name || ''}
            required
            minLength={2}
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Bio Field */}
        <div>
          <label htmlFor="bio" className="block text-sm font-medium mb-2">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={4}
            defaultValue={user?.bio || ''}
            maxLength={500}
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
          <p className="text-sm text-zinc-500 mt-1">
            Brief description for your profile
          </p>
        </div>

        {/* Website Field */}
        <div>
          <label htmlFor="website" className="block text-sm font-medium mb-2">
            Website
          </label>
          <input
            id="website"
            name="website"
            type="url"
            defaultValue={user?.website || ''}
            placeholder="https://example.com"
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Submit Button */}
        <SubmitButton />
      </form>
    </div>
  )
}

// ============================================
// CLIENT COMPONENT (FOR PENDING STATE)
// ============================================

'use client'

import { useFormStatus } from 'react-dom'

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="px-6 py-3 bg-indigo-500 text-white rounded-lg font-medium
               hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed
               transition-colors"
    >
      {pending ? 'Saving...' : 'Save Changes'}
    </button>
  )
}
