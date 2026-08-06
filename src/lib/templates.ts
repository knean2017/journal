/**
 * The two author templates, each a Word file.
 *
 * Byte sizes are written down here rather than read off disk, because the page
 * that shows them is prerendered and public/ is not something a rendered page
 * should be reaching into at runtime. tests/unit/templates.test.ts holds these
 * numbers against the actual files, so replacing a template fails the test
 * rather than quietly leaving a wrong size beside a download.
 */

export type TemplateId = 'manuscript' | 'cover-letter'

export type TemplateDownload = {
  href: string
  /** Size on disk. Shown beside the download, so nobody is surprised. */
  bytes: number
}

/*
 * These are a convenience, not a rule. The journal takes a paper in whatever
 * format its author already writes in, so nothing here may be worded as a
 * requirement: a template that reads like one turns work away at the door.
 */
export type Template = {
  id: TemplateId
  title: string
  /** What the file is for, in one line. This is read in a dialog, not studied. */
  summary: string
  docx: TemplateDownload
}

export const TEMPLATES: Template[] = [
  {
    id: 'manuscript',
    title: 'Manuscript template',
    summary:
      'The paper itself, anonymous. The usual headings are already in it, in order, with the guidance in grey for you to delete as you go. Keep, rename, or drop them as your work needs.',
    docx: { href: '/templates/ICRR-Manuscript-Template.docx', bytes: 68415 },
  },
  {
    id: 'cover-letter',
    title: 'Cover letter template',
    summary:
      'The letter that travels with it. Read by the editors only and never sent to reviewers, which is why your name belongs here and not in the paper.',
    docx: { href: '/templates/ICRR-Cover-Letter-Template.docx', bytes: 68700 },
  },
]

/** Whole KB. A tenth of a kilobyte tells a person downloading a file nothing. */
export function formatBytes(bytes: number): string {
  return `${Math.round(bytes / 1024)} KB`
}
