-- One send per announcement, enforced where it cannot be raced.
--
-- `sendAnnouncement` asks whether an announcement has already gone out, and
-- then inserts a record saying it is going out now. Those are two statements
-- with a network round trip between them, so two editors pressing the button
-- at the same moment both read "not sent yet", both insert, and the list is
-- mailed twice. The window is small and the action is irreversible, which is
-- the worst combination to leave to chance.
--
-- 0010 indexed `announcement_id` but did not make it unique, so nothing stopped
-- the second row. This does. The application check stays, because it produces a
-- readable message; this is what makes the answer true rather than likely.

-- Existing duplicates would make the index creation fail, and any that exist
-- are exactly the bug this prevents, so surface them rather than silently
-- keeping the newest. Nothing is deleted here: which of a pair was the real
-- send is a judgement for whoever reads the mail provider's log.
do $$
declare
  duplicates integer;
begin
  select count(*) into duplicates
    from (
      select announcement_id
        from announcement_sends
       where status <> 'failed'
         and announcement_id is not null
       group by announcement_id
      having count(*) > 1
    ) as d;

  if duplicates > 0 then
    raise exception
      'announcement_sends already holds % announcement(s) recorded as sent more than once. Resolve those rows before applying this migration.',
      duplicates;
  end if;
end $$;

/*
 * Partial, on the same condition the application's own guard uses: a send that
 * reached nobody is marked 'failed' and may legitimately be retried, so those
 * rows are outside the constraint. Everything else, including 'partial' and the
 * 'pending' row written before a batch starts, holds the slot.
 *
 * `announcement_id` is nullable and set null when an announcement is deleted.
 * Postgres treats nulls as distinct in a unique index, so any number of records
 * whose announcement has since been deleted can coexist, which is what we want:
 * they are history, not a claim on anything.
 */
create unique index announcement_sends_one_per_announcement
  on announcement_sends (announcement_id)
  where status <> 'failed' and announcement_id is not null;

-- The plain index 0010 created is now redundant: the unique one above covers
-- the same column and the same predicate.
drop index if exists announcement_sends_announcement_idx;

comment on index announcement_sends_one_per_announcement is
  'Stops two simultaneous sends of the same announcement. See 0012.';
