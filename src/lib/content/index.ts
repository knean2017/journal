import { unstable_rethrow } from 'next/navigation'
import { cache } from 'react'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import * as seed from './sources/seed'
import * as db from './sources/supabase'

/**
 * The only content API the rest of the app may import.
 *
 * Picks its source at call time: Supabase when credentials are present, the
 * seed files otherwise, so the site builds and renders with no database
 * attached. If a Supabase read throws, the seed value is served rather than
 * failing the page, and the error is logged.
 */

/**
 * CONTENT_SOURCE=seed forces the seed files even when Supabase is configured.
 *
 * The browser suite runs with it set. Without it those tests read whatever the
 * editorial office happens to have published today, so deleting a placeholder
 * author in the admin turns the suite red for no good reason. Read-side only:
 * the submission and inbox actions still use the real database, so a test that
 * completes a form writes a real row.
 */
const useDb = () => isSupabaseConfigured() && process.env.CONTENT_SOURCE !== 'seed'

async function fromDb<T>(read: () => Promise<T>, fallback: () => Promise<T>): Promise<T> {
  if (!useDb()) return fallback()
  try {
    return await read()
  } catch (error) {
    /*
     * Next signals control flow by throwing: redirect, notFound, and the
     * bail-out that tells a render it may not be static. Those are not
     * database failures and swallowing them is how a page ends up quietly
     * serving seed content instead of doing what it was told. Only a genuine
     * read failure reaches the fallback.
     */
    unstable_rethrow(error)
    console.error('[content] Supabase read failed, serving seed content instead:', error)
    return fallback()
  }
}

/*
 * Wrapped in React's `cache` so a render that asks twice pays once. The site
 * layout and the page inside it both read the config on every single view.
 */
export const getConfig = cache(() => fromDb(db.getConfig, seed.getConfig))
export const getDisciplines = cache(() => fromDb(db.getDisciplines, seed.getDisciplines))
export const getTeam = cache(() => fromDb(db.getTeam, seed.getTeam))
export const getEditorialRoles = cache(() =>
  fromDb(db.getEditorialRoles, seed.getEditorialRoles),
)
export const getAuthors = cache(() => fromDb(db.getAuthors, seed.getAuthors))
export const getIssues = cache(() => fromDb(db.getIssues, seed.getIssues))
export const getCurrentIssue = cache(() => fromDb(db.getCurrentIssue, seed.getCurrentIssue))
export const getArticles = cache(() => fromDb(db.getArticles, seed.getArticles))
export const getAnnouncements = cache(() => fromDb(db.getAnnouncements, seed.getAnnouncements))
export const getTickerLines = cache(() => fromDb(db.getTickerLines, seed.getTickerLines))

export const getAuthorBySlug = cache((slug: string) =>
  fromDb(
    () => db.getAuthorBySlug(slug),
    () => seed.getAuthorBySlug(slug),
  ),
)

export const getArticleBySlug = cache((slug: string) =>
  fromDb(
    () => db.getArticleBySlug(slug),
    () => seed.getArticleBySlug(slug),
  ),
)

export const getArticlesByAuthor = cache((authorId: string) =>
  fromDb(
    () => db.getArticlesByAuthor(authorId),
    () => seed.getArticlesByAuthor(authorId),
  ),
)

// Editorial furniture: fixed copy, not editable content. Seed only.
export const getProcessSteps = seed.getProcessSteps
export const getTimeline = seed.getTimeline
export const getTocPreview = seed.getTocPreview
export const getFacts = seed.getFacts
export const getRequirements = seed.getRequirements
export const getChecklist = seed.getChecklist

export * from './schema'
