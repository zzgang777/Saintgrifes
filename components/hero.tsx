import Image from "next/image"

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-foreground">
      <div className="relative aspect-[16/9] w-full lg:aspect-auto lg:min-h-[82vh]">
        <Image
          src="/banner-boas-vindas.png"
          alt="Coleção Estilo da Ilha"
          fill
          priority
          className="object-cover object-center lg:object-right"
          sizes="100vw"
        />
      </div>
    </section>
  )
}
