-- Applications to join the editorial board. The third thing that arrives from
-- the public site, after manuscripts and reviewer applications.
--
-- Same rules as the other two: RLS on, and no policy at all, so the table is
-- unreadable and unwritable by anon and authenticated alike. Only the
-- service-role key, which bypasses RLS, can touch it.

create table editor_applications (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  affiliation text not null,
  position text not null,
  -- The role title as it read when the application was sent, not a reference
  -- to editorial_roles. An editor may rename or remove a role once it is
  -- filled; the application is a record of what this person applied for, and
  -- it should still say so afterwards. The action rejects a title that is not
  -- currently being recruited, so this is not free text.
  role text not null,
  statement text not null default '',
  experience text not null default '',
  orcid text,
  status inbox_status not null default 'new',
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index editor_applications_created_idx on editor_applications (created_at desc);

create trigger set_updated_at before update on editor_applications
  for each row execute function set_updated_at();

alter table editor_applications enable row level security;

-- No policies, deliberately. See the comment at the top of this file.
