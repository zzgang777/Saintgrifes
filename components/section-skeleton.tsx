export function SectionSkeleton({ tiles = 4 }: { tiles?: number }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 lg:py-24" aria-hidden>
      <div className="h-10 w-64 animate-pulse rounded-sm bg-secondary" />
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: tiles }).map((_, i) => (
          <div key={i} className="aspect-[4/5] animate-pulse rounded-md bg-secondary" />
        ))}
      </div>
    </section>
  )
}
