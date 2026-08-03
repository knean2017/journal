import type { EditorialRole } from '../schema'

/**
 * Editor-in-Chief is intentionally absent. Ayla covers it from the core team.
 */
export const editorialRoles: EditorialRole[] = [
  {
    title: 'Managing Editor',
    status: 'pending',
    statusLabel: 'Appointment pending',
    holderName: null,
    duty: 'Runs the review cycle, correspondence, and production schedule.',
    sortOrder: 1,
  },
  {
    title: 'Section Editor, Natural Sciences',
    status: 'recruiting',
    statusLabel: 'Recruiting',
    holderName: null,
    duty: 'Oversees review and decisions in the sciences.',
    sortOrder: 2,
  },
  {
    title: 'Section Editor, Business & Economics',
    status: 'recruiting',
    statusLabel: 'Recruiting',
    holderName: null,
    duty: 'Oversees review in economics, finance, and organisational research.',
    sortOrder: 3,
  },
  {
    title: 'Section Editor, Law & Policy',
    status: 'recruiting',
    statusLabel: 'Recruiting',
    holderName: null,
    duty: 'Handles doctrinal, comparative, and regulatory submissions.',
    sortOrder: 4,
  },
  {
    title: 'Section Editor, Humanities',
    status: 'recruiting',
    statusLabel: 'Recruiting',
    holderName: null,
    duty: 'Oversees history, literature, philosophy, and the arts.',
    sortOrder: 5,
  },
  {
    title: 'Section Editor, Social Sciences',
    status: 'recruiting',
    statusLabel: 'Recruiting',
    holderName: null,
    duty: 'Oversees psychology, sociology, anthropology, and politics.',
    sortOrder: 6,
  },
  {
    title: 'Copyeditor',
    status: 'recruiting',
    statusLabel: 'Recruiting',
    holderName: null,
    duty: 'House style, references, and proofing of accepted manuscripts.',
    sortOrder: 7,
  },
]
