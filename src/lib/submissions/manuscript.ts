/**
 * What counts as a manuscript, and as the cover letter beside it.
 *
 * Kept apart from schema.ts so the submission form can check a chosen file in
 * the browser without pulling Zod into the client bundle to do it. The same
 * rules then run again on the server, where they are the ones that count.
 */

export const MAX_MANUSCRIPT_BYTES = 20 * 1024 * 1024

/*
 * A cover letter is one page, two at the outside. Twenty megabytes of it is
 * not a cover letter, and holding the smaller ceiling here means an author who
 * attaches the two files the wrong way round is told so immediately rather
 * than after uploading the larger one.
 */
export const MAX_COVER_LETTER_BYTES = 5 * 1024 * 1024

/** The only two extensions a stored manuscript is ever given. */
const EXTENSION_BY_TYPE: Record<string, string> = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
}

/**
 * The extension to store a manuscript under, or null if it is not one.
 *
 * Falls back to the filename when the browser reports no MIME type at all,
 * which some of them do for `.docx`. Rejecting those would turn a valid Word
 * document into an unexplained error.
 */
export function manuscriptExtension(fileName: string, mimeType: string): string | null {
  if (EXTENSION_BY_TYPE[mimeType]) return EXTENSION_BY_TYPE[mimeType]
  if (mimeType) return null

  const extension = fileName.split('.').pop()?.toLowerCase()
  return extension === 'pdf' || extension === 'docx' ? extension : null
}

/** 4_100_000 -> "3.9 MB". Keeps a size honest in a message or a chip. */
export function readableSize(bytes: number): string {
  const megabytes = bytes / (1024 * 1024)
  return megabytes >= 1
    ? `${megabytes.toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`
}
