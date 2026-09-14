import Image from "next/image"

export function ExclusiveBanner() {
  return (
    <section className="relative overflow-hidden bg-foreground">
      <a href="#mais-desejados" className="relative block aspect-[16/9] w-full">
        <Image
          src="/conjutos.png"
          alt="Os melhores conjuntos exclusivos - Estilo da Ilha"
          fill
          className="object-cover"
          sizes="100vw"
        />
      </a>
    </section>
  )
}
