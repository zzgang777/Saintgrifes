import Image from "next/image"

export function DeliveryBanner() {
  return (
    <section aria-label="Entrega no mesmo dia em São Luís" className="bg-black pb-16 lg:pb-24">
      <div className="relative aspect-[1670/942] w-full">
        <Image
          src="/banner-entrega.webp"
          alt="Receba no mesmo dia! Compras para a região de São Luís até as 14:00 são enviadas no mesmo dia via motoboy, chegando em até 24 horas."
          fill
          sizes="100vw"
          unoptimized
          className="object-cover"
        />
      </div>
    </section>
  )
}
