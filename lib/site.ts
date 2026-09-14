export const siteConfig = {
  name: "Estilo da Ilha",
  city: "São Luís – MA",
  tagline: "Referência em SLZ",
  catalogUrl: "https://bio.site/Estilodailha",
  instagramUrl: "https://instagram.com/estilodailha",
  mapsUrl: "https://www.google.com/maps?q=-2.5992136,-44.1824278",
  whatsappBusinessLink: "https://api.whatsapp.com/message/CLD5WWIIMBBUO1?autoload=1&app_absent=0",
  whatsappMessage: "Olá! Vim pelo site da Estilo da Ilha e gostaria de saber mais sobre as peças disponíveis.",
  hours: {
    weekdays: "Segunda a sábado — 09:00 às 19:00",
    sunday: "Domingo — 09:00 às 13:30",
  },
}

export function whatsappLink(message?: string) {
  const text = encodeURIComponent(message ?? siteConfig.whatsappMessage)
  return `${siteConfig.whatsappBusinessLink}&text=${text}`
}
