/**
 * The delete control the list pages share.
 *
 * The rows it sits in are a few pixels apart and what it removes cannot be
 * brought back, so the guarantee worth testing is that one click never deletes
 * anything.
 */

import { act, fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { DeleteButton } from '@/components/admin/DeleteButton'

vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: () => {} }) }))

const click = async (name: RegExp) => {
  // The delete itself runs inside a transition, so the state it settles into
  // has to be flushed before anything is asserted about it.
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name }))
  })
}

describe('DeleteButton', () => {
  it('asks before it deletes', async () => {
    const onDelete = vi.fn(async () => {})
    render(<DeleteButton what="address" onDelete={onDelete} />)

    await click(/delete this address/i)
    expect(onDelete).not.toHaveBeenCalled()

    await click(/yes, delete it/i)
    expect(onDelete).toHaveBeenCalledOnce()
  })

  it('backs out without deleting', async () => {
    const onDelete = vi.fn(async () => {})
    render(<DeleteButton what="submission" onDelete={onDelete} />)

    await click(/delete this submission/i)
    await click(/keep it/i)

    expect(onDelete).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: /delete this submission/i })).toBeInTheDocument()
  })

  it('shows the consequence where one is spelled out', async () => {
    render(
      <DeleteButton what="record" warning="It does not unsend anything." onDelete={async () => {}} />,
    )

    await click(/delete this record/i)
    expect(screen.getByText('It does not unsend anything.')).toBeInTheDocument()
  })

  it('says why when the action refuses, and stops asking', async () => {
    const onDelete = vi.fn(async () => {
      throw new Error('Something else still points at this entry.')
    })
    render(<DeleteButton what="entry" onDelete={onDelete} />)

    await click(/delete this entry/i)
    await click(/yes, delete it/i)

    expect(screen.getByText('Something else still points at this entry.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /delete this entry/i })).toBeInTheDocument()
  })
})
