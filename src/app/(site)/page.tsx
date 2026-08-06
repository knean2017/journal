import { AnnouncementBar } from '@/components/site/home/AnnouncementBar'
import { AnnouncementRows } from '@/components/site/home/AnnouncementRows'
import { ClosingCta } from '@/components/site/home/ClosingCta'
import { Hero } from '@/components/site/home/Hero'
import { ProcessSteps } from '@/components/site/home/ProcessSteps'
import { ValueColumns } from '@/components/site/home/ValueColumns'
import { WhatWePublish } from '@/components/site/home/WhatWePublish'
import { JsonLd } from '@/components/seo/JsonLd'
import {
  getAnnouncements,
  getConfig,
  getDisciplines,
  getProcessSteps,
  getTickerLines,
} from '@/lib/content'
import { websiteSchema } from '@/lib/seo'

export default async function HomePage() {
  const [config, disciplines, tickerLines, steps, announcements] = await Promise.all([
    getConfig(),
    getDisciplines(),
    getTickerLines(),
    getProcessSteps(),
    getAnnouncements(),
  ])

  return (
    <>
      {/*
       * Here rather than in the layout: Google reads one site name per host,
       * from the record at the root. The nav's wordmark is an image and the
       * hero's h1 is a line of copy, so without this the homepage never says
       * its own name in text and the search result fell back to the domain.
       */}
      <JsonLd data={websiteSchema()} />
      <Hero issueLabel={`Volume 1 · Issue 1 · ${config.expected}`} />
      <AnnouncementBar lines={tickerLines} />
      <ValueColumns />
      <WhatWePublish disciplines={disciplines} />
      <ProcessSteps steps={steps} />
      <AnnouncementRows announcements={announcements} />
      <ClosingCta deadline={config.deadline} />
    </>
  )
}
