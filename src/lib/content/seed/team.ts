import type { TeamMember } from '../schema'

export const team: TeamMember[] = [
  {
    slug: 'ayla-ahmadova',
    name: 'Ayla Ahmadova',
    role: 'Founder & Editor',
    duty: 'Founded the journal and leads editorial direction, scope, and final decisions on submissions.',
    portraitPath: null,
    sortOrder: 1,
  },
  {
    slug: 'kanan-hajiyev',
    name: 'Kanan Hajiyev',
    role: 'Technical Director',
    duty: 'Builds and maintains the journal platform, submission workflow, and article archive.',
    portraitPath: null,
    sortOrder: 2,
  },
  {
    slug: 'gunel-ahmadova',
    name: 'Gunel Ahmadova',
    role: 'Chief Marketing Officer',
    duty: 'Runs calls for papers, announcements, and outreach to student researchers and institutions.',
    portraitPath: null,
    sortOrder: 3,
  },
]
