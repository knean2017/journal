import { z } from 'zod'

export const MAX_MANUSCRIPT_BYTES = 20 * 1024 * 1024

export const MANUSCRIPT_TYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
])

export const submissionSchema = z.object({
  correspondingAuthor: z.string().trim().min(2, 'Please give the corresponding author’s name.'),
  email: z.string().trim().email('That email address does not look right.'),
  institution: z.string().trim().min(2, 'Please give an institution.'),
  section: z.string().trim().min(1, 'Please choose a section.'),
  title: z.string().trim().min(4, 'Please give a manuscript title.'),
  abstract: z
    .string()
    .trim()
    .min(40, 'Please give an abstract of at least a few sentences.')
    .max(3000, 'That abstract is longer than 250 words.'),
  originality: z.literal(true, { message: 'Please confirm the originality statement.' }),
})

export type SubmissionInput = z.infer<typeof submissionSchema>

export const newsletterSchema = z.object({
  email: z.string().trim().email('That email address does not look right.'),
})
