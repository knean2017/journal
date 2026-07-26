export function PreviewBanner({ children }: { children: React.ReactNode }) {
  return (
    <section className="max-w-[1180px] mx-auto px-[clamp(18px,5vw,40px)] pt-6">
      <div
        className="bg-cream-tint px-[18px] py-[14px] text-[13.5px] leading-[1.7] text-body"
        style={{ borderLeft: '3px solid #C0A265' }}
      >
        <strong className="text-maroon">Design preview.</strong> {children}
      </div>
    </section>
  )
}
