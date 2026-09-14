import Image from "next/image"

export function AboutSection() {
  return (
    <section className="relative overflow-hidden bg-foreground">
      <div className="relative aspect-[16/9] w-full lg:aspect-[21/9]">
        <Image
          src="/banner-camiseta-zara.png"
          alt="Camiseta Zara - Estilo da Ilha"
          fill
          className="object-cover"
          sizes="100vw"
        />
      </div>
    </section>
  )
}
