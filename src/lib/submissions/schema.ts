import { z } from 'zod'

/**
 * A storage path this server issued: a UUID and one of two extensions, nothing
 * else. The client hands the path back after uploading, so it is input, and a
 * path is used to read and delete an object.
 */
export const manuscriptPathSchema = z
  .string()
  .regex(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(pdf|docx)$/,
    'The upload could not be matched to your submission. Please attach the file again.',
  )

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
    .max(3000, 'That abstract is longer than 3000 characters.'),
  originality: z.literal(true, { message: 'Please confirm the originality statement.' }),
})

export type SubmissionInput = z.infer<typeof submissionSchema>

export const newsletterSchema = z.object({
  email: z.string().trim().email('That email address does not look right.'),
})
