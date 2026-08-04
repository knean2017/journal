-- The four inbox badges, in one round trip instead of four.
--
-- Every admin page draws the navigation, and the navigation carries a count per
-- inbox. Those were four separate head-only queries. They already ran in
-- parallel, so they cost one round trip in theory; measured against this
-- project they cost roughly twice one, because four concurrent PostgREST
-- requests do not overlap as cleanly as four promises suggest. 338ms for the
-- four, against 175ms for a single query.
--
-- Postgres counts all four in one statement faster than the network carries one
-- request, so this moves the work to the side of the wire where it is cheap.
--
-- `stable` rather than `volatile`: it only reads, which lets the planner do the
-- obvious things with it.

create or replace function admin_inbox_counts()
returns json
language sql
stable
set search_path = public
as $$
  select json_build_object(
    'submissions', (select count(*) from submissions            where status = 'new'),
    'reviewers',   (select count(*) from reviewer_applications  where status = 'new'),
    'editors',     (select count(*) from editor_applications    where status = 'new'),
    'messages',    (select count(*) from contact_messages       where status = 'new')
  );
$$;

/*
 * Postgres grants EXECUTE on a new function to PUBLIC by default, which here
 * would hand anyone holding the anon key a running tally of how much work is
 * arriving at the journal. Revoked, then granted to the one role that already
 * reaches these tables.
 *
 * The function is security INVOKER, deliberately. Were it definer it would read
 * the four tables with the owner's rights whatever the caller held, and this
 * revoke would be the only thing standing in the way. As invoker, a caller who
 * somehow reached it still meets row level security on all four tables, none of
 * which has a policy: they would get four zeroes rather than the real numbers.
 */
revoke all on function admin_inbox_counts() from public;
revoke all on function admin_inbox_counts() from anon;
revoke all on function admin_inbox_counts() from authenticated;
grant execute on function admin_inbox_counts() to service_role;

comment on function admin_inbox_counts is
  'The four navigation badge counts in one call. Service role only; see 0011.';
