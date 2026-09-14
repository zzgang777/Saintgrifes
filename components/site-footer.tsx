import Link from "next/link"
import { siteConfig } from "@/lib/site"
import { Logo } from "@/components/logo"

const columns = [
  {
    title: "Navegação",
    links: [
      { label: "Início", href: "/" },
      { label: "Produtos", href: "/#mais-desejados" },
      { label: "Novidades", href: "/#mais-desejados" },
      { label: "Ofertas", href: "/#mais-desejados" },
      { label: "Contato", href: "/contato" },
    ],
  },
  {
    title: "Atendimento",
    links: [
      { label: "WhatsApp", href: "/contato" },
      { label: "Catálogo", href: siteConfig.catalogUrl },
      { label: "Loja física", href: "/contato" },
      { label: "Horários", href: "/contato" },
    ],
  },
  {
    title: "Informações",
    links: [
      { label: "Política de Privacidade", href: "#" },
      { label: "Termos de Uso", href: "#" },
      { label: "Trocas e Devoluções", href: "#" },
      { label: "Perguntas Frequentes", href: "#" },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="bg-foreground text-background">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo />
          <p className="mt-4 text-sm text-white/60">Referência em SLZ</p>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h3 className="mb-4 font-display text-lg uppercase tracking-wide text-primary">{col.title}</h3>
            <ul className="flex flex-col gap-2.5">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <p className="text-center text-sm text-white/50">
            © 2026 {siteConfig.name}. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
