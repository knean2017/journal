import { PeopleList } from '@/components/admin/PeopleList'
import { PermissionGrid } from '@/components/admin/PermissionGrid'
import { listStaff } from '@/lib/admin/people'
import { permissionMatrix, requireCapability } from '@/lib/admin/session'

export const metadata = { title: 'People and permissions' }

export default async function PeoplePage() {
  const admin = await requireCapability('people', 'view')
  const [staff, matrix] = await Promise.all([listStaff(), permissionMatrix()])

  return (
    <>
      <h1 className="m-0 font-serif text-[28px] font-normal">People and permissions</h1>
      <div className="rule-double mt-5 mb-7" />

      {admin.isBootstrap ? (
        <p className="m-0 mb-8 border border-gold bg-cream-tint px-4 py-3 text-[13.5px] leading-[1.7] text-body">
          You are signed in through <code>BOOTSTRAP_ADMIN_EMAIL</code> rather than a seat in the
          list below. That address is always an administrator and cannot be removed from here. Give
          yourself a real seat once somebody else holds one too.
        </p>
      ) : null}

      <PeopleList staff={staff} selfId={admin.userId} />

      <div className="mt-14">
        <h2 className="m-0 font-serif text-[22px] font-normal">What each role can do</h2>
        <p className="mt-3 mb-7 max-w-[640px] text-[14px] leading-[1.8] text-body-muted">
          Changing a row here changes it for everybody holding that role. Read only means they see
          the page but every way of changing something is gone.
        </p>

        <PermissionGrid matrix={matrix} />
      </div>
    </>
  )
}
