import { AnnouncementBar } from '@/components/site/home/AnnouncementBar'
import { AnnouncementRows } from '@/components/site/home/AnnouncementRows'
import { ClosingCta } from '@/components/site/home/ClosingCta'
import { Hero } from '@/components/site/home/Hero'
import { HeroBand } from '@/components/site/home/HeroBand'
import { OurPosition } from '@/components/site/home/OurPosition'
import { ProcessSteps } from '@/components/site/home/ProcessSteps'
import { ValueColumns } from '@/components/site/home/ValueColumns'
import { WhatWePublish } from '@/components/site/home/WhatWePublish'
import {
  getAnnouncements,
  getConfig,
  getDisciplines,
  getProcessSteps,
  getTickerLines,
} from '@/lib/content'

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
      <Hero issueLabel={`Volume 1 · Issue 1 · Publishing ${config.expected}`} />
      <HeroBand imagePath={config.heroImagePath} />
      <AnnouncementBar lines={tickerLines} />
      <ValueColumns />
      <WhatWePublish disciplines={disciplines} />
      <ProcessSteps steps={steps} />
      <OurPosition imagePath={config.positionImagePath} />
      <AnnouncementRows announcements={announcements} />
      <ClosingCta deadline={config.deadline} />
    </>
  )
}
