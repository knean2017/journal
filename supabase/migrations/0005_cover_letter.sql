-- The cover letter that travels with a manuscript.
--
-- The site has always told authors to send one: process step 1 says "Upload an
-- anonymised manuscript and a short cover letter", and the checklist asks for
-- funding, supervision and generative tools to be declared in it. The form
-- only ever collected the manuscript, so that letter had nowhere to land.
--
-- Nullable, unlike what the form now enforces. Every row written before this
-- migration has no cover letter and never will, and a not-null column would
-- have to invent a value for them. The admin shows "not supplied" for those.
alter table submissions add column cover_letter_path text;

comment on column submissions.cover_letter_path is
  'Object key in the private manuscripts bucket. Null for submissions taken before the cover letter was collected.';
