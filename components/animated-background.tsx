export function AnimatedBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      <div className="animate-drift-a absolute -left-32 -top-32 size-[420px] rounded-full bg-primary/10 blur-3xl sm:size-[520px]" />
      <div className="animate-drift-b absolute -right-32 top-1/3 size-[480px] rounded-full bg-sunset/15 blur-3xl sm:size-[600px]" />
      <div className="animate-drift-c absolute -bottom-40 left-1/4 size-[420px] rounded-full bg-primary/10 blur-3xl sm:size-[520px]" />
    </div>
  )
}
