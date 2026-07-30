import type { Metadata } from 'next'
import Link from 'next/link'
import { PolicyBody, PolicySection, PolicyUpdated } from '@/components/site/policy/Policy'
import { PageHead } from '@/components/ui/PageHead'
import { getConfig } from '@/lib/content'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'Publication ethics',
  description:
    'Authorship, originality, declarations, conflicts of interest, corrections, retractions, and how to complain. The standards the International Collegiate Research Review holds itself to.',
  path: '/ethics',
})

export default async function EthicsPage() {
  const config = await getConfig()
  const mail = <a href={`mailto:${config.contactEmail}`}>{config.contactEmail}</a>

  return (
    <>
      <PageHead
        eyebrow="Publication ethics"
        title="What we expect, and what we do when it goes wrong"
        lead="A journal for early-career researchers has to be explicit about this, because for many authors it is their first time. Nothing here is unusual. It is simply written down."
        maxWidth="26ch"
      />

      <PolicyBody>
        <PolicyUpdated date="28 July 2026" />

        <PolicySection id="standards" heading="1. The standards we follow">
          <p className="m-0">
            We follow the principles of the Committee on Publication Ethics on authorship,
            plagiarism, data integrity and corrections. Where this page is silent on something, COPE
            guidance is what we will reason from.
          </p>
          <p className="m-0">
            These apply to everybody: authors, reviewers, editors, and the journal itself.
          </p>
        </PolicySection>

        <PolicySection id="authorship" heading="2. Authorship">
          <p className="m-0">
            An author is someone who contributed substantially to the work and to the writing of it,
            who approved the version submitted, and who is willing to be accountable for it. All
            three, not one of them.
          </p>
          <p className="m-0">
            Supervision on its own, funding on its own, and providing materials or access on their
            own are contributions to acknowledge, not to name as authorship. Adding a senior name
            that did not contribute is as serious a problem as leaving out a junior one that did.
          </p>
          <p className="m-0">
            The order of authors is for the authors to settle before submitting. Any change to the
            list after submission needs the written agreement of everyone on it, including anyone
            being removed, and a reason. We will not make the change on one author&rsquo;s word.
          </p>
        </PolicySection>

        <PolicySection id="originality" heading="3. Originality">
          <p className="m-0">
            Send us work that is yours and that has not been published elsewhere. Cite what you drew
            on, including your own earlier work; reusing your own text without saying so is still a
            problem, and it is one that catches people who did not realise it counted.
          </p>
          <p className="m-0">
            Do not send the same manuscript to us and to another journal at the same time. If you
            want to withdraw and send it elsewhere, tell us and withdraw it.
          </p>
          <p className="m-0">
            A thesis chapter or a conference abstract you have already made public is usually fine.
            Say so on submission and let us judge it rather than discovering it later.
          </p>
        </PolicySection>

        <PolicySection id="declarations" heading="4. What you must declare">
          <p className="m-0">
            Declare your funding, and any role a funder had in the design, conduct, or reporting of
            the work. Declare your supervision. Declare anything that could reasonably look like an
            interest in the result.
          </p>
          <p className="m-0">
            Declare any use of generative tools, saying what you used and what you used it for.
            Using one is not a problem in itself. Not saying so is. A generative tool cannot be an
            author, because it cannot be accountable for the work.
          </p>
          <p className="m-0">
            Where the research involved people or animals, name the body that gave ethical approval
            and the reference it gave you. Where it involved people, confirm they consented. We may
            ask to see the approval.
          </p>
        </PolicySection>

        <PolicySection id="data" heading="5. Data and figures">
          <p className="m-0">
            Report what you found, including what did not work. Do not remove observations without
            saying that you did and why. Figures may be adjusted for legibility, never in a way that
            changes what they show.
          </p>
          <p className="m-0">
            Keep your data. We may ask for it while we are considering the work, and we may ask for
            it afterwards if a question is raised about the article.
          </p>
        </PolicySection>

        <PolicySection id="conflicts" heading="6. Conflicts of interest">
          <p className="m-0">
            An editor steps aside from any manuscript involving their own institution, their
            supervisor, or their collaborators, and takes no part in the decision. The managing
            editor arbitrates where opinions differ. A reviewer in the same position is expected to
            say so and decline.
          </p>
          <p className="m-0">
            Editors of this journal may submit to it. When they do, they are an author and nothing
            else: handled by another editor, with no access to the file and no sight of who assessed
            it.
          </p>
        </PolicySection>

        <PolicySection id="review" heading="7. How a decision is reached">
          <p className="m-0">
            Every submission is read by an editor and reviewed before a decision is made, and
            nothing is published without that review. Work is judged on its question, its method,
            and the honesty of its conclusions, not on the seniority of its authors or where they
            study.
          </p>
          <p className="m-0">
            Anyone assessing a manuscript treats it as confidential. It is not shared, not
            discussed outside the process, and not used in their own work. If they cannot assess it
            fairly, they say so and hand it back.
          </p>
          <p className="m-0">
            The journal does not undertake to explain a decision. Where an editor can usefully say
            something, they will, but you should not submit expecting it.
          </p>
        </PolicySection>

        <PolicySection id="corrections" heading="8. Corrections and retractions">
          <p className="m-0">
            The published record is corrected in the open, never quietly. An article is never
            altered without a note saying what changed and when.
          </p>
          <p className="m-0">
            A <strong>correction</strong> is issued where an error affects part of the article but
            not its conclusions. A <strong>retraction</strong> is issued where the findings are
            unreliable, whether through honest error or misconduct, or where the work is
            substantially published elsewhere or infringes someone&rsquo;s rights. A retracted
            article stays online, marked as retracted on every page of it, with a notice saying why.
            Removing it would leave the citations pointing at nothing.
          </p>
          <p className="m-0">
            Anyone can raise a concern about a published article, authors included. Tell us as soon
            as you know.
          </p>
        </PolicySection>

        <PolicySection id="misconduct" heading="9. Misconduct">
          <p className="m-0">
            Where we have a credible concern about plagiarism, fabricated or manipulated data,
            duplicate publication, or authorship that has been misrepresented, we put it to the
            corresponding author and ask for an explanation before drawing any conclusion.
          </p>
          <p className="m-0">
            If it is not resolved, we may reject the submission, retract the article, or raise the
            matter with the author&rsquo;s institution, which is the body able to investigate it
            properly. We record what we decided and why.
          </p>
          <p className="m-0">
            An allegation made in good faith that turns out to be wrong is not held against the
            person who made it.
          </p>
        </PolicySection>

        <PolicySection id="appeals" heading="10. Appeals and complaints">
          <p className="m-0">
            To appeal a decision on your manuscript, write to {mail} within thirty days, saying what
            you think was misjudged. An editor who took no part in the original decision looks at
            it. Appeals are about the handling of the work, and disagreeing with the outcome is not
            by itself a ground.
          </p>
          <p className="m-0">
            To complain about how the journal or anyone acting for it behaved, write to the same
            address and say so plainly. We acknowledge within five working days and answer within
            thirty. If your complaint is about the managing editor, say so, and it will be handled
            by someone else.
          </p>
        </PolicySection>

        <PolicySection id="access" heading="11. Access, cost and preservation">
          <p className="m-0">
            Everything is open access from the day it appears. There is no charge to submit, no
            charge to publish, and no charge to read. Authors keep their copyright, and articles
            carry a Creative Commons Attribution 4.0 licence. The{' '}
            <Link href="/terms">terms of use</Link> set out what that means in practice.
          </p>
          <p className="m-0">
            Each article is issued a persistent identifier and a PDF of record, so that a citation
            keeps working.
          </p>
        </PolicySection>
      </PolicyBody>
    </>
  )
}
