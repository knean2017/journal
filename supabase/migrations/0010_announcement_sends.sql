-- Proof that an address belongs to the person who typed it, and a record of
-- every announcement mailed out.
--
-- The rule this exists to enforce: only somebody who subscribed themselves is
-- sent anything. Until now the form took an address on trust, so one typo put
-- a stranger on the list with no way for them to know. A confirmation link
-- closes that: the address is stored the moment it is entered, but nothing is
-- ever sent to it until somebody opens the mailbox and says yes.
--
-- `is_active` and `confirmed_at` answer different questions and both have to
-- pass before an address is mailed. Active means they have not unsubscribed.
-- Confirmed means the address was real and its owner agreed. Losing either one
-- takes the address out of every send.

alter table newsletter_subscribers
  add column confirm_token uuid not null default gen_random_uuid(),
  add column confirmed_at timestamptz;

alter table newsletter_subscribers
  add constraint newsletter_subscribers_confirm_token_key unique (confirm_token);

create index newsletter_subscribers_confirm_token_idx
  on newsletter_subscribers (confirm_token);

-- The list every send draws from, and the only index that matters at send time.
create index newsletter_subscribers_mailable_idx
  on newsletter_subscribers (created_at)
  where is_active and confirmed_at is not null;

/*
 * The addresses already on the list when this migration runs.
 *
 * They were entered by hand through the form on the news page, which is the
 * consent this whole feature turns on, but they were taken before there was
 * any way to verify the mailbox. Grandfathering them is a judgement, not a
 * certainty: it trusts that each was typed by its owner.
 *
 * Check them on the announcement list page before the first send and delete
 * any you do not recognise. Everything added after this migration has to
 * confirm, and no path in the application sets `confirmed_at` except somebody
 * clicking the link in their own mailbox.
 */
update newsletter_subscribers
   set confirmed_at = created_at
 where confirmed_at is null;

comment on column newsletter_subscribers.confirm_token is
  'The credential in a confirmation link. Spent once, then confirmed_at is set.';

comment on column newsletter_subscribers.confirmed_at is
  'When the address proved itself. Null means never mailed, whatever is_active says.';

-- ---------------------------------------------------------------- sends

-- What was mailed, to how many, and when.
--
-- One row per send. It is the audit an editor needs before pressing the button
-- a second time, the guard against mailing the same announcement twice, and
-- the counter the free-tier daily allowance is measured against. Nothing else
-- in the schema records that email left the building.
create table announcement_sends (
  id uuid primary key default gen_random_uuid(),
  -- The announcement mailed. Kept nullable and set null on delete: removing an
  -- announcement from the site must not erase the record that it was sent.
  announcement_id uuid references announcements(id) on delete set null,
  -- Copied rather than joined, so the record still says what went out after
  -- the announcement it came from is edited or deleted.
  subject text not null,
  -- When it was handed to the mail provider, which is not when it was sent if
  -- it was scheduled. Null while a scheduled send is still pending.
  sent_at timestamptz,
  -- Set only when the editor chose a time. Null means it went straight out.
  scheduled_at timestamptz,
  -- How many addresses it was addressed to, counted at the moment of sending.
  recipient_count integer not null default 0,
  status text not null default 'pending',
  -- The provider's ids, one per recipient, so a delivery question can be
  -- traced without keeping the addresses here a second time.
  provider_ids text[] not null default '{}',
  -- Who pressed the button. Set null rather than cascade, so the record
  -- outlives the account.
  sent_by uuid references auth.users(id) on delete set null,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index announcement_sends_created_idx on announcement_sends (created_at desc);

-- Reads the daily allowance, and answers "has this one already gone out?".
create index announcement_sends_announcement_idx
  on announcement_sends (announcement_id)
  where status <> 'failed';

create trigger announcement_sends_set_updated_at before update on announcement_sends
  for each row execute function set_updated_at();

-- No policy, like submissions and the inboxes: reachable only through the
-- service-role key, which means src/lib/admin gates are the whole control.
alter table announcement_sends enable row level security;

comment on table announcement_sends is
  'One row per announcement mailed to the list. The audit, the double-send guard, and the quota counter.';

-- ---------------------------------------------------------------- permissions

-- Sending is the one action in the panel that cannot be undone: an email that
-- has left cannot be recalled, and the list is the journal's relationship with
-- its readers. The editor gets it because the editor runs the journal. Nobody
-- else does, including the content manager who writes the announcements.
insert into role_permissions (role, area, level) values
  ('administrator',   'announcement_sends', 'edit'),
  ('editor',          'announcement_sends', 'edit'),
  ('content_manager', 'announcement_sends', 'view'),
  ('reviewer',        'announcement_sends', 'none'),
  ('observer',        'announcement_sends', 'view')
on conflict (role, area) do nothing;
