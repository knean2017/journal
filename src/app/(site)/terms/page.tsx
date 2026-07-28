import type { Metadata } from 'next'
import Link from 'next/link'
import {
  PolicyBody,
  PolicySection,
  PolicyUpdated,
  ToFill,
} from '@/components/site/policy/Policy'
import { PageHead } from '@/components/ui/PageHead'
import { getConfig } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Terms of use',
  description:
    'The terms on which the International Collegiate Research Review publishes: what you promise when you submit, what you keep, and what we do not undertake.',
}

export default async function TermsPage() {
  const config = await getConfig()
  const mail = <a href={`mailto:${config.contactEmail}`}>{config.contactEmail}</a>

  return (
    <>
      <PageHead
        eyebrow="Terms of use"
        title="The terms on which we publish"
        lead="Short, and worth reading before you submit. The section on what you promise us is the one that matters most."
        maxWidth="24ch"
      />

      <PolicyBody>
        <PolicyUpdated date="28 July 2026" />

        <PolicySection id="who" heading="1. Who these terms are with">
          <p className="m-0">
            This site is published by the International Collegiate Research Review, based in Azerbaijan. 
            {/* Registered name and postal address:{' '}
            <ToFill>to be filled in before this page goes live</ToFill> */}
          </p>
          <p className="m-0">
            Using the site means accepting these terms. If you do not accept them, please do not use
            it.
          </p>
        </PolicySection>

        <PolicySection id="using" heading="2. Using the site">
          <p className="m-0">
            Read, cite, download and share what is published here. That is what it is for.
          </p>
          <p className="m-0">
            Do not try to reach parts of the site you have not been given access to, do not
            interfere with how it runs, and do not use the forms to send anything unlawful,
            defamatory, or dishonestly obtained. Automated collection of the site is acceptable at a
            rate that does not degrade it for anybody else.
          </p>
        </PolicySection>

        <PolicySection id="submitting" heading="3. What you promise when you submit">
          <p className="m-0">By sending us a manuscript you tell us, and we rely on it, that:</p>
          <ul className="m-0 pl-[22px] flex flex-col gap-[10px]">
            <li>The work is yours, and everyone who qualifies as an author is named as one.</li>
            <li>It is original, and where it draws on other work that work is cited.</li>
            <li>
              It is not published elsewhere and is not under consideration elsewhere while it is
              with us.
            </li>
            <li>
              You have permission for any third-party material in it, including figures, tables and
              long quotations.
            </li>
            <li>
              Where the research involved people or animals, the necessary ethical approval was
              obtained and can be produced.
            </li>
            <li>
              You have declared your funding, your supervision, and any use of generative tools.
            </li>
            <li>Everyone named as an author has agreed to the submission.</li>
          </ul>
          <p className="m-0">
            The <Link href="/ethics">publication ethics policy</Link> sets out what each of these
            means and what happens when one of them turns out not to hold.
          </p>
        </PolicySection>

        <PolicySection id="rights" heading="4. What you keep, and what you grant">
          <p className="m-0">
            <strong>You keep the copyright in your work.</strong> We do not ask you to assign it and
            we will not.
          </p>
          <p className="m-0">
            What you grant us, if we publish, is the right to publish the article, to keep it
            available, and to make the technical copies that entails. You also agree that the
            published article carries a Creative Commons Attribution 4.0 licence, which is what lets
            any reader reuse it provided they credit you.
          </p>
          <p className="m-0">
            While a manuscript is under consideration you grant us only what is needed to consider
            it: to hold it, to read it, and to show it to the editors and reviewers assessing it.
            Withdraw it and that ends.
          </p>
        </PolicySection>

        <PolicySection id="reuse" heading="5. Reusing what we publish">
          <p className="m-0">
            Articles are licensed CC BY 4.0. You may copy, redistribute, adapt and build on them,
            including commercially, provided you credit the author, link to the licence, and say
            whether you changed anything.
          </p>
          <p className="m-0">
            That licence covers the articles. It does not cover the journal&rsquo;s name, its
            lockup, or the design of this site, which remain ours. Third-party material inside an
            article is on whatever terms its owner set, and those terms may be narrower.
          </p>
        </PolicySection>

        <PolicySection id="fees" heading="6. Fees">
          <p className="m-0">
            There are none. No charge to submit, no charge to publish, and no charge to read.
          </p>
        </PolicySection>

        <PolicySection id="applications" heading="7. Applying to review or to edit">
          <p className="m-0">
            An application is an expression of interest and nothing more. It is not an offer of a
            position, it creates no employment or contract, and we may decline it without giving a
            reason. An appointment, if one is made, is unpaid and voluntary unless we agree
            otherwise in writing.
          </p>
        </PolicySection>

        <PolicySection id="no-promises" heading="8. What we do not undertake">
          <p className="m-0">
            We do not undertake to publish what you send us, and we do not undertake to tell you why
            a decision went the way it did.
          </p>
          <p className="m-0">
            We do not undertake that the site will be available without interruption, and we may
            change or withdraw any part of it.
          </p>
          <p className="m-0">
            Published articles are the work and the responsibility of their authors. Publishing one
            is not an endorsement of its conclusions by the journal, and nothing here is
            professional, medical or legal advice.
          </p>
        </PolicySection>

        <PolicySection id="liability" heading="9. Liability">
          <p className="m-0">
            To the extent the law allows, we are not liable for indirect or consequential loss, for
            lost profit or opportunity, or for loss of data, arising from your use of this site or
            from anything published on it.
          </p>
          <p className="m-0">
            Nothing here limits liability that cannot lawfully be limited, including for death or
            personal injury caused by negligence, or for fraud. If you are a consumer, your rights
            under the law where you live are unaffected by anything on this page.
          </p>
        </PolicySection>

        <PolicySection id="law" heading="10. Governing law">
          <p className="m-0">
            These terms are governed by the law of the Republic of Azerbaijan, and its courts have
            jurisdiction. If you are a consumer resident elsewhere, this does not deprive you of the
            protection of your own country&rsquo;s mandatory law.
          </p>
        </PolicySection>

        <PolicySection id="changes" heading="11. Changes, and how to reach us">
          <p className="m-0">
            If these terms change, the date at the top changes with it. A manuscript already under
            consideration stays on the terms that applied when it was sent.
          </p>
          <p className="m-0">Write to {mail}.</p>
        </PolicySection>
      </PolicyBody>
    </>
  )
}
