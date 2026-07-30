/**
 * A block of schema.org markup for the page.
 *
 * The `<` escape is not decoration. JSON is embedded in HTML here, so a
 * `</script>` sequence anywhere inside a title or an abstract would end the
 * tag early and put the rest of the record into the document as markup.
 * Editors type article titles, so that string is not under our control.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  )
}
