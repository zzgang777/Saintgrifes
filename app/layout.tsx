import type React from "react"
import type { Metadata } from "next"
import { Inter, Anton } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { MotionProvider } from "@/components/motion-provider"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
  display: "swap",
})

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`) ??
  (process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`) ??
  "http://localhost:3000"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Estilo da Ilha | Loja de Roupas em São Luís - MA (SLZ)",
    template: "%s | Estilo da Ilha",
  },
  description:
    "Estilo da Ilha é referência em moda em São Luís (SLZ). Roupas femininas, masculinas, novidades e acessórios com estética tropical, atitude e personalidade. Loja de roupas em São Luís - MA.",
  keywords: [
    "loja de roupas em São Luís",
    "Estilo da Ilha SLZ",
    "moda em São Luís",
    "roupas São Luís MA",
    "moda tropical",
    "streetwear São Luís",
    "loja de roupas SLZ",
  ],
  authors: [{ name: "Estilo da Ilha" }],
  creator: "Estilo da Ilha",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: siteUrl,
    siteName: "Estilo da Ilha",
    title: "Estilo da Ilha | Loja de Roupas em São Luís - MA",
    description:
      "Moda, atitude e personalidade em um só lugar. Referência em SLZ com estética tropical e estilo urbano.",
    images: [{ url: "/banner-boas-vindas.png", width: 1200, height: 630, alt: "Estilo da Ilha" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Estilo da Ilha | Loja de Roupas em São Luís - MA",
    description: "Moda, atitude e personalidade em um só lugar. Referência em SLZ.",
    images: ["/banner-boas-vindas.png"],
  },
  icons: {
    icon: "/estilo-da-ilha-mark.png",
  },
  generator: "v0.app",
}

export const viewport = {
  themeColor: "#e52316",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className="bg-background">
      <body className={`${inter.variable} ${anton.variable} font-sans antialiased`}>
        <MotionProvider>
          <Suspense fallback={null}>{children}</Suspense>
        </MotionProvider>
        <Analytics />
      </body>
    </html>
  )
}
