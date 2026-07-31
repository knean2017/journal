import type { Announcement } from '../schema'

export const announcements: Announcement[] = [
  {
    slug: 'call-for-papers-volume-1-issue-1',
    publishedOn: '15 July 2026',
    tag: 'Call for papers',
    title: 'Call for Papers: Volume 1, Issue 1',
    blurb: 'Submissions open in all five sections until 31 August 2026.',
    body: 'ICRR invites original research, reviews, replication studies, and case analyses of 3,000–8,000 words from students at any institution. Submissions for Issue 1 close 31 August 2026; the issue publishes 30 September 2026, and at the end of each month thereafter. There are no fees at any stage.',
    ctaLabel: 'Read the guidelines',
    ctaHref: '/submit',
    sortOrder: 1,
  },
  {
    slug: 'reviewer-recruitment-inaugural-cycle',
    publishedOn: '2 July 2026',
    tag: 'Editorial',
    title: 'Reviewer recruitment for the inaugural cycle',
    blurb: 'Students, researchers, and professionals worldwide are invited to join the review panel.',
    body: 'Each section is building a panel of reviewers with subject expertise. Reviewers assess up to two manuscripts a month with a three-week turnaround, and are credited on the team page unless they ask not to be.',
    ctaLabel: 'Meet the team',
    ctaHref: '/team',
    sortOrder: 2,
  },
  {
    slug: 'the-journal-is-established',
    publishedOn: '20 June 2026',
    tag: 'Journal',
    title: 'The journal is established',
    blurb: 'ICRR is founded as an independent, open-access outlet for student research.',
    body: 'ICRR was established to give early-career researchers a properly reviewed, permanently citable place to publish. Articles are licensed CC BY 4.0 and authors retain copyright; ISSN registration follows the first issue.',
    ctaLabel: 'About the journal',
    ctaHref: '/about',
    sortOrder: 3,
  },
]
