const app = document.getElementById("app");
const header = document.querySelector(".site-header");
const navToggle = document.querySelector(".nav-toggle");

const journal = {
  name: "International Collegiate Research Review",
  tagline:
    "An independent student journal for research across science, business, law, the humanities, and the social sciences.",
  issue: "Volume 1, Issue 1 in progress",
  year: "2026",
  currentIssue: [
    {
      slug: "machine-learning-for-early-crop-disease-detection",
      title: "Machine Learning for Early Crop Disease Detection",
      author: "Maya Rahman",
      university: "University of Oxford",
      abstract:
        "This article evaluates how lightweight computer vision models can identify early disease markers in crop imagery with practical accuracy for agricultural settings.",
      keywords: ["Machine Learning", "Agriculture", "Computer Vision"],
      doi: "10.0000/grir.2026.001",
      date: "July 22, 2026",
      citation:
        "Rahman, M. (2026). Machine learning for early crop disease detection. International Collegiate Research Review, 1(1), 1-24.",
      sections: [
        {
          title: "Abstract",
          body: "This paper argues that affordable computer vision tools can make early crop diagnostics more accessible for small growers and local cooperatives. The study focuses on deployment conditions, image quality, and model portability.",
        },
        {
          title: "Introduction",
          body: "Agricultural disease detection often reaches farmers too late to prevent yield loss. This article explores whether compact machine learning models can provide earlier warnings without requiring expensive hardware or centralized lab access.",
        },
        {
          title: "Argument",
          body: "The central argument is that model size, interpretability, and deployment simplicity matter as much as raw accuracy. A system that performs slightly less well in the lab may still be more valuable if it can run reliably in the field.",
        },
        {
          title: "Conclusion",
          body: "Practical agriculture tools should be judged by accessibility and adoption as well as benchmark performance. The study concludes that low-cost diagnostics can support earlier intervention and reduce crop loss.",
        },
      ],
      footnotes: [
        "1. On accessible machine learning deployment, see Howard, A. et al. (2017). MobileNets.",
        "2. For image-based crop diagnosis, see Ferentinos, K. P. (2018). Deep learning models for plant disease detection.",
      ],
      references: [
        "Ferentinos, K. P. (2018). Deep learning models for plant disease detection and diagnosis. Computers and Electronics in Agriculture, 145, 311-318.",
        "Howard, A. G., Zhu, M., Chen, B., et al. (2017). MobileNets: Efficient convolutional neural networks for mobile vision applications.",
        "Raschka, S. (2020). Model evaluation and selection in applied machine learning. Journal of Data Science, 18(4), 1-18.",
      ],
    },
    {
      slug: "consumer-behavior-and-pricing-strategy-in-small-retail",
      title: "Consumer Behavior and Pricing Strategy in Small Retail",
      author: "Daniel Okafor",
      university: "University of Toronto",
      abstract:
        "A field study of how local retailers adapt pricing, packaging, and promotion strategies when customer demand shifts across seasons.",
      keywords: ["Business", "Retail", "Consumer Behavior"],
      doi: "10.0000/grir.2026.002",
      date: "July 22, 2026",
      citation:
        "Okafor, D. (2026). Consumer behavior and pricing strategy in small retail. International Collegiate Research Review, 1(1), 25-41.",
      sections: [
        {
          title: "Abstract",
          body: "This paper studies how small retailers respond to changing consumer preferences through price adjustments, loyalty incentives, and local promotions.",
        },
        {
          title: "Method",
          body: "The study combines store observations, short customer surveys, and comparative analysis of three neighborhood businesses operating in different income brackets.",
        },
        {
          title: "Findings",
          body: "Stores with simpler pricing logic and visible value cues tend to retain customers more effectively than stores with frequent but opaque discounts.",
        },
        {
          title: "Conclusion",
          body: "The study concludes that price communication is as important as the absolute price point. Clear value framing helps small retailers remain competitive without constant margin erosion.",
        },
      ],
      footnotes: [
        "1. See Kotler, P. and Keller, K. (2016) for foundational marketing strategy principles.",
        "2. For consumer psychology and decision-making, see Kahneman, D. (2011). Thinking, Fast and Slow.",
      ],
      references: [
        "Kahneman, D. (2011). Thinking, fast and slow. Farrar, Straus and Giroux.",
        "Kotler, P., & Keller, K. L. (2016). Marketing management. Pearson.",
        "Nagle, T., & Müller, G. (2018). The strategy and tactics of pricing. Routledge.",
      ],
    },
    {
      slug: "designing-low-cost-water-filtration-for-rural-communities",
      title: "Designing Low-Cost Water Filtration for Rural Communities",
      author: "Elena Moretti",
      university: "Sciences Po",
      abstract:
        "This paper presents a prototype evaluation of an affordable filtration system designed for modular deployment in resource-limited settings.",
      keywords: ["Engineering", "Public Health", "Sustainability"],
      doi: "10.0000/grir.2026.003",
      date: "July 22, 2026",
      citation:
        "Moretti, E. (2026). Designing low-cost water filtration for rural communities. International Collegiate Research Review, 1(1), 42-58.",
      sections: [
        {
          title: "Abstract",
          body: "This paper evaluates whether a modular, low-cost filter can improve water quality in rural settings without requiring specialized maintenance.",
        },
        {
          title: "Analysis",
          body: "The analysis compares three filtration materials and measures output against cost, portability, and durability constraints relevant to field deployment.",
        },
        {
          title: "Conclusion",
          body: "The prototype suggests that effective public-health tools do not need to be expensive to be impactful. Design simplicity and local maintainability are decisive advantages.",
        },
      ],
      footnotes: [
        "1. For engineering design constraints in low-resource settings, see World Health Organization implementation guidance.",
      ],
      references: [
        "World Health Organization. (2022). Drinking-water quality and health.",
        "Smith, J., & Rao, P. (2021). Affordable water treatment systems in rural development. Journal of Environmental Engineering, 147(6), 1-12.",
      ],
    },
  ],
  news: [
    {
      title: "Call for Papers: Volume 1, Issue 1",
      date: "July 2026",
      body: "Issue 1 is in progress and calls are open across science, business, law, the humanities, and the social sciences. Deadline: September 30, 2026.",
      featured: true,
    },
  ],
  board: [
  ],
  archives: [
    {
      volume: "Volume 1",
      issue: "In progress",
      year: 2026,
      theme: "Issue content to be announced",
      summary:
        "Volume 1 is in progress and will be published after editorial review.",
      count: 0,
    },
  ],
};

