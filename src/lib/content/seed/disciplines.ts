import type { Discipline } from '../schema'

export const disciplines: Discipline[] = [
  {
    slug: 'natural-sciences',
    name: 'Natural Sciences',
    blurb: 'Biology, chemistry, physics, earth and environmental science.',
    sortOrder: 1,
  },
  {
    slug: 'business-economics',
    name: 'Business & Economics',
    blurb: 'Markets, organisations, finance, and applied economics.',
    sortOrder: 2,
  },
  {
    slug: 'law-policy',
    name: 'Law & Policy',
    blurb: 'Doctrinal analysis, comparative law, regulation, and governance.',
    sortOrder: 3,
  },
  {
    slug: 'humanities',
    name: 'Humanities',
    blurb: 'History, literature, philosophy, languages, and the arts.',
    sortOrder: 4,
  },
  {
    slug: 'social-sciences',
    name: 'Social Sciences',
    blurb: 'Psychology, sociology, anthropology, and political science.',
    sortOrder: 5,
  },
]
