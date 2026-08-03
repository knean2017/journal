import { redirect } from 'next/navigation'
import { signOut } from '@/lib/admin/actions'
import { currentAdmin, currentUser } from '@/lib/admin/session'
import { adminPath } from '@/lib/supabase/env'

export const dynamic = 'force-dynamic'

/**
 * Where an account that can sign in but holds no seat lands.
 *
 * The one page in the tree that must not call `requireAdmin`, because
 * `requireAdmin` is what sends people here. It asks the two questions itself
 * and sends anybody who does not belong here somewhere they do.
 *
 * It offers signing out rather than a way in. The address is authenticated, so
 * leaving it signed in means every visit to the panel ends up back on this
 * page; the fix is either a different account or an administrator adding this
 * one from the people page.
 */
export default async function NoAccessPage() {
  const base = `/${adminPath()}`

  // Already staff: nothing to explain.
  if (await currentAdmin()) redirect(base)

  const user = await currentUser()
  if (!user) redirect(`${base}/login`)

  return (
    <div className="min-h-screen grid place-items-center px-6">
      <div className="w-full max-w-[460px]">
        <div className="eyebrow text-gold-muted">No seat in the office</div>
        <h1 className="mt-2 mb-0 font-serif text-[26px] font-normal">Signed in, but not staff</h1>
        <div className="rule-double mt-5 mb-6" />

        <p className="m-0 text-[14.5px] leading-[1.8] text-body">
          <strong className="text-ink">{user.email}</strong> is a valid account, but it holds no
          editorial role, so there is nothing in the panel it can open.
        </p>

        <p className="mt-4 mb-0 text-[14.5px] leading-[1.8] text-body">
          An administrator adds accounts from the people page. If the staff list is still empty, as
          it is on a first deploy, set <code>BOOTSTRAP_ADMIN_EMAIL</code> to this address and sign
          in again.
        </p>

        <form action={signOut} className="mt-7">
          <button type="submit" className="btn-base btn-maroon">
            Sign out
          </button>
        </form>
      </div>
    </div>
  )
}
