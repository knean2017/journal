import { z } from 'zod'

/**
 * The two public forms that are not manuscript submissions: applying to the
 * reviewer panel, and writing to the editorial office.
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
export type ContactMessageInput = z.infer<typeof contactMessageSchema>
