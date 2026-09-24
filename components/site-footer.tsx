import Link from "next/link"
import { siteConfig } from "@/lib/site"

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
      { label: "Instagram", href: siteConfig.instagramUrl },
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
    <footer className="border-t border-border bg-ink/60 text-bone">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-3">

        {columns.map((col) => (
          <div key={col.title}>
            <h3 className="mb-4 font-display text-lg uppercase tracking-wide text-signal">{col.title}</h3>
            <ul className="flex flex-col gap-2.5">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    {...(link.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="inline-block text-sm text-white/70 transition-all hover:translate-x-1 hover:text-white"
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
