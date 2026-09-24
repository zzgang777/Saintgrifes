export const siteConfig = {
  name: "Saint Grifes",
  city: "São Luís – MA",
  tagline: "Streetwear em SLZ",
  instagramUrl: "https://www.instagram.com/saintgrifes7/",
  instagramDmUrl: "https://ig.me/m/saintgrifes7",
  mapsUrl: "https://www.google.com/maps?q=-2.5992136,-44.1824278",
  hours: {
    weekdays: "Segunda a sábado — 09:00 às 19:00",
    sunday: "Domingo — 09:00 às 13:30",
  },
}

// Entrega no mesmo dia em São Luís (CEPs de 65000-000 a 65099-999). ATENÇÃO: o valor abaixo é
// provisório — ajuste para o que a loja realmente cobra.
export const sameDayDelivery = {
  id: "local",
  label: "Entrega via Motoboy",
  price: 15,
  description: "Receba hoje, direto na sua porta.",
  cepFrom: 65000000,
  cepTo: 65099999,
} as const

// Embalagem padrão de cada categoria (peso em kg, medidas em cm). Serve para cotar o frete dos
// Correios pelo CEP. ATENÇÃO: são valores estimados — ajuste para as caixas e pesos reais.
export const packageByCategory: Record<string, { weight: number; width: number; height: number; length: number }> = {
  tenis: { weight: 1.2, width: 22, height: 12, length: 33 },
  sandalia: { weight: 0.7, width: 20, height: 10, length: 32 },
  camisa: { weight: 0.35, width: 25, height: 5, length: 32 },
  bermuda: { weight: 0.4, width: 25, height: 5, length: 32 },
}

// O Instagram não aceita mensagem pronta pelo link, então copiamos o texto e abrimos a conversa:
// é só colar e enviar.
export function openInstagramDm(message: string) {
  void navigator.clipboard?.writeText(message).catch(() => {})
  window.open(siteConfig.instagramDmUrl, "_blank", "noopener,noreferrer")
}
