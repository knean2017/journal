-- ICRR Journal schema.
--
-- Security model: RLS default-denies everything. Anonymous callers get SELECT
-- only, and only on published rows. There is no anon INSERT/UPDATE/DELETE
-- policy on any table. Every write goes through a Next.js server action using
-- the service-role key, which never reaches the browser.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------- enums

create type editorial_role_status as enum ('pending', 'recruiting');
create type issue_status as enum ('in_preparation', 'published');
create type article_status as enum ('draft', 'under_review', 'published');
create type submission_status as enum (
  'new', 'screening', 'under_review', 'accepted', 'rejected'
);

-- ---------------------------------------------------------------- helpers

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------- tables

create table site_config (
  id boolean primary key default true,
  deadline text not null,
  expected text not null,
  show_preview_notes boolean not null default true,
  contact_email text not null,
  issn_status text not null default 'Pending',
  hero_image_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Singleton: only one row can ever exist.
  constraint site_config_singleton check (id)
);

create table disciplines (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  blurb text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table team_members (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  role text not null,
  duty text not null,
  portrait_path text,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table editorial_roles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  status editorial_role_status not null,
  status_label text not null,
  duty text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table authors (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  role text not null,
  affiliation text not null,
  department text not null default '',
  location text not null default '',
  discipline_id uuid references disciplines (id) on delete set null,
  orcid text,
  email text,
  bio text not null default '',
  interests text[] not null default '{}',
  portrait_path text,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table issues (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  volume integer not null,
  number integer not null,
  status issue_status not null default 'in_preparation',
  status_label text not null default 'In preparation',
  publish_date date,
  submissions_close date,
  cover_path text,
  description text not null default '',
  is_current boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (volume, number)
);

-- At most one current issue.
create unique index issues_single_current on issues (is_current) where is_current;

create table articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  issue_id uuid references issues (id) on delete set null,
  discipline_id uuid references disciplines (id) on delete set null,
  article_type text not null default 'Research article',
  title text not null,
  abstract text not null default '',
  keywords text[] not null default '{}',
  body jsonb,
  status article_status not null default 'draft',
  status_label text not null default 'Draft',
  citation text not null default '',
  pdf_path text,
  page_start integer,
  page_end integer,
  received_on date,
  accepted_on date,
  published_on date,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table article_authors (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references articles (id) on delete cascade,
  author_id uuid not null references authors (id) on delete cascade,
  author_order integer not null default 1,
  affiliation_marker text not null default '1',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (article_id, author_id)
);

create table announcements (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  published_on date not null,
  tag text not null,
  title text not null,
  blurb text not null default '',
  body text not null default '',
  cta_label text,
  cta_href text,
  is_published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table ticker_lines (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table submissions (
  id uuid primary key default gen_random_uuid(),
  corresponding_author text not null,
  email text not null,
  institution text not null,
  discipline_id uuid references disciplines (id) on delete set null,
  title text not null,
  abstract text not null default '',
  manuscript_path text,
  originality_confirmed boolean not null default false,
  status submission_status not null default 'new',
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- triggers

do $$
declare
  t text;
begin
  foreach t in array array[
    'site_config', 'disciplines', 'team_members', 'editorial_roles', 'authors',
    'issues', 'articles', 'article_authors', 'announcements', 'ticker_lines',
    'submissions', 'newsletter_subscribers'
  ]
  loop
    execute format(
      'create trigger %I_set_updated_at before update on %I
       for each row execute function set_updated_at()', t, t
    );
  end loop;
end;
$$;

-- ---------------------------------------------------------------- indexes

create index authors_discipline_idx on authors (discipline_id);
create index articles_issue_idx on articles (issue_id);
create index articles_discipline_idx on articles (discipline_id);
create index article_authors_article_idx on article_authors (article_id);
create index article_authors_author_idx on article_authors (author_id);
create index submissions_status_idx on submissions (status, created_at desc);

-- ---------------------------------------------------------------- RLS

alter table site_config             enable row level security;
alter table disciplines             enable row level security;
alter table team_members            enable row level security;
alter table editorial_roles         enable row level security;
alter table authors                 enable row level security;
alter table issues                  enable row level security;
alter table articles                enable row level security;
alter table article_authors         enable row level security;
alter table announcements           enable row level security;
alter table ticker_lines            enable row level security;
alter table submissions             enable row level security;
alter table newsletter_subscribers  enable row level security;

-- Unconditional public read: no draft state, every row is public by definition.
create policy "public read" on site_config     for select to anon, authenticated using (true);
create policy "public read" on disciplines     for select to anon, authenticated using (true);
create policy "public read" on editorial_roles for select to anon, authenticated using (true);
create policy "public read" on issues          for select to anon, authenticated using (true);

-- Conditional public read: published rows only.
create policy "public read published" on team_members
  for select to anon, authenticated using (is_published);

create policy "public read published" on authors
  for select to anon, authenticated using (is_published);

create policy "public read published" on announcements
  for select to anon, authenticated using (is_published);

create policy "public read published" on articles
  for select to anon, authenticated using (status = 'published');

create policy "public read active" on ticker_lines
  for select to anon, authenticated using (is_active);

-- Join rows are readable only where the article they join is published.
create policy "public read for published articles" on article_authors
  for select to anon, authenticated using (
    exists (
      select 1 from articles a
      where a.id = article_authors.article_id and a.status = 'published'
    )
  );

-- submissions and newsletter_subscribers get no policy at all: unreadable and
-- unwritable except through the service-role key, which bypasses RLS.

-- ---------------------------------------------------------------- storage

insert into storage.buckets (id, name, public)
values
  ('media', 'media', true),
  ('article-pdfs', 'article-pdfs', true),
  ('manuscripts', 'manuscripts', false)
on conflict (id) do nothing;

create policy "public read media" on storage.objects
  for select to anon, authenticated using (bucket_id = 'media');

create policy "public read article pdfs" on storage.objects
  for select to anon, authenticated using (bucket_id = 'article-pdfs');

-- manuscripts: no policy. Reachable only by the service role, which issues
-- short-lived signed URLs to the admin.
