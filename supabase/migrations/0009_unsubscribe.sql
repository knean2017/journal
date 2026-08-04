-- A way off the announcement list, and a way to see who is on it.
--
-- `newsletter_subscribers` has existed since 0001 and has only ever been
-- written to. Nothing reads it, nothing sends to it, and nothing can take an
-- address off it: `is_active` was declared in 0001 and no code path has ever
-- set it to false. Meanwhile /privacy tells people two things that were not
-- true of the data: that announcement addresses are "kept until you
-- unsubscribe", and that the emails are sent on consent alone. Consent that
-- cannot be withdrawn is not the consent that page describes.
--
-- So: a token that identifies a subscriber without their address appearing in
-- a URL, and a timestamp recording when they left. The token is the whole
-- credential, which is why it is a v4 uuid rather than anything derived from
-- the address: an address is guessable and a random 122-bit token is not.
--
-- `is_active` stays as the flag the code reads. `unsubscribed_at` is the
-- audit: proof of when consent was withdrawn, which is the half a regulator
-- asks for and a boolean cannot answer.

alter table newsletter_subscribers
  add column unsubscribe_token uuid not null default gen_random_uuid(),
  add column unsubscribed_at timestamptz;

-- Rows that predate this migration all took the default, and the default runs
-- per row, so each already holds its own token. The constraint is added after
-- the column for that reason: it would be rejected on a table with rows if the
-- default were a single shared value.
alter table newsletter_subscribers
  add constraint newsletter_subscribers_unsubscribe_token_key unique (unsubscribe_token);

-- The lookup the unsubscribe route performs, and the only query that reaches
-- this table by anything other than the address.
create index newsletter_subscribers_token_idx
  on newsletter_subscribers (unsubscribe_token);

-- The list a send would draw from, and the count the admin page shows.
create index newsletter_subscribers_active_idx
  on newsletter_subscribers (created_at desc) where is_active;

comment on column newsletter_subscribers.unsubscribe_token is
  'The credential in an unsubscribe link. Random, not derived from the address.';

comment on column newsletter_subscribers.unsubscribed_at is
  'When consent was withdrawn. Null while subscribed; kept if they return.';

-- ---------------------------------------------------------------- permissions

-- The new area, matching DEFAULT_MATRIX in src/lib/admin/permissions.ts.
--
-- Read-only for everyone except the administrator, including the editor. A
-- mailing list is the one thing in the panel that cannot be un-sent, and
-- nothing in the panel needs to edit it: people add themselves from /news and
-- remove themselves from the unsubscribe link. `content_manager` gets view
-- because that role runs announcements and would otherwise be composing for a
-- list whose size it cannot see.
insert into role_permissions (role, area, level) values
  ('administrator',   'subscribers', 'edit'),
  ('editor',          'subscribers', 'view'),
  ('content_manager', 'subscribers', 'view'),
  ('reviewer',        'subscribers', 'none'),
  ('observer',        'subscribers', 'view')
on conflict (role, area) do nothing;
