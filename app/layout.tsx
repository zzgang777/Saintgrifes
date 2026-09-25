import type React from "react"
import type { Metadata } from "next"
import { Archivo, Big_Shoulders } from "next/font/google"
import { Suspense } from "react"
import { MotionProvider } from "@/components/motion-provider"
import { SiteBackgroundVideo } from "@/components/site-background-video"
import { getSiteUrl } from "@/lib/site-url"
import "./globals.css"

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
})

const shoulders = Big_Shoulders({
  subsets: ["latin"],
  variable: "--font-shoulders",
  display: "swap",
})

const siteUrl = getSiteUrl()

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Saint Grifes",
    template: "%s | Saint Grifes",
  },
  keywords: [
    "Saint Grifes",
    "streetwear São Luís",
    "loja de roupas em São Luís",
    "camisas em São Luís",
    "roupas São Luís MA",
    "loja de roupas SLZ",
  ],
  authors: [{ name: "Saint Grifes" }],
  creator: "Saint Grifes",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: siteUrl,
    siteName: "Saint Grifes",
    title: "Saint Grifes",
    images: [{ url: "/saint-grifes-og.jpg", width: 1200, height: 630, alt: "Saint Grifes" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Saint Grifes",
    images: ["/saint-grifes-og.jpg"],
  },
  icons: {
    icon: "/favicon.png",
  },
}

export const viewport = {
  themeColor: "#040202",
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
      <body className={`${archivo.variable} ${shoulders.variable} font-sans antialiased`}>
        <SiteBackgroundVideo />
        <MotionProvider>
          <Suspense fallback={null}>{children}</Suspense>
        </MotionProvider>
      </body>
    </html>
  )
}
