-- Who may get into the editorial office, and what each kind of person may do.
--
-- Until now any account that could authenticate was a full administrator. There
-- was no record of who those accounts belonged to and no way to give somebody
-- less than everything.
--
-- Two tables. `staff` says which authenticated user holds which role.
-- `role_permissions` says what a role may do, one row per role and area, so the
-- grid on the people page can be edited without a deploy.
--
-- Neither table gets an RLS policy. Both are reachable only through the
-- service-role key, exactly like `submissions` and the application inboxes.
-- Note that this means the database will not enforce any of this on the app's
-- behalf: the service-role client bypasses RLS, so `src/lib/admin/permissions.ts`
-- and the gates that call it are the whole control.

create type staff_role as enum (
  'administrator',
  'editor',
  'content_manager',
  'reviewer',
  'observer'
);

create type access_level as enum ('none', 'view', 'edit');

create table staff (
  user_id uuid primary key references auth.users(id) on delete cascade,
  -- Kept alongside the auth record so the people list reads without a join into
  -- the auth schema, and so a row survives long enough to show who was removed.
  email text not null unique,
  name text,
  -- Deliberately the least privileged role. An invite that is sent without a
  -- role chosen, or a row written by some future path that forgets to set one,
  -- must not land on `administrator`.
  role staff_role not null default 'observer',
  -- Revoking access without deleting the row, so the audit of who had access
  -- is not lost the moment somebody leaves.
  is_active boolean not null default true,
  invited_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index staff_role_idx on staff (role) where is_active;

create table role_permissions (
  role staff_role not null,
  -- Text rather than an enum: the set of areas belongs to the application, and
  -- adding one should not need a migration. An area here that the code does not
  -- recognise is ignored, and one the code has that is missing here falls back
  -- to the built-in default. Neither case grants anything.
  area text not null,
  level access_level not null default 'none',
  updated_at timestamptz not null default now(),
  primary key (role, area)
);

alter table staff            enable row level security;
alter table role_permissions enable row level security;

create trigger staff_set_updated_at before update on staff
  for each row execute function set_updated_at();

create trigger role_permissions_set_updated_at before update on role_permissions
  for each row execute function set_updated_at();

-- The starting grid, matching DEFAULT_MATRIX in src/lib/admin/permissions.ts.
--
-- The administrator rows are written for completeness and for the grid to read,
-- but they are not what grants an administrator anything: `levelFor` answers
-- 'edit' for that role before it ever consults this table, so clearing these
-- rows cannot lock everybody out.
insert into role_permissions (role, area, level) values
  ('administrator', 'dashboard',         'edit'),
  ('administrator', 'submissions',       'edit'),
  ('administrator', 'applications',      'edit'),
  ('administrator', 'messages',          'edit'),
  ('administrator', 'content.journal',   'edit'),
  ('administrator', 'content.outreach',  'edit'),
  ('administrator', 'content.people',    'edit'),
  ('administrator', 'media',             'edit'),
  ('administrator', 'settings',          'edit'),
  ('administrator', 'people',            'edit'),

  ('editor',        'dashboard',         'view'),
  ('editor',        'submissions',       'edit'),
  ('editor',        'applications',      'edit'),
  ('editor',        'messages',          'edit'),
  ('editor',        'content.journal',   'edit'),
  ('editor',        'content.outreach',  'edit'),
  ('editor',        'content.people',    'edit'),
  ('editor',        'media',             'edit'),
  ('editor',        'settings',          'none'),
  ('editor',        'people',            'none'),

  ('content_manager', 'dashboard',        'view'),
  ('content_manager', 'submissions',      'none'),
  ('content_manager', 'applications',     'none'),
  ('content_manager', 'messages',         'edit'),
  ('content_manager', 'content.journal',  'none'),
  ('content_manager', 'content.outreach', 'edit'),
  ('content_manager', 'content.people',   'edit'),
  ('content_manager', 'media',            'edit'),
  ('content_manager', 'settings',         'none'),
  ('content_manager', 'people',           'none'),

  ('reviewer',      'dashboard',         'none'),
  ('reviewer',      'submissions',       'edit'),
  ('reviewer',      'applications',      'none'),
  ('reviewer',      'messages',          'none'),
  ('reviewer',      'content.journal',   'none'),
  ('reviewer',      'content.outreach',  'none'),
  ('reviewer',      'content.people',    'none'),
  ('reviewer',      'media',             'none'),
  ('reviewer',      'settings',          'none'),
  ('reviewer',      'people',            'none'),

  ('observer',      'dashboard',         'view'),
  ('observer',      'submissions',       'view'),
  ('observer',      'applications',      'view'),
  ('observer',      'messages',          'view'),
  ('observer',      'content.journal',   'view'),
  ('observer',      'content.outreach',  'view'),
  ('observer',      'content.people',    'view'),
  ('observer',      'media',             'view'),
  ('observer',      'settings',          'view'),
  ('observer',      'people',            'none');

comment on table staff is
  'Which authenticated user holds which role. No row means no access to the panel at all.';

comment on table role_permissions is
  'What each role may do, one row per role and area. Edited from the people page.';
