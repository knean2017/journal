-- The public site shows the first issue's table of contents before that issue
-- is published, with each entry carrying its own status label ("Under review").
-- 0001 let anonymous readers see only `status = 'published'`, which hid every
-- article the site is currently built to display.
--
-- Widen the read to everything that is not a draft. `draft` stays the editor's
-- private workspace; `under_review` and `published` are public.

drop policy "public read published" on articles;

create policy "public read not draft" on articles
  for select to anon, authenticated using (status <> 'draft');

drop policy "public read for published articles" on article_authors;

-- Join rows follow the article they belong to.
create policy "public read for visible articles" on article_authors
  for select to anon, authenticated using (
    exists (
      select 1 from articles a
      where a.id = article_authors.article_id and a.status <> 'draft'
    )
  );
