import { readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { TEMPLATES, formatBytes } from '@/lib/templates'

/*
 * src/lib/templates.ts writes down what is in public/templates, because the
 * page that offers them is prerendered and should not read the filesystem to
 * render. That is only safe if something notices when the two drift apart,
 * which is this file. Replace a template and a stale size fails here rather
 * than shipping next to a download button.
 */
const publicDir = path.resolve(process.cwd(), 'public')
const onDisk = (href: string) => path.join(publicDir, href)

describe('author templates', () => {
  it('offers exactly the manuscript and the cover letter', () => {
    expect(TEMPLATES.map((template) => template.id)).toEqual(['manuscript', 'cover-letter'])
  })

  it.each(TEMPLATES)('$id: the download exists at the declared size', async (template) => {
    const stats = await stat(onDisk(template.docx.href))
    expect(stats.size).toBe(template.docx.bytes)
  })

  it.each(TEMPLATES)('$id: the docx is a real Word file', async (template) => {
    // A .docx is a zip, so "PK". It goes stale silently if a rename goes wrong.
    const docx = await readFile(onDisk(template.docx.href))
    expect(docx.subarray(0, 2).toString('latin1')).toBe('PK')
  })

  it('rounds file sizes to whole kilobytes', () => {
    expect(formatBytes(87514)).toBe('85 KB')
    expect(formatBytes(1024)).toBe('1 KB')
  })
})
