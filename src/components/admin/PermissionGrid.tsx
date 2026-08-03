'use client'

import { useActionState, useState } from 'react'
import { savePermissions } from '@/lib/admin/people'
import {
  ACCESS_LEVELS,
  AREAS,
  AREA_LABELS,
  ROLE_HELP,
  ROLE_LABELS,
  STAFF_ROLES,
  type AccessLevel,
  type Area,
  type PermissionMatrix,
  type StaffRole,
} from '@/lib/admin/permissions'
import type { FormResult } from '@/lib/form-result'

const LEVEL_LABELS: Record<AccessLevel, string> = {
  none: 'Nothing',
  view: 'Read only',
  edit: 'Can change',
}

/** Roles that can actually be edited. The administrator is fixed. */
const EDITABLE_ROLES = STAFF_ROLES.filter((role) => role !== 'administrator')

/**
 * The grid: one row per area, one column per role.
 *
 * Areas are the rows rather than the columns because there are ten of them and
 * only five roles, and a long list reads better going down. Every cell is a
 * real select rather than a cycling button, so the current value is legible
 * without clicking and the whole thing works from a keyboard.
 */
export function PermissionGrid({ matrix }: { matrix: PermissionMatrix }) {
  const [values, setValues] = useState<Record<string, AccessLevel>>(() => {
    const initial: Record<string, AccessLevel> = {}
    for (const role of EDITABLE_ROLES) {
      for (const area of AREAS) initial[`${role}:${area}`] = matrix[role][area]
    }
    return initial
  })

  const [state, action, pending] = useActionState<FormResult | null, FormData>(
    savePermissions,
    null,
  )

  const set = (role: StaffRole, area: Area, level: AccessLevel) =>
    setValues((current) => ({ ...current, [`${role}:${area}`]: level }))

  return (
    <form action={action}>
      {state ? (
        <p
          role="alert"
          className={`m-0 mb-5 border px-4 py-3 text-[14px] leading-[1.7] ${
            state.ok ? 'border-rule bg-cream text-body' : 'border-maroon bg-cream-tint text-maroon'
          }`}
        >
          {state.message}
        </p>
      ) : null}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[760px]">
          <thead>
            <tr>
              <th className="text-left align-bottom pb-3 pr-4 border-b border-rule w-[30%]">
                <span className="text-[11px] tracking-[0.14em] uppercase text-gold-muted font-bold">
                  What
                </span>
              </th>
              {EDITABLE_ROLES.map((role) => (
                <th key={role} className="text-left align-bottom pb-3 px-2 border-b border-rule">
                  <span className="block font-serif text-[15px] text-ink font-bold">
                    {ROLE_LABELS[role]}
                  </span>
                  <span className="block mt-1 text-[11.5px] leading-[1.5] text-body-muted font-normal">
                    {ROLE_HELP[role]}
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {AREAS.map((area) => (
              <tr key={area} className="border-b border-rule">
                <th scope="row" className="text-left align-top py-4 pr-4 font-normal">
                  <span className="block font-serif text-[15.5px] text-ink">
                    {AREA_LABELS[area].label}
                  </span>
                  <span className="block mt-1 text-[12.5px] leading-[1.6] text-body-muted">
                    {AREA_LABELS[area].help}
                  </span>
                </th>

                {EDITABLE_ROLES.map((role) => (
                  <td key={role} className="align-top py-4 px-2">
                    <label className="sr-only" htmlFor={`level:${role}:${area}`}>
                      {ROLE_LABELS[role]}, {AREA_LABELS[area].label}
                    </label>
                    <select
                      id={`level:${role}:${area}`}
                      name={`level:${role}:${area}`}
                      value={values[`${role}:${area}`]}
                      onChange={(event) => set(role, area, event.target.value as AccessLevel)}
                      className="w-full border border-rule bg-page px-2 py-[7px] text-[13px] text-ink"
                    >
                      {ACCESS_LEVELS.map((level) => (
                        <option key={level} value={level}>
                          {LEVEL_LABELS[level]}
                        </option>
                      ))}
                    </select>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-5 mb-0 text-[13px] leading-[1.7] text-body-muted">
        Administrators are not listed: they always have everything, including this grid. Without
        that, saving one wrong row here would lock every last person out of the panel.
      </p>

      <div className="pt-5">
        <button type="submit" disabled={pending} className="btn-base btn-maroon">
          {pending ? 'Saving…' : 'Save permissions'}
        </button>
      </div>
    </form>
  )
}