const sections = {
  home: () => `
    <section class="page">
      <div class="hero fade-in">
        <div class="hero-grid">
          <div>
            <div class="eyebrow">Independent student scholarship</div>
            <h1>${journal.name}</h1>
            <p class="hero-subtitle">${journal.tagline}</p>
            <div class="hero-actions">
              <a class="btn btn-primary" href="#/current-issue">View Issue Status</a>
              <a class="btn btn-secondary" href="#/submit">Submit Manuscript</a>
            </div>
          </div>
          <aside class="hero-panel">
            <h2>Current Issue</h2>
            <div class="hero-metrics">
              <div class="metric-row">
                <strong>${journal.issue}</strong>
                <span>In progress and preparing for launch</span>
              </div>
              <div class="metric-row">
                <strong>Calls open</strong>
                <span>We are currently accepting submissions for Volume 1 Issue 1</span>
              </div>
              <div class="metric-row">
                <strong>Multi-disciplinary</strong>
                <span>Science, business, law, humanities, and more</span>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <section class="section fade-in">
        <div class="section-header">
          <div>
            <h2 class="section-heading">Calls Open</h2>
            <p class="section-copy">Issue 1 is in progress. We are currently accepting submissions across all academic disciplines.</p>
          </div>
          <a class="mini-link" href="#/submit">Submit now</a>
        </div>
        <div class="card-grid">
          <article class="info-card" style="grid-column: span 12;">
            <h3>Issue 1 in progress</h3>
            <p>We are building Volume 1, Issue 1 now. Calls are open for research in science, business, engineering, law, humanities, and the social sciences.</p>
            <div class="tag-row">
              <span class="tag-pill">Call open</span>
              <span class="tag-pill">Issue 1 in progress</span>
              <span class="tag-pill">Multidisciplinary</span>
            </div>
          </article>
        </div>
      </section>

      <section class="section fade-in">
        <div class="section-header">
          <div>
            <h2 class="section-heading">Current Issue</h2>
            <p class="section-copy">${journal.issue}. Calls are open and content is not yet published.</p>
          </div>
          <a class="mini-link" href="#/current-issue">View issue layout</a>
        </div>
        <div class="issue-hero">
          <div>
            <div class="eyebrow">Issue one</div>
            <h2 class="section-heading">${journal.issue}</h2>
            <p>Issue 1 is currently in progress. We are accepting submissions now and will publish the issue once editorial review is complete.</p>
          </div>
          <div class="hero-panel">
            <h2>Call status</h2>
            <div class="hero-metrics">
              <div class="metric-row">
                <strong>Open</strong>
                <span>Submission window is open</span>
              </div>
              <div class="metric-row">
                <strong>In progress</strong>
                <span>Issue 1 is not yet published</span>
              </div>
              <div class="metric-row">
                <strong>All fields</strong>
                <span>Science, business, law, humanities, and more</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="section fade-in">
        <div class="section-header">
          <div>
            <h2 class="section-heading">Why Publish With Us</h2>
            <p class="section-copy">A publication model shaped for serious student scholarship and professional presentation.</p>
          </div>
        </div>
        <div class="card-grid">
          ${[
            ["Peer Reviewed", "Every manuscript receives substantive assessment through a double-blind editorial workflow."],
            ["International Editorial Board", "A geographically diverse board expands disciplinary perspective and review quality."],
            ["Open Access", "Published content is freely accessible to students, researchers, and practitioners worldwide."],
            ["Student Focused", "Built to elevate undergraduate and graduate work with a rigorous but supportive process."],
            ["DOI Ready", "Prepared for formal citation, digital indexing, and durable article discovery."],
            ["Global Reach", "International authorship and readership help connect scholarship across borders."],
          ]
            .map(
              ([title, body]) => `
                <article class="info-card">
                  <h3>${title}</h3>
                  <p>${body}</p>
                </article>
              `,
            )
            .join("")}
        </div>
      </section>

      <section class="section fade-in">
        <div class="section-header">
          <div>
            <h2 class="section-heading">Latest News</h2>
            <p class="section-copy">Announcements, calls for papers, and editorial updates for contributors and readers.</p>
          </div>
          <a class="mini-link" href="#/news">View newsroom</a>
        </div>
        <div class="card-grid">
          ${journal.news
            .map(
              (item, index) => `
                <article class="news-card ${item.featured ? "featured" : ""}">
                  <div class="news-body">
                    <time>${item.date}</time>
                    <h3>${item.title}</h3>
                    <p>${item.body}</p>
                    ${index === 0 ? '<div class="news-actions"><a class="btn btn-ghost" href="#/submit">Submit now</a></div>' : ""}
                  </div>
                </article>
              `,
            )
            .join("")}
        </div>
      </section>

      <section class="section fade-in">
        <div class="section-header">
          <div>
            <h2 class="section-heading">Statistics</h2>
            <p class="section-copy">Statistics will be announced soon once the first issue is published.</p>
          </div>
        </div>
        <article class="info-card" style="grid-column: span 12;">
          <h3>To be announced soon</h3>
          <p>Article counts, countries represented, universities, and reviewers will be shared after Issue 1 goes live.</p>
        </article>
      </section>
    </section>
  `,

  about: () => `
    <section class="page">
      <div class="page-card fade-in">
        <div class="eyebrow">About</div>
        <h1 class="page-title">Mission, vision, and editorial standards</h1>
        <p class="section-copy">International Collegiate Research Review publishes high-quality undergraduate and graduate research with a polished academic presentation and careful peer review.</p>
      </div>
      <div class="grid-two">
        ${[
          ["Mission", "To provide an inclusive and rigorous platform for student scholarship across science, business, engineering, the humanities, and the social sciences."],
          ["Vision", "To become a trusted student journal recognized for editorial excellence, accessible scholarship, and thoughtful multidisciplinary engagement."],
          ["Who We Are", "A student-run journal supported by an editorial board, reviewer network, and faculty advisors committed to academic integrity."],
          ["Our Standards", "Submissions are evaluated for originality, evidence, structure, clarity, citation accuracy, and contribution to the field."],
        ]
          .map(
            ([title, body]) => `
              <article class="guide-card fade-in">
                <div class="guide-body">
                  <h3>${title}</h3>
                  <p>${body}</p>
                </div>
              </article>
            `,
          )
          .join("")}
      </div>
      <section class="section fade-in">
        <div class="section-header">
          <div>
            <h2 class="section-heading">Who May Submit</h2>
            <p class="section-copy">We welcome work from undergraduates, graduate students, and recent graduates with a demonstrated academic contribution in any field.</p>
          </div>
        </div>
        <div class="card-grid">
          ${[
            "Research articles from students in relevant disciplines",
            "Policy briefs with clear analytical recommendations",
            "Comparative and case-based studies",
            "Book reviews, literature essays, and lab reports",
          ]
            .map(
              (item) => `
                <article class="info-card">
                  <p>${item}</p>
                </article>
              `,
            )
            .join("")}
        </div>
      </section>
      <section class="section fade-in">
        <div class="section-header">
          <div>
            <h2 class="section-heading">Timeline of Growth</h2>
            <p class="section-copy">A concise look at the journal’s development from concept to publication.</p>
          </div>
        </div>
        <div class="timeline">
          ${[
            ["2025", "Journal concept formed by a student editorial collective seeking a more rigorous publication space."],
            ["Early 2026", "Brand, workflow, reviewer guidelines, and ethics framework developed."],
            ["Spring 2026", "Editorial board assembled and reviewer training launched."],
            ["July 2026", "Volume 1 in progress."],
          ]
            .map(
              ([time, body]) => `
                <article class="timeline-card fade-in">
                  <time>${time}</time>
                  <h3>${time}</h3>
                  <p>${body}</p>
                </article>
              `,
            )
            .join("")}
        </div>
      </section>
    </section>
  `,

  currentIssue: () => `
    <section class="page">
      <div class="issue-hero fade-in">
        <div>
          <div class="eyebrow">Current Issue</div>
          <h1 class="page-title">${journal.issue}</h1>
          <p class="section-copy" style="color: rgba(255,255,255,0.84); max-width: 58ch;">Issue 1 is in progress. Calls are open and articles will be added after editorial review.</p>
        </div>
        <div class="hero-panel">
          <h2>Issue status</h2>
          <div class="hero-metrics">
            <div class="metric-row">
              <strong>Open</strong>
              <span>Submissions are being accepted now</span>
            </div>
            <div class="metric-row">
              <strong>In progress</strong>
              <span>Issue 1 has not been published yet</span>
            </div>
            <div class="metric-row">
              <strong>Calls open</strong>
              <span>All disciplines welcome</span>
            </div>
          </div>
        </div>
      </div>
      <div class="card-grid">
        <article class="info-card" style="grid-column: span 12;">
          <h3>Calls are open</h3>
          <p>We are preparing Issue 1 now and welcoming submissions from students and early-career researchers across all disciplines.</p>
          <div class="tag-row">
            <span class="tag-pill">Issue 1 in progress</span>
            <span class="tag-pill">Open call</span>
            <span class="tag-pill">All fields welcome</span>
          </div>
        </article>
      </div>
    </section>
  `,

  article: () => `
    <section class="page">
      <div class="page-card fade-in">
        <div class="badge">Issue in progress</div>
        <h1 class="page-title">Articles will appear here soon</h1>
        <p class="section-copy">Issue 1 is still in progress. The journal is currently accepting submissions, and articles will appear after editorial review is complete.</p>
        <div class="page-actions">
          <a class="btn btn-primary" href="#/submit">Submit Manuscript</a>
          <a class="btn btn-secondary" href="#/current-issue">Back to Issue Status</a>
        </div>
      </div>
    </section>
  `,

  archives: () => `
    <section class="page">
          <div class="page-card fade-in">
        <div class="eyebrow">Archives</div>
        <h1 class="page-title">Volume 1</h1>
        <p class="section-copy">Only one volume is available right now and it is still in progress.</p>
        <div class="archive-toolbar" style="margin-top: 1rem;">
          <select id="archive-volume" class="select">
            <option value="Volume 1">Volume 1</option>
          </select>
        </div>
      </div>
      <div id="archive-list" class="archive-list"></div>
    </section>
  `,

  submit: () => `
    <section class="page">
      <div class="page-card fade-in">
        <div class="eyebrow">Submission Portal</div>
        <h1 class="page-title">Submit your manuscript</h1>
        <p class="section-copy">A professional submission experience with clear editorial guidance for student researchers in any discipline.</p>
      </div>
      <div class="submit-grid">
        <article class="form-card fade-in">
          <div class="form-body">
            <h3>Submission Guidelines</h3>
            <p>Manuscripts should be original, polished, and written in academic prose. We encourage careful citation, focused argumentation, and a clear contribution to the literature or field of study.</p>
            <div class="guide-list" style="margin-top: 1rem;">
              <div class="guide-step"><strong>1</strong><div><h3 style="margin:0 0 0.25rem;">Word count</h3><p>1000-8000 words for research articles, excluding references.</p></div></div>
              <div class="guide-step"><strong>2</strong><div><h3 style="margin:0 0 0.25rem;">Accepted categories</h3><p>Research Articles, Policy Briefs, Book Reviews, Case Studies, Lab Reports, Business Analyses.</p></div></div>
              <div class="guide-step"><strong>3</strong><div><h3 style="margin:0 0 0.25rem;">Formatting</h3><p>Use consistent headings, APA, MLA, or Chicago style references, and numbered footnotes where required.</p></div></div>
              <div class="guide-step"><strong>4</strong><div><h3 style="margin:0 0 0.25rem;">Review</h3><p>All manuscripts undergo editorial screening and double-blind peer review.</p></div></div>
            </div>
          </div>
        </article>
        <article class="form-card fade-in">
          <div class="form-body">
            <h3>Submission Form</h3>
            <form id="submission-form">
              <div class="form-grid" style="margin-top: 1rem;">
                <div class="field">
                  <label for="name">Full Name</label>
                  <input class="input" id="name" name="name" required />
                </div>
                <div class="field">
                  <label for="email">Email</label>
                  <input class="input" id="email" name="email" type="email" required />
                </div>
                <div class="field">
                  <label for="institution">Institution</label>
                  <input class="input" id="institution" name="institution" required />
                </div>
                <div class="field">
                  <label for="category">Category</label>
                  <select class="select" id="category" name="category" required>
                    <option>Research Article</option>
                    <option>Policy Brief</option>
                    <option>Book Review</option>
                    <option>Case Study</option>
                  </select>
                </div>
                <div class="field full">
                  <label for="title">Manuscript Title</label>
                  <input class="input" id="title" name="title" required />
                </div>
                <div class="field full">
                  <label for="summary">Short Summary</label>
                  <textarea class="textarea" id="summary" name="summary" placeholder="Describe your article, its argument, and its contribution." required></textarea>
                </div>
              </div>
              <div class="form-actions">
                <button class="btn btn-primary" type="submit">Submit Manuscript</button>
                <button class="btn btn-ghost" type="reset">Clear Form</button>
              </div>
            </form>
          </div>
        </article>
      </div>
      <section class="section fade-in">
        <div class="section-header">
          <div>
            <h2 class="section-heading">Ethics and Review Process</h2>
            <p class="section-copy">The expectations below are embedded here so contributors can check standards before uploading a manuscript, regardless of discipline.</p>
          </div>
        </div>
        <div class="grid-two">
          ${[
            ["Ethics", "Submitted work must be original, unpublished, and free of plagiarism. Authors should disclose conflicts of interest, and reviewers must preserve confidentiality throughout the process."],
            ["Review Process", "Every suitable submission receives editorial screening before double-blind review. Authors then receive structured feedback, revision guidance, and a final editorial decision."],
          ]
            .map(
              ([title, body]) => `
                <article class="guide-card fade-in">
                  <div class="guide-body">
                    <h3>${title}</h3>
                    <p>${body}</p>
                  </div>
                </article>
              `,
            )
            .join("")}
        </div>
      </section>
    </section>
  `,

  editorialBoard: () => `
    <section class="page">
      <div class="page-card fade-in">
        <div class="eyebrow">Editorial Board</div>
        <h1 class="page-title">To be announced</h1>
        <p class="section-copy">The editorial board will be announced soon.</p>
      </div>
      <article class="info-card fade-in">
        <h3>Editorial board</h3>
        <p>To be announced soon.</p>
      </article>
    </section>
  `,

  reviewProcess: () => `
    <section class="page">
      <div class="page-card fade-in">
        <div class="eyebrow">Review Process</div>
        <h1 class="page-title">A disciplined, transparent editorial workflow</h1>
        <p class="section-copy">We screen for fit, then send promising submissions through a double-blind review cycle focused on content, argument, and evidence.</p>
      </div>
      <div class="grid-two">
        ${[
          ["Editorial screening", "The editorial team checks topic fit, originality, and basic formatting before review."],
          ["Reviewer assignment", "Manuscripts are matched with subject-specialist reviewers using a double-blind process."],
          ["Revision cycle", "Authors receive constructive feedback and a clear revision timeline."],
          ["Final decision", "Accepted manuscripts proceed to copyediting, proofing, and publication."],
        ]
          .map(
            ([title, body]) => `
              <article class="guide-card fade-in">
                <div class="guide-body">
                  <h3>${title}</h3>
                  <p>${body}</p>
                </div>
              </article>
            `,
          )
          .join("")}
      </div>
    </section>
  `,

  ethics: () => `
    <section class="page">
      <div class="page-card fade-in">
        <div class="eyebrow">Ethics</div>
        <h1 class="page-title">Publication ethics and integrity</h1>
        <p class="section-copy">The journal follows a clear ethics policy to safeguard originality, fairness, and scholarly transparency.</p>
      </div>
      <div class="grid-two">
        ${[
          ["Originality", "Submitted work must be the author's own and not under consideration elsewhere."],
          ["Plagiarism", "Any suspected plagiarism is reviewed carefully and may result in immediate rejection."],
          ["Conflicts of interest", "Authors and reviewers should disclose any relevant academic or professional conflicts."],
          ["Reviewer conduct", "Reviews must be constructive, confidential, and focused on scholarly merit."],
        ]
          .map(
            ([title, body]) => `
              <article class="guide-card fade-in">
                <div class="guide-body">
                  <h3>${title}</h3>
                  <p>${body}</p>
                </div>
              </article>
            `,
          )
          .join("")}
      </div>
    </section>
  `,

  news: () => `
    <section class="page">
      <div class="page-card fade-in">
        <div class="eyebrow">News</div>
        <h1 class="page-title">Announcements, calls open, and events</h1>
        <p class="section-copy">Updates from the editorial team for authors, readers, and reviewers.</p>
      </div>
      <div class="card-grid">
        ${journal.news
          .map(
            (item) => `
              <article class="news-card ${item.featured ? "featured" : ""} fade-in">
                <div class="news-body">
                  <time>${item.date}</time>
                  <h3>${item.title}</h3>
                  <p>${item.body}</p>
                </div>
              </article>
            `,
          )
          .join("")}
      </div>
    </section>
  `,

  contact: () => `
    <section class="page">
      <div class="page-card fade-in">
        <div class="eyebrow">Contact</div>
        <h1 class="page-title">Get in touch</h1>
        <p class="section-copy">Reach the editorial team for submissions, reviewer questions, partnerships, or general inquiries.</p>
      </div>
      <div class="contact-grid">
        <article class="contact-panel page-card fade-in">
          <h3>Editorial Contact</h3>
          <p>Email: editorial@grir-journal.org</p>
          <p>Submissions: submissions@grir-journal.org</p>
          <p>Media and partnerships: outreach@grir-journal.org</p>
          <div class="page-actions">
            <a class="btn btn-primary" href="mailto:editorial@grir-journal.org">Email Editorial Team</a>
          </div>
        </article>
        <article class="contact-panel page-card fade-in">
          <h3>What to include</h3>
          <p>When writing, please include your manuscript title, category, institution, and a brief note on fit.</p>
          <div class="citation" style="margin-top: 1rem;">
            We respond to messages during active editorial windows and aim to acknowledge submissions promptly.
          </div>
        </article>
      </div>
    </section>
  `,
};

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function estimateReadingTime(article) {
  const words = [
    article.title,
    article.abstract,
    ...article.sections.map((section) => section.body),
    ...article.references,
  ]
    .join(" ")
    .split(/\s+/).length;

  return `${Math.max(4, Math.round(words / 170))} min`;
}

