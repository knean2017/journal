-- Two more things that arrive from the public site and land in the editorial
-- office: applications to join the reviewer panel, and general enquiries.
--
-- Both follow the submissions table's rules exactly: RLS on, and no policy at
-- all, so they are unreadable and unwritable by anon and authenticated alike.
-- Only the service-role key, which bypasses RLS, can touch them.

create type inbox_status as enum ('new', 'replied', 'archived');

create table reviewer_applications (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  affiliation text not null,
  position text not null,
  discipline_id uuid references disciplines (id) on delete set null,
  expertise text not null default '',
  experience text not null default '',
  orcid text,
  status inbox_status not null default 'new',
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  topic text not null,
  message text not null,
  status inbox_status not null default 'new',
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index reviewer_applications_created_idx on reviewer_applications (created_at desc);
create index contact_messages_created_idx on contact_messages (created_at desc);

create trigger set_updated_at before update on reviewer_applications
  for each row execute function set_updated_at();
create trigger set_updated_at before update on contact_messages
  for each row execute function set_updated_at();

alter table reviewer_applications enable row level security;
alter table contact_messages enable row level security;

-- No policies, deliberately. See the comment at the top of this file.
