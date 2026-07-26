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

const useDb = () => isSupabaseConfigured()

async function fromDb<T>(read: () => Promise<T>, fallback: () => Promise<T>): Promise<T> {
  if (!useDb()) return fallback()
  try {
    return await read()
  } catch (error) {
    console.error('[content] Supabase read failed, serving seed content instead:', error)
    return fallback()
  }
}

export const getConfig = () => fromDb(db.getConfig, seed.getConfig)
export const getDisciplines = () => fromDb(db.getDisciplines, seed.getDisciplines)
export const getTeam = () => fromDb(db.getTeam, seed.getTeam)
export const getEditorialRoles = () => fromDb(db.getEditorialRoles, seed.getEditorialRoles)
export const getAuthors = () => fromDb(db.getAuthors, seed.getAuthors)
export const getIssues = () => fromDb(db.getIssues, seed.getIssues)
export const getCurrentIssue = () => fromDb(db.getCurrentIssue, seed.getCurrentIssue)
export const getArticles = () => fromDb(db.getArticles, seed.getArticles)
export const getAnnouncements = () => fromDb(db.getAnnouncements, seed.getAnnouncements)
export const getTickerLines = () => fromDb(db.getTickerLines, seed.getTickerLines)

export const getAuthorBySlug = (slug: string) =>
  fromDb(
    () => db.getAuthorBySlug(slug),
    () => seed.getAuthorBySlug(slug),
  )

export const getArticleBySlug = (slug: string) =>
  fromDb(
    () => db.getArticleBySlug(slug),
    () => seed.getArticleBySlug(slug),
  )

export const getArticlesByAuthor = (authorId: string) =>
  fromDb(
    () => db.getArticlesByAuthor(authorId),
    () => seed.getArticlesByAuthor(authorId),
  )

// Editorial furniture: fixed copy, not editable content. Seed only.
export const getProcessSteps = seed.getProcessSteps
export const getTimeline = seed.getTimeline
export const getTocPreview = seed.getTocPreview
export const getFacts = seed.getFacts
export const getRequirements = seed.getRequirements
export const getChecklist = seed.getChecklist

export * from './schema'
