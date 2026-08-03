-- A third state for an editorial role: someone holds it.
--
-- The table had two, `recruiting` and `pending`, and neither describes a filled
-- post. An editor who appointed somebody could only set the role to
-- "Appointment pending", which tells a visitor the opposite of the truth, and
-- there was nowhere to record the name.
--
-- The enum value is added here but used nowhere in this migration. Postgres
-- allows ALTER TYPE ... ADD VALUE inside a transaction, but the value cannot be
-- referenced until that transaction commits, so any statement setting a row to
-- 'appointed' would fail. Appointments are made from the admin panel.
alter type editorial_role_status add value if not exists 'appointed';

-- Nullable, and null for every existing row, which is correct: none of them is
-- appointed. Only read when the status is 'appointed', so a name left behind on
-- a role that goes back to recruiting is never shown.
alter table editorial_roles add column holder_name text;

comment on column editorial_roles.holder_name is
  'Who holds the post. Shown on the team page only when status is appointed. Null while the role is recruiting or pending.';
