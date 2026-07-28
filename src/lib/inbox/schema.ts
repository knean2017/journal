import { z } from 'zod'

/**
 * The public forms that are not manuscript submissions: applying to the
 * reviewer panel, applying to the editorial board, and writing to the
 * editorial office.
 */

export const reviewerApplicationSchema = z.object({
  name: z.string().trim().min(2, 'Please give your full name.'),
  email: z.string().trim().email('That email address does not look right.'),
  affiliation: z.string().trim().min(2, 'Please give your institution.'),
  position: z.string().trim().min(2, 'Please give your current position.'),
  section: z.string().trim().min(1, 'Please choose a section.'),
  expertise: z
    .string()
    .trim()
    .min(10, 'Please name a few subject areas you can review.')
    .max(600, 'Please keep this under 600 characters.'),
  experience: z
    .string()
    .trim()
    .max(2000, 'Please keep this under 2000 characters.')
    .optional()
    .default(''),
  orcid: z
    .string()
    .trim()
    .max(60, 'That does not look like an ORCID.')
    .optional()
    .default(''),
})

/**
 * The editorial board application. It shares the reviewer form's identity
 * fields and parts ways after them: an editor applies to a named role rather
 * than a section, and is asked why they want it rather than what they can
 * assess.
 *
 * `role` carries a role title, not a slug or an id. editorial_roles has no
 * slug column, and the seeded fallback the site runs on without a database
 * exposes no ids, so the title is the only stable handle both paths share. The
 * action checks it against the roles currently being recruited.
 */
export const editorApplicationSchema = z.object({
  name: z.string().trim().min(2, 'Please give your full name.'),
  email: z.string().trim().email('That email address does not look right.'),
  affiliation: z.string().trim().min(2, 'Please give your institution.'),
  position: z.string().trim().min(2, 'Please give your current position.'),
  role: z.string().trim().min(1, 'Please choose a role.'),
  statement: z
    .string()
    .trim()
    .min(10, 'Please say why you want this role.')
    .max(600, 'Please keep this under 600 characters.'),
  experience: z
    .string()
    .trim()
    .max(2000, 'Please keep this under 2000 characters.')
    .optional()
    .default(''),
  orcid: z
    .string()
    .trim()
    .max(60, 'That does not look like an ORCID.')
    .optional()
    .default(''),
})

export const contactMessageSchema = z.object({
  name: z.string().trim().min(2, 'Please give your name.'),
  email: z.string().trim().email('That email address does not look right.'),
  topic: z.string().trim().min(1, 'Please choose a topic.'),
  message: z
    .string()
    .trim()
    .min(20, 'Please say a little more so we can answer properly.')
    .max(4000, 'Please keep this under 4000 characters.'),
})

export const CONTACT_TOPICS = [
  'A manuscript under consideration',
  'Submitting to the journal',
  'Joining the reviewer panel',
  'Press or partnerships',
  'Something else',
] as const

export type ReviewerApplicationInput = z.infer<typeof reviewerApplicationSchema>
export type EditorApplicationInput = z.infer<typeof editorApplicationSchema>
export type ContactMessageInput = z.infer<typeof contactMessageSchema>