function getRoute() {
  const hash = window.location.hash.replace(/^#\/?/, "");
  if (!hash) return { page: "home" };
  const [page, ...rest] = hash.split("/");
  return {
    page,
    slug: rest.join("/"),
  };
}

function resolvePageKey(page) {
  const routeMap = {
    home: "home",
    about: "about",
    "current-issue": "currentIssue",
    archives: "archives",
    submit: "submit",
    "editorial-board": "editorialBoard",
    "review-process": "reviewProcess",
    ethics: "ethics",
    news: "news",
    contact: "contact",
  };

  return routeMap[page] ?? "home";
}

function renderArchiveList(query = "") {
  const list = document.getElementById("archive-list");
  if (!list) return;

  const volume = document.getElementById("archive-volume")?.value ?? "";
  const year = document.getElementById("archive-year")?.value ?? "";
  const issue = document.getElementById("archive-issue")?.value ?? "";
  const themeFilter = document.querySelector(".filter-btn.active")?.dataset.themeFilter ?? "";

  const normalizedQuery = query.trim().toLowerCase();

  const results = journal.archives.filter((item) => {
    const haystack = `${item.volume} ${item.issue} ${item.year} ${item.theme} ${item.summary}`.toLowerCase();
    const queryMatch = !normalizedQuery || haystack.includes(normalizedQuery);
    const volumeMatch = !volume || item.volume === volume;
    const yearMatch = !year || String(item.year) === year;
    const issueMatch = !issue || item.issue === issue;
    const themeMatch = !themeFilter || item.theme.toLowerCase().includes(themeFilter.toLowerCase());
    return queryMatch && volumeMatch && yearMatch && issueMatch && themeMatch;
  });

  list.innerHTML = results.length
    ? results
        .map(
          (item) => `
            <article class="archive-item fade-in">
              <div class="archive-top">
                <div>
                  <div class="badge">${item.volume}</div>
                  <h3>${item.theme}</h3>
                  <p>${item.summary}</p>
                </div>
                <div class="meta-pill secondary">${item.count} articles</div>
              </div>
              <div class="meta-row">
                <span class="meta-pill">${item.issue}</span>
                <span class="meta-pill secondary">${item.year}</span>
              </div>
            </article>
          `,
        )
        .join("")
    : `<div class="empty-state">No archive issues match the current filters.</div>`;

  observeFadeIns();
}

function renderPage() {
  const { page, slug } = getRoute();
  const routePage = resolvePageKey(page);
  const content = page === "article" ? sections.article(slug) : sections[routePage]();
  app.innerHTML = content;
  highlightActiveNav(page);
  bindPageEvents(page);
  observeFadeIns();
  animateCounters();
  header.dataset.open = "false";
  navToggle.setAttribute("aria-expanded", "false");
}

function highlightActiveNav(page) {
  const links = [...document.querySelectorAll(".site-nav a")];
  links.forEach((link) => {
    const href = link.getAttribute("href");
    const isActive =
      (page === "home" && href === "#/") ||
      (page === "article" && href === "#/current-issue") ||
      href === `#/${page}`;
    if (isActive) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
}

function bindPageEvents(page) {
  const copyButtons = [...document.querySelectorAll("[data-copy-citation]")];
  copyButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const slug = button.getAttribute("data-copy-citation");
      const article = journal.currentIssue.find((entry) => entry.slug === slug);
      if (!article) return;
      try {
        await navigator.clipboard.writeText(article.citation);
        button.textContent = "Copied";
        setTimeout(() => {
          button.textContent = "Copy Citation";
        }, 1400);
      } catch {
        button.textContent = "Copy unavailable";
      }
    });
  });

  const form = document.getElementById("submission-form");
  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      const original = submitBtn.textContent;
      submitBtn.textContent = "Submitted";
      submitBtn.disabled = true;
      form.reset();
      setTimeout(() => {
        submitBtn.textContent = original;
        submitBtn.disabled = false;
      }, 2200);
    });
  }

  if (page === "archives") {
    const search = document.getElementById("archive-search");
    const volume = document.getElementById("archive-volume");
    const year = document.getElementById("archive-year");
    const issue = document.getElementById("archive-issue");
    const themeButtons = [...document.querySelectorAll("[data-theme-filter]")];

    const update = () => renderArchiveList(search?.value ?? "");

    search?.addEventListener("input", update);
    volume?.addEventListener("change", update);
    year?.addEventListener("change", update);
    issue?.addEventListener("change", update);
    themeButtons.forEach((button) => {
      button.addEventListener("click", () => {
        themeButtons.forEach((other) => other.classList.remove("active"));
        button.classList.add("active");
        update();
      });
    });
    renderArchiveList("");
  }

  const scrollButtons = [...document.querySelectorAll("[data-scroll-target]")];
  scrollButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const target = document.getElementById(button.dataset.scrollTarget);
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function observeFadeIns() {
  const items = [...document.querySelectorAll(".fade-in:not(.in-view)")];
  if (!items.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 },
  );

  items.forEach((item) => observer.observe(item));
}

function animateCounters() {
  const counters = [...document.querySelectorAll("[data-count]")];
  if (!counters.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = Number(el.dataset.count || "0");
        let current = 0;
        const step = Math.max(1, Math.ceil(target / 40));
        const tick = () => {
          current = Math.min(target, current + step);
          el.querySelector("strong").textContent = String(current);
          if (current < target) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        observer.unobserve(el);
      });
    },
    { threshold: 0.4 },
  );

  counters.forEach((counter) => observer.observe(counter));
}

function bindGlobalEvents() {
  navToggle.addEventListener("click", () => {
    const open = header.dataset.open === "true";
    header.dataset.open = String(!open);
    navToggle.setAttribute("aria-expanded", String(!open));
  });

  document.addEventListener("click", (event) => {
    if (!header.contains(event.target)) {
      header.dataset.open = "false";
      navToggle.setAttribute("aria-expanded", "false");
    }
  });

  window.addEventListener("hashchange", renderPage);
}

bindGlobalEvents();
if (!window.location.hash) {
  window.location.hash = "#/";
}
renderPage();
