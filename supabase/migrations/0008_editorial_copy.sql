-- The copy that describes how the journal runs, moved out of the code.
--
-- Five blocks lived in src/lib/content/seed/process.ts and reached the site
-- without passing through a table, under a comment calling them fixed copy.
-- That was fair for most of them and wrong for the production timeline, which
-- carries five dated milestones and changes every issue: correcting a date was
-- a code change and a deploy.
--
-- These tables ship empty. Nothing is seeded here, so each block is absent from
-- the site until an editor enters it, and the render sites hide a block whose
-- list comes back empty rather than leaving a heading over nothing.
--
-- The seed file stays where it is. It is still the fallback when Supabase is
-- absent or a read fails, which is what lets the site build with no database
-- attached.

-- The five dated milestones on the current issue page.
create table timeline_entries (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  -- `when` is reserved in Postgres and would need quoting at every use.
  when_label text not null,
  body text not null,
  -- Fills the dot on the rail. Named for the milestone rather than the dot,
  -- because reaching the milestone is what an editor is recording.
  is_reached boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- "From submission to publication", on the home page and the submit page.
create table process_steps (
  id uuid primary key default gen_random_uuid(),
  -- The numeral in the box, as text: it is a label, never arithmetic.
  step_label text not null,
  time_label text not null,
  title text not null,
  body text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- "Journal at a glance", on the about page.
create table journal_facts (
  id uuid primary key default gen_random_uuid(),
  key text not null,
  value text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- The manuscript requirements on the submit page.
create table submission_requirements (
  id uuid primary key default gen_random_uuid(),
  key text not null,
  value text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- The pre-submission checklist on the submit page. A separate table rather than
-- a kind column on submission_requirements: the two render as separate lists,
-- and sharing one table would put a label field on the form that a checklist
-- row never fills in.
create table submission_checklist (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- triggers

-- The loop in 0001_init.sql runs over a closed array of table names, so these
-- five need their own statements or their updated_at never moves.
create trigger timeline_entries_set_updated_at before update on timeline_entries
  for each row execute function set_updated_at();

create trigger process_steps_set_updated_at before update on process_steps
  for each row execute function set_updated_at();

create trigger journal_facts_set_updated_at before update on journal_facts
  for each row execute function set_updated_at();

create trigger submission_requirements_set_updated_at before update on submission_requirements
  for each row execute function set_updated_at();

create trigger submission_checklist_set_updated_at before update on submission_checklist
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------- indexes

create index timeline_entries_order_idx        on timeline_entries (sort_order);
create index process_steps_order_idx           on process_steps (sort_order);
create index journal_facts_order_idx           on journal_facts (sort_order);
create index submission_requirements_order_idx on submission_requirements (sort_order);
create index submission_checklist_order_idx    on submission_checklist (sort_order);

-- ---------------------------------------------------------------- rls

alter table timeline_entries        enable row level security;
alter table process_steps           enable row level security;
alter table journal_facts           enable row level security;
alter table submission_requirements enable row level security;
alter table submission_checklist    enable row level security;

-- Unconditional public read. None of these has a draft state the way
-- ticker_lines does: a row that exists is copy that is on the site, and an
-- editor who wants it gone deletes it. Writes go through the service-role
-- client, as they do for every content table.
create policy "public read" on timeline_entries
  for select to anon, authenticated using (true);

create policy "public read" on process_steps
  for select to anon, authenticated using (true);

create policy "public read" on journal_facts
  for select to anon, authenticated using (true);

create policy "public read" on submission_requirements
  for select to anon, authenticated using (true);

create policy "public read" on submission_checklist
  for select to anon, authenticated using (true);
