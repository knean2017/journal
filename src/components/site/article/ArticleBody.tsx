import { ImageSlot } from '@/components/ui/ImageSlot'

/**
 * Placeholder body prose. Plan 2 replaces this with a TipTap renderer reading
 * `article.body`, once editors can author articles in the admin panel.
 */
const SECTIONS = [
  {
    id: 'introduction',
    heading: '1. Introduction',
    paragraphs: [
      "Body text is set in the journal's primary serif at a comfortable measure of roughly seventy characters, so that long passages of argument remain readable on screen and in print. Paragraphs are separated by space rather than indentation.",
      "Citations appear in the journal's house style with a numbered reference list at the end of the article. Figures and tables are numbered in sequence and captioned below.",
    ],
    figure: true,
  },
  {
    id: 'method',
    heading: '2. Method',
    paragraphs: [
      'The method section describes the design, participants or materials, procedure, and analysis in enough detail for another researcher to repeat the study.',
    ],
    figure: false,
  },
  {
    id: 'results',
    heading: '3. Results',
    paragraphs: [
      'Results are reported without interpretation, with effect sizes and uncertainty stated alongside any test statistics.',
    ],
    figure: false,
  },
  {
    id: 'discussion',
    heading: '4. Discussion',
    paragraphs: [
      'The discussion returns to the question set out in the introduction, states what the study can and cannot support, and names its limitations plainly.',
    ],
    figure: false,
  },
]

export function ArticleBody() {
  return (
    <>
      {SECTIONS.map((section) => (
        <div key={section.id}>
          <h2 id={section.id} className="mt-[38px] mb-0 text-[22px] font-bold text-maroon">
            {section.heading}
          </h2>
          {section.paragraphs.map((paragraph, i) => (
            <p
              key={paragraph.slice(0, 24)}
              className="mb-0 text-[16px] leading-[1.9] text-ink-soft"
              style={{ marginTop: i === 0 ? 12 : 16, textIndent: 0 }}
            >
              {paragraph}
            </p>
          ))}

          {section.figure ? (
            <div className="mt-[30px]">
              <div className="h-[300px] border border-rule bg-cream">
                <ImageSlot
                  src={null}
                  label="Figure 1"
                  ratio="16/9"
                  sizes="(max-width: 760px) 100vw, 700px"
                  className="h-full w-full border-0"
                />
              </div>
              <p className="mt-[10px] mb-0 font-sans text-[13px] leading-[1.7] text-body-muted">
                <strong className="text-ink">Figure 1.</strong> Caption describing what the figure
                shows and where the data came from.
              </p>
            </div>
          ) : null}
        </div>
      ))}

      <h2 id="references" className="mt-[38px] mb-0 text-[22px] font-bold text-maroon">
        References
      </h2>
      <ol className="mt-[14px] mb-0 pl-[22px] text-[14.5px] leading-[1.85] text-body">
        <li className="mb-2">
          Author, A. (Year). Title of the work. <em>Journal Name</em>, volume(issue), pages.
        </li>
        <li className="mb-2">
          Author, B., &amp; Author, C. (Year). Title of the work. <em>Journal Name</em>,
          volume(issue), pages.
        </li>
      </ol>
    </>
  )
}
