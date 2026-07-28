import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { RecordForm } from '@/components/admin/RecordForm'
import type { Entity } from '@/lib/admin/entities'

/**
 * The real module is a 'use server' file that reaches for the service-role
 * Supabase client on import, which cannot happen in jsdom. The form only needs
 * the actions to exist and to be bindable.
 */
vi.mock('@/lib/admin/actions', () => ({
  saveRecord: vi.fn(async () => null),
  deleteRecord: vi.fn(async () => undefined),
  uploadAsset: vi.fn(async () => 'uploaded.png'),
}))

const ISSUE: Entity = {
  slug: 'issues',
  table: 'issues',
  label: 'Issue',
  plural: 'Issues',
  titleColumn: 'slug',
  titleTemplate: 'Volume {volume}, Issue {number}',
  listColumns: [],
  orderBy: { column: 'volume', ascending: false },
  canCreate: true,
  canDelete: true,
  fields: [
    { name: 'volume', label: 'Volume', type: 'number', required: true },
    { name: 'number', label: 'Issue number', type: 'number', required: true },
    {
      name: 'status',
      label: 'Where it has got to',
      type: 'select',
      required: true,
      options: [
        { value: 'in_preparation', label: 'In preparation' },
        { value: 'published', label: 'Published' },
      ],
    },
    {
      name: 'status_label',
      label: 'Wording shown on the site',
      type: 'text',
      required: true,
      followsStatus: 'status',
      advanced: true,
    },
    {
      name: 'slug',
      label: 'Internal name',
      type: 'slug',
      required: true,
      from: ['volume', 'number'],
      pattern: 'volume-{volume}-issue-{number}',
      advanced: true,
    },
  ],
}

const AUTHOR: Entity = {
  slug: 'authors',
  table: 'authors',
  label: 'Author',
  plural: 'Authors',
  titleColumn: 'name',
  listColumns: [],
  orderBy: { column: 'name', ascending: true },
  canCreate: true,
  canDelete: true,
  fields: [
    { name: 'name', label: 'Name', type: 'text', required: true },
    {
      name: 'slug',
      label: 'Web address',
      type: 'slug',
      required: true,
      from: ['name'],
      pattern: '{name}',
      urlPrefix: '/authors/',
    },
  ],
}

function draw(entity: Entity, record: Record<string, unknown> | null) {
  return render(
    <RecordForm entity={entity} record={record} disciplines={[]} issues={[]} base="/office" />,
  )
}

/** The value a named field will post, read off the DOM. */
function posted(container: HTMLElement, name: string): string {
  const control = container.querySelector<HTMLInputElement>(`[name="${name}"]`)
  return control?.value ?? ''
}

describe('RecordForm, on a new record', () => {
  it('writes the web address from the title as it is typed', () => {
    const { container } = draw(AUTHOR, null)

    fireEvent.change(screen.getByRole('textbox', { name: /name/i }), {
      target: { value: 'Zoë Çelik' },
    })

    expect(posted(container, 'slug')).toBe('zoe-celik')
    expect(screen.getByText('zoe-celik')).toBeInTheDocument()
  })

  it('assembles an address from more than one field', () => {
    const { container } = draw(ISSUE, null)

    fireEvent.change(screen.getByRole('spinbutton', { name: /volume/i }), {
      target: { value: '2' },
    })
    fireEvent.change(screen.getByRole('spinbutton', { name: /issue number/i }), {
      target: { value: '3' },
    })

    expect(posted(container, 'slug')).toBe('volume-2-issue-3')
  })

  it('offers no way to hand-edit the address before the record exists', () => {
    draw(AUTHOR, null)
    expect(screen.queryByRole('button', { name: 'Change' })).not.toBeInTheDocument()
  })

  it('fills the status wording from the status', () => {
    const { container } = draw(ISSUE, null)

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'published' } })

    expect(posted(container, 'status_label')).toBe('Published')
  })
})

describe('RecordForm, on a record that already exists', () => {
  const issue = {
    id: 'issue-1',
    volume: 1,
    number: 2,
    status: 'in_preparation',
    status_label: 'Scheduled',
    slug: 'volume-1-issue-2',
  }

  /**
   * The whole point of not deriving the wording outright: Issue 2 ships as
   * "In preparation" reading "Scheduled", and changing the status must not
   * quietly undo somebody's wording.
   */
  it('leaves wording that was written by hand alone', () => {
    const { container } = draw(ISSUE, issue)

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'published' } })

    expect(posted(container, 'status_label')).toBe('Scheduled')
  })

  it('lets standard wording follow the status', () => {
    const { container } = draw(ISSUE, { ...issue, status_label: 'In preparation' })

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'published' } })

    expect(posted(container, 'status_label')).toBe('Published')
  })

  /** Renaming a published record must not silently move its public page. */
  it('does not move the web address when the title is edited', () => {
    const { container } = draw(AUTHOR, { id: 'a1', name: 'Priya Nair', slug: 'priya-nair' })

    fireEvent.change(screen.getByRole('textbox', { name: /name/i }), {
      target: { value: 'Priya S. Nair' },
    })

    expect(posted(container, 'slug')).toBe('priya-nair')
  })

  it('warns about broken links only once the address is opened for editing', () => {
    draw(AUTHOR, { id: 'a1', name: 'Priya Nair', slug: 'priya-nair' })

    expect(screen.queryByText(/breaks every link/i)).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Change' }))
    expect(screen.getByText(/breaks every link/i)).toBeInTheDocument()
  })
})

describe('RecordForm chrome', () => {
  it('keeps the worked-out fields out of the way under Advanced', () => {
    const { container } = draw(ISSUE, null)

    const details = container.querySelector('details')
    expect(details).not.toBeNull()
    expect(details?.querySelector('[name="status_label"]')).not.toBeNull()
    expect(details?.querySelector('[name="slug"]')).not.toBeNull()
    // The everyday fields stay outside it.
    expect(details?.querySelector('[name="volume"]')).toBeNull()
  })

  it('asks before deleting rather than doing it on one click', () => {
    draw(ISSUE, { id: 'issue-1', volume: 1, number: 2 })

    fireEvent.click(screen.getByRole('button', { name: /delete this issue/i }))

    expect(screen.getByText(/cannot be brought back/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Yes, delete it' })).toBeInTheDocument()
  })
})
