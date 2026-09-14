export function ProductBadge({ label, size = "md" }: { label: "NOVO" | "OFERTA"; size?: "sm" | "md" }) {
  const dims = size === "sm" ? "size-12 text-[9px]" : "size-14 text-[10px]"
  return (
    <span
      className={`absolute left-3 top-3 flex ${dims} -rotate-[10deg] items-center justify-center rounded-full border-2 border-dashed text-center font-bold uppercase leading-none ${
        label === "OFERTA"
          ? "border-primary-foreground/50 bg-primary text-primary-foreground"
          : "border-background/40 bg-foreground text-background"
      }`}
    >
      {label}
    </span>
  )
}
