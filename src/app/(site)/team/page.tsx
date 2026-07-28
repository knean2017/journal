import type { Metadata } from 'next'
import Link from 'next/link'
import { ImageSlot } from '@/components/ui/ImageSlot'
import { PageHead } from '@/components/ui/PageHead'
import { getEditorialRoles, getTeam } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Our team',
  description:
    'Who runs the International Collegiate Research Review, which editorial roles are open, and the recusal rule every editor works under.',
  alternates: { canonical: '/team' },
}

export default async function TeamPage() {
  const [team, roles] = await Promise.all([getTeam(), getEditorialRoles()])

  return (
    <>
      <PageHead
        eyebrow="Our team"
        title="The people behind the journal"
        lead="A small team runs ICRR: editorial, technical, and communications. The section editorships are being appointed ahead of Issue 1."
        maxWidth="none"
      />

      <section className="max-w-[1180px] mx-auto px-[clamp(18px,5vw,40px)] pt-9">
        <h2 className="m-0 font-serif text-[24px] font-bold">Core team</h2>
        <div className="grid [grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr))] gap-[22px] mt-[22px]">
          {team.map((member) => (
            <div key={member.slug} className="border border-rule bg-page p-6">
              <div className="w-full max-w-[150px] border border-rule bg-cream">
                <ImageSlot
                  src={member.portraitPath}
                  label="Photo"
                  ratio="4/5"
                  sizes="150px"
                  className="h-full w-full border-0"
                />
              </div>
              <div className="mt-[18px] text-[10.5px] tracking-[0.16em] uppercase text-gold-muted font-bold">
                {member.role}
              </div>
              <h3 className="mt-[7px] mb-0 font-serif text-[20px] leading-[1.35] font-bold">
                {member.name}
              </h3>
              <p className="mt-[10px] mb-0 text-[13.5px] leading-[1.75] text-body-muted">
                {member.duty}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-[1180px] mx-auto px-[clamp(18px,5vw,40px)] pt-12">
        <h2 className="m-0 font-serif text-[24px] font-bold">Editorial roles</h2>
        <div className="grid [grid-template-columns:repeat(auto-fill,minmax(min(100%,260px),1fr))] mt-5 border-t border-rule">
          {roles.map((role) => (
            <div key={role.title} className="py-6 pr-[26px] border-b border-rule">
              <div className="font-serif text-[18px] font-bold text-ink">{role.title}</div>
              <div
                className="mt-[6px] text-[11.5px] tracking-[0.14em] uppercase font-bold"
                style={{ color: role.status === 'pending' ? '#8A7B5C' : '#5D1D21' }}
              >
                {role.statusLabel}
              </div>
              <p className="mt-[9px] mb-0 text-[13.5px] leading-[1.75] text-body-muted">
                {role.duty}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-[1180px] mx-auto px-[clamp(18px,5vw,40px)] pt-12">
        <div className="grid [grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-6">
          <div className="callout-gold px-[clamp(18px,3vw,32px)] py-[clamp(20px,3vw,30px)]">
            <h3 className="m-0 font-serif text-[21px] font-bold text-maroon">
              Join the reviewer panel
            </h3>
            <p className="mt-[10px] mb-0 text-[14.5px] leading-[1.8] text-body">
              We are recruiting reviewers across all five sections: graduate students, postdocs, and
              faculty. Two manuscripts a month, three-week turnaround.
            </p>
            <Link href="/reviewers/apply" className="btn-base btn-maroon mt-[18px]">
              Apply as a reviewer
            </Link>
          </div>

          <div className="callout-gold px-[clamp(18px,3vw,32px)] py-[clamp(20px,3vw,30px)]">
            <h3 className="m-0 font-serif text-[21px] font-bold text-maroon">
              Take on an editorial role
            </h3>
            <p className="mt-[10px] mb-0 text-[14.5px] leading-[1.8] text-body">
              The section editorships and the copyeditor post above are open. You would hold a
              section: what it reviews, who reviews it, and the decision that follows.
            </p>
            <Link href="/editors/apply" className="btn-base btn-maroon mt-[18px]">
              Apply as an editor
            </Link>
          </div>

          <div className="border border-rule px-[clamp(18px,3vw,32px)] py-[clamp(20px,3vw,30px)]">
            <h3 className="m-0 font-serif text-[21px] font-bold">Editorial independence</h3>
            <p className="mt-[10px] mb-0 text-[14.5px] leading-[1.8] text-body">
              Editors recuse themselves from any manuscript involving their own institution,
              supervisor, or collaborators. Decisions rest on the review of the work itself; the
              managing editor arbitrates where opinions differ.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
