import type { Issue } from '../schema'

export const issues: Issue[] = [
  {
    slug: 'volume-1-issue-1',
    volume: 1,
    number: 1,
    status: 'in_preparation',
    statusLabel: 'In preparation',
    publishDate: '30 September 2026',
    submissionsClose: '31 August 2026',
    coverPath: null,
    description: 'Publishing 30 September 2026. Submissions open until 31 August 2026.',
    isCurrent: true,
  },
  {
    slug: 'volume-1-issue-2',
    volume: 1,
    number: 2,
    status: 'in_preparation',
    statusLabel: 'Scheduled',
    publishDate: '30 December 2026',
    submissionsClose: null,
    coverPath: null,
    description: '30 December 2026',
    isCurrent: false,
  },
]
