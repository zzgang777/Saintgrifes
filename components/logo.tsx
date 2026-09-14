import Image from "next/image"

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Image
      src="/estilo-da-ilha-logo-3d.png"
      alt="Estilo da Ilha"
      width={120}
      height={120}
      priority
      className={`size-12 shrink-0 lg:size-14 ${className}`}
    />
  )
}
