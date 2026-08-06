-- The editorial copy that 0008 moved out of the code, as rows.
--
-- Not a migration. 0008 created these five tables and deliberately left them
-- empty, on the reasoning that each block should be absent from the site until
-- an editor entered it. What that missed is that the copy already existed and
-- was already on the site: moving it to the database without carrying the rows
-- across took five blocks off the live pages the moment the tables were
-- reachable. The site does not fall back to the seed files here, because an
-- empty table is a successful read, not a failure.
--
-- This is the carry-across. It is the exact text from
-- src/lib/content/seed/process.ts, which is still the fallback for a build with
-- no database attached, so running this puts the two sources back in agreement.
--
-- Safe to paste into the Supabase SQL editor as it stands:
--
--   * It inserts into five tables and nothing else. It does not touch
--     announcements, issues, articles, authors, team members, or site config.
--   * Every block is guarded by `where not exists`, so a table that already has
--     rows in it is skipped entirely. Nothing an editor has typed is
--     overwritten, and running this twice changes nothing the second time.
--   * `npm run seed` does not cover these five tables at all, so this is the
--     only thing that will populate them.

-- ------------------------------------------------- from submission to publication
-- Home page, and the submit page.
insert into process_steps (step_label, time_label, title, body, sort_order)
select * from (values
  ('1', 'Day 1',     'Submission',                'Upload an anonymised manuscript and a short cover letter.', 0),
  ('2', 'Week 1',    'Editorial screening',       'An editor checks scope, eligibility, and similarity.',       1),
  -- No review model is named here or anywhere else. The journal reviews what it
  -- publishes and does not run double-blind or formal peer review, so a named
  -- model would promise a process that does not exist.
  ('3', 'Weeks 1–3', 'Review',                    'The manuscript is reviewed on its method and its evidence.', 2),
  ('4', 'Week 4',    'Decision and copyediting',  'Accepted papers are copyedited for the next issue.',         3)
) as v(step_label, time_label, title, body, sort_order)
where not exists (select 1 from process_steps);

-- ------------------------------------------------- production timeline
-- The current issue page. The block 0008 singled out as the one that genuinely
-- changes every issue, which is the reason these tables exist.
insert into timeline_entries (title, when_label, body, is_reached, sort_order)
select * from (values
  ('Submissions open',           'Now',            'Rolling. Papers enter the next available issue cycle.',      true,  0),
  ('Issue 1 submissions close',  '31 Aug 2026',    'Later submissions are held for the December issue.',         false, 1),
  ('Review',                     '2–3 weeks',      'Each manuscript is reviewed before it goes to a decision.',  false, 2),
  ('Decisions returned',         'Mid-Sept 2026',  'Accept, revise, or decline, based on the review.',           false, 3),
  ('Publication',                '30 Sept 2026',   'Issue 1 published open access, then every three months.',    false, 4)
) as v(title, when_label, body, is_reached, sort_order)
where not exists (select 1 from timeline_entries);

-- ------------------------------------------------- journal at a glance
-- The about page. The whole panel disappears when this is empty, header and all.
insert into journal_facts (key, value, sort_order)
select * from (values
  ('Founded',     '2026',               0),
  ('Access',      'Open, CC BY 4.0',    1),
  ('Author fees', 'None',               2),
  ('Review',      'Before publication', 3),
  ('Frequency',   'Every three months', 4),
  ('ISSN',        'Pending',            5)
) as v(key, value, sort_order)
where not exists (select 1 from journal_facts);

-- ------------------------------------------------- manuscript requirements
-- The submit page.
insert into submission_requirements (key, value, sort_order)
select * from (values
  ('Length',         '3,000–8,000 words excluding references and appendices.',                          0),
  ('File format',    'PDF or DOCX, single column, 1.5 line spacing, numbered pages.',                   1),
  ('Anonymisation',  'No author names, affiliations, or acknowledgements in the manuscript file.',      2),
  ('Cover letter',   'Required, as a separate file. Not anonymised: your names and institution go here.', 3),
  ('Abstract',       '250 words maximum, plus four to six keywords.',                                   4),
  ('References',     'Consistent style throughout: APA, Chicago, or OSCOLA.',                           5),
  ('Figures',        'Numbered, captioned, and legible in greyscale at print size.',                    6)
) as v(key, value, sort_order)
where not exists (select 1 from submission_requirements);

-- ------------------------------------------------- pre-submission checklist
-- The submit page, below the requirements.
insert into submission_checklist (text, sort_order)
select * from (values
  ('At least one author is a current high school, undergraduate, or graduate student, or graduated within the last twelve months.', 0),
  ('Where an author is under 18, a parent or guardian has consented in writing to publication.', 1),
  ('The manuscript is anonymised and contains no identifying information.',                2),
  ('The work is original, unpublished, and not under consideration elsewhere.',            3),
  ('Ethical approval is attached where human subjects are involved.',                      4),
  ('Funding, supervision, and use of generative tools are declared in the cover letter.',  5)
) as v(text, sort_order)
where not exists (select 1 from submission_checklist);

-- What you should see afterwards: 4, 5, 6, 7, 6.
select 'process_steps' as block, count(*) from process_steps
union all select 'timeline_entries',        count(*) from timeline_entries
union all select 'journal_facts',           count(*) from journal_facts
union all select 'submission_requirements', count(*) from submission_requirements
union all select 'submission_checklist',    count(*) from submission_checklist;
