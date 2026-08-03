import type { Fact, ProcessStep, Requirement, TimelineEntry, TocPreviewEntry } from '../schema'

export const processSteps: ProcessStep[] = [
  {
    number: '1',
    time: 'Day 1',
    title: 'Submission',
    body: 'Upload an anonymised manuscript and a short cover letter.',
  },
  {
    number: '2',
    time: 'Week 1',
    title: 'Editorial screening',
    body: 'An editor checks scope, eligibility, and similarity.',
  },
  {
    /*
     * No review model is named here or anywhere else. The journal reviews what
     * it publishes and does not run double-blind or formal peer review, so a
     * named model would promise a process that does not exist.
     */
    number: '3',
    time: 'Weeks 1–3',
    title: 'Review',
    body: 'The manuscript is reviewed on its method and its evidence.',
  },
  {
    number: '4',
    time: 'Week 4',
    title: 'Decision and copyediting',
    body: 'Accepted papers are copyedited for the next issue.',
  },
]

export const timeline: TimelineEntry[] = [
  {
    title: 'Submissions open',
    when: 'Now',
    body: 'Rolling. Papers enter the next available issue cycle.',
    filled: true,
  },
  {
    title: 'Issue 1 submissions close',
    when: '31 Aug 2026',
    body: 'Later submissions are held for the December issue.',
    filled: false,
  },
  {
    title: 'Review',
    when: '2–3 weeks',
    body: 'Each manuscript is reviewed before it goes to a decision.',
    filled: false,
  },
  {
    title: 'Decisions returned',
    when: 'Mid-Sept 2026',
    body: 'Accept, revise, or decline, based on the review.',
    filled: false,
  },
  {
    title: 'Publication',
    when: '30 Sept 2026',
    body: 'Issue 1 published open access, then every three months.',
    filled: false,
  },
]

export const tocPreview: TocPreviewEntry[] = [
  {
    section: 'Natural Sciences',
    title: 'Article title as it will appear in the table of contents',
    byline: 'Author Name, Institution',
    pages: 'pp. 1–18',
  },
  {
    section: 'Business & Economics',
    title: 'A second article, showing a title that runs to two lines in the listing',
    byline: 'Author Name, Institution',
    pages: 'pp. 19–34',
  },
  {
    section: 'Humanities',
    title: 'A third article entry',
    byline: 'Author Name, Institution',
    pages: 'pp. 35–52',
  },
]

export const facts: Fact[] = [
  { key: 'Founded', value: '2026' },
  { key: 'Access', value: 'Open, CC BY 4.0' },
  { key: 'Author fees', value: 'None' },
  { key: 'Review', value: 'Before publication' },
  { key: 'Frequency', value: 'Every three months' },
  { key: 'ISSN', value: 'Pending' },
]

export const requirements: Requirement[] = [
  { key: 'Length', value: '3,000–8,000 words excluding references and appendices.' },
  { key: 'File format', value: 'PDF or DOCX, single column, 1.5 line spacing, numbered pages.' },
  {
    key: 'Anonymisation',
    value: 'No author names, affiliations, or acknowledgements in the manuscript file.',
  },
  {
    key: 'Cover letter',
    value: 'Required, as a separate file. Not anonymised: your names and institution go here.',
  },
  { key: 'Abstract', value: '250 words maximum, plus four to six keywords.' },
  { key: 'References', value: 'Consistent style throughout: APA, Chicago, or OSCOLA.' },
  { key: 'Figures', value: 'Numbered, captioned, and legible in greyscale at print size.' },
]

export const checklist: string[] = [
  'At least one author is a current student or graduated within the last twelve months.',
  'The manuscript is anonymised and contains no identifying information.',
  'The work is original, unpublished, and not under consideration elsewhere.',
  'Ethical approval is attached where human subjects are involved.',
  'Funding, supervision, and use of generative tools are declared in the cover letter.',
]
