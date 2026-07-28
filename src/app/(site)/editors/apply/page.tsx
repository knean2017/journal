import type { Metadata } from 'next'
import { EditorForm } from '@/components/site/editors/EditorForm'
import { PageHead } from '@/components/ui/PageHead'
import { getConfig, getEditorialRoles } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Join the editorial board',
  description:
    'Apply for an editorial role at the International Collegiate Research Review. Section editorships and a copyeditor post are open ahead of Issue 1.',
}

export default async function EditorApplyPage() {
  const [config, roles] = await Promise.all([getConfig(), getEditorialRoles()])

  /*
   * Only the roles actually being recruited. A role whose appointment is
   * pending is already in hand, and offering it would invite an application
   * nobody can act on. The action checks the same list server side.
   */
  const openRoles = roles.filter((role) => role.status === 'recruiting')

  return (
    <>
      <PageHead
        eyebrow="For editors"
        title="Join the editorial board"
        lead="The section editorships and the copyeditor post are being appointed ahead of Issue 1. Postdocs and faculty are the usual fit, and a graduate student who has done the work is welcome to apply."
        maxWidth="none"
      />

      <section className="max-w-[1180px] mx-auto px-[clamp(18px,5vw,40px)] pt-10 grid [grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr))] gap-[clamp(30px,4vw,56px)] items-start">
        <div>
          <h2 className="m-0 font-serif text-[24px] font-bold text-maroon">
            Who we are looking for
          </h2>
          <p className="mt-3 mb-0 text-[15.5px] leading-[1.85] text-body">
            Someone who can hold a section: read what arrives, judge what is worth reviewing, find
            the right reviewers for it, and stand behind the decision that follows. Subject
            knowledge matters, and so does the willingness to explain a decision to an author who is
            early in their career and will take it seriously.
          </p>

          <h2 className="mt-[38px] mb-0 font-serif text-[24px] font-bold text-maroon">
            The roles open now
          </h2>
          {openRoles.length > 0 ? (
            <div className="mt-4 border-t border-rule">
              {/* Title over duty on a phone, beside it from 640px up. */}
              {openRoles.map((role) => (
                <div
                  key={role.title}
                  className="grid gap-[2px] sm:[grid-template-columns:minmax(110px,220px)_minmax(0,1fr)] sm:gap-[clamp(14px,2vw,24px)] py-[14px] border-b border-rule text-[14.5px] leading-[1.7]"
                >
                  <span className="font-bold text-ink">{role.title}</span>
                  <span className="text-body">{role.duty}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 mb-0 text-[15.5px] leading-[1.85] text-body">
              Every editorial role is filled or has an appointment pending. Write to{' '}
              <a href={`mailto:${config.contactEmail}`}>{config.contactEmail}</a> if you would like
              to be considered when one next opens.
            </p>
          )}

          {openRoles.length > 0 ? (
            <>
              <h2 id="form" className="mt-11 mb-0 font-serif text-[24px] font-bold text-maroon">
                Application
              </h2>
              <EditorForm roles={openRoles} />
            </>
          ) : null}
        </div>

        <aside className="flex flex-col gap-5 sticky top-[70px] w-full max-w-[380px] justify-self-start">
          <div className="border border-rule">
            <div className="bg-maroon text-cream px-[18px] py-[11px] text-[11px] tracking-[0.16em] uppercase font-bold">
              How appointments are made
            </div>
            <div className="px-[18px] py-4 text-[14px] leading-[1.8] text-body">
              Applications go to the founding editor, who is filling these posts ahead of Issue 1.
              Expect a conversation about the section before anything is settled.
            </div>
          </div>

          <div className="border border-rule px-[18px] py-5">
            <div className="text-[11px] tracking-[0.16em] uppercase text-gold-muted font-bold">
              Editorial independence
            </div>
            <p className="mt-[10px] mb-0 text-[13.5px] leading-[1.75] text-body">
              Editors recuse themselves from any manuscript involving their own institution,
              supervisor, or collaborators. The managing editor arbitrates where opinions differ.
            </p>
          </div>

          <div className="border border-rule px-[18px] py-5">
            <div className="text-[11px] tracking-[0.16em] uppercase text-gold-muted font-bold">
              Questions
            </div>
            <p className="mt-[10px] mb-0 text-[13.5px] leading-[1.75] text-body">
              Write to <a href={`mailto:${config.contactEmail}`}>{config.contactEmail}</a> and an
              editor will reply within five working days.
            </p>
          </div>
        </aside>
      </section>
    </>
  )
}
