import type { Metadata } from 'next'
import Link from 'next/link'
import {
  PolicyBody,
  PolicyList,
  PolicySection,
  PolicyUpdated,
  ToFill,
} from '@/components/site/policy/Policy'
import { PageHead } from '@/components/ui/PageHead'
import { getConfig } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Privacy',
  description:
    'What the International Collegiate Research Review collects when you submit, apply, or write to us, who else sees it, and what you can ask us to do with it.',
}

export default async function PrivacyPage() {
  const config = await getConfig()
  const mail = <a href={`mailto:${config.contactEmail}`}>{config.contactEmail}</a>

  return (
    <>
      <PageHead
        eyebrow="Privacy"
        title="What we collect, and what we do with it"
        lead="This describes what actually happens on this site. Every form is listed, with the fields it asks for and the reason we hold them."
        maxWidth="24ch"
      />

      <PolicyBody>
        <PolicyUpdated date="28 July 2026" />

        <PolicySection id="who-we-are" heading="1. Who is responsible">
          <p className="m-0">
            The International Collegiate Research Review is the controller of the personal data
            described here. The journal is based in Azerbaijan and publishes work from authors
            anywhere.
          </p>
          {/* <p className="m-0">
            Registered name and postal address:{' '}
            <ToFill>to be filled in before this page goes live</ToFill>
          </p> */}
          <p className="m-0">Questions about anything on this page go to {mail}.</p>
        </PolicySection>

        <PolicySection id="what-we-collect" heading="2. What each form collects">
          <p className="m-0">
            Nothing on this site is collected quietly. These five forms are the only places you can
            give us personal data, and each one shows you every field before you send it.
          </p>
          <PolicyList
            items={[
              {
                term: 'Submitting a manuscript',
                detail:
                  'The corresponding author’s name, email address and institution, the section, the title and abstract, your confirmation that the work is original, and the manuscript file itself. The file may contain personal data about co-authors and about anyone your research involved; that is for you to consider before uploading it.',
              },
              {
                term: 'Applying to the reviewer panel',
                detail:
                  'Your name, email address, institution and current position, the section you want to review for, the subject areas you can assess, your ORCID if you give one, and any account of your reviewing experience you choose to add.',
              },
              {
                term: 'Applying for an editorial role',
                detail:
                  'Your name, email address, institution and current position, the role you are applying for, why you want it, your ORCID if you give one, and any account of your editorial experience you choose to add.',
              },
              {
                term: 'Writing to the editorial office',
                detail:
                  'Your name, email address, the topic you pick, and your message.',
              },
              {
                term: 'Asking for announcements by email',
                detail: 'Your email address, and nothing else.',
              },
            ]}
          />
          <p className="m-0">
            We also read the network address your request arrives from. It is used to count how many
            times a form has been sent from one place in the last hour, so that the office is not
            flooded, and it is held in memory for that hour only. It is never written to the
            database and never joined to anything you sent.
          </p>
        </PolicySection>

        <PolicySection id="why" heading="3. Why we are allowed to hold it">
          <p className="m-0">
            <strong>Submissions and applications</strong> are handled because you asked us to
            consider them. Under the GDPR this is the step taken at your request before entering
            into an agreement, together with our legitimate interest in running an academic journal
            and keeping a record of what was decided and why.
          </p>
          <p className="m-0">
            <strong>Messages to the office</strong> are handled on our legitimate interest in
            answering people who write to us.
          </p>
          <p className="m-0">
            <strong>Announcement emails</strong> are sent on your consent alone. You gave it by
            entering your address, and you can withdraw it at any time by writing to {mail}.
          </p>
        </PolicySection>

        <PolicySection id="cookies" heading="4. Cookies">
          <p className="m-0">
            This site sets no cookies on visitors, uses no analytics, and carries no advertising,
            tracking pixels or third-party scripts. Its pages are the same for everybody, so there
            is nothing to remember about you between visits and no consent banner to click.
          </p>
          <p className="m-0">
            One cookie exists, and only for editorial staff: signing in to the editorial office
            sets a session cookie so the browser stays signed in. If you have never signed in, you
            have never had it.
          </p>
        </PolicySection>

        <PolicySection id="who-sees-it" heading="5. Who else sees it">
          <p className="m-0">
            Only the editors handling your submission or application read what you send. We do not
            sell personal data, and we do not share it for anyone else&rsquo;s marketing.
          </p>
          <p className="m-0">Three suppliers process data on our behalf in order to run the site:</p>
          <PolicyList
            items={[
              {
                term: 'Supabase',
                detail:
                  'Holds the database and the uploaded manuscript files. Manuscripts sit in a private store that no public request can reach; an editor opens one through a link that stops working after five minutes.',
              },
              {
                term: 'Netlify',
                detail: 'Serves the site and runs the code behind the forms.',
              },
              {
                term: 'Resend',
                detail:
                  'Sends the notification that tells the office something has arrived. It sees the name and email address in that notification. If the journal has not configured it, no email is sent and nothing reaches Resend at all.',
              },
            ]}
          />
          <p className="m-0">
            These suppliers store data outside Azerbaijan, including in the European Union and the
            United States. Where that transfer involves personal data of people in the European
            Economic Area, it relies on the standard contractual clauses in each supplier&rsquo;s
            terms.
          </p>
          <p className="m-0">
            We would also disclose data where a law we are subject to requires it. If that ever
            happens we will tell you, unless we are forbidden from doing so.
          </p>
        </PolicySection>

        <PolicySection id="how-long" heading="6. How long we keep it">
          <p className="m-0">
            <strong>Submissions that led to publication</strong> are kept permanently. They are part
            of the record of the work.
          </p>
          <p className="m-0">
            <strong>Submissions that did not</strong> are kept for two years from the decision, so
            that we can answer questions about it, then deleted along with the manuscript file.
          </p>
          <p className="m-0">
            <strong>Applications to review or edit</strong> are kept for two years, because panels
            are refreshed and a good application is often worth returning to. Ask us and we will
            remove yours sooner.
          </p>
          <p className="m-0">
            <strong>Messages to the office</strong> are kept for two years.{' '}
            <strong>Announcement addresses</strong> are kept until you unsubscribe.
          </p>
        </PolicySection>

        <PolicySection id="published" heading="7. What becomes public, and stays public">
          <p className="m-0">
            Publication is the point of the exercise, so some of what you send is meant to be seen.
            An author&rsquo;s name, institution, ORCID, biography and photograph appear on the
            article and on the contributor page, and stay there.
          </p>
          <p className="m-0">
            A published article is a permanent record that other work cites and builds on, so we
            cannot unpublish one to satisfy a request for erasure. What we can do is correct it,
            and there is a route for that in the{' '}
            <Link href="/ethics">publication ethics policy</Link>. Nothing in this section applies
            to submissions we did not publish, or to applications.
          </p>
        </PolicySection>

        <PolicySection id="your-rights" heading="8. Your rights">
          <p className="m-0">
            Wherever you are, you may ask us for a copy of what we hold about you, ask us to correct
            it, ask us to delete it, ask us to restrict what we do with it, object to our handling
            it on the grounds of legitimate interest, or ask for it in a portable form. Where we
            rely on your consent you may withdraw it at any time, and that does not affect anything
            done before you did.
          </p>
          <p className="m-0">
            Write to {mail}. We answer within one month. There is no charge, and no need to explain
            why you are asking.
          </p>
          <p className="m-0">
            If you are in the European Economic Area or the United Kingdom and you think we have
            handled your data badly, you may complain to the data protection authority where you
            live. We would rather you told us first, but you are not obliged to.
          </p>
        </PolicySection>

        <PolicySection id="security" heading="9. How it is kept">
          <p className="m-0">
            The database refuses every request by default and permits only the specific reads the
            public site needs, all of which are of published material. Everything an editor writes
            goes through a checked sign-in. Manuscripts are held apart from the rest, in a store
            with no public route into it.
          </p>
          <p className="m-0">
            No system is beyond reach. If a breach ever affects your data and puts you at real risk,
            we will tell you and the relevant authority as the law requires.
          </p>
        </PolicySection>

        <PolicySection id="changes" heading="10. Changes">
          <p className="m-0">
            If this page changes, the date at the top changes with it. Where a change materially
            affects people whose data we already hold, we will write to them rather than rely on
            their noticing.
          </p>
        </PolicySection>
      </PolicyBody>
    </>
  )
}
