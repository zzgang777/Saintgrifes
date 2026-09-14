import { Eye, MousePointerClick, ExternalLink } from "lucide-react"

const eventos = [
  { nome: "Clique em produto", quando: "Cliente clica na foto de um produto na vitrine" },
  { nome: "Adicionar ao carrinho", quando: "Cliente adiciona um produto ao carrinho" },
  { nome: "WhatsApp produto", quando: "Cliente clica em falar no WhatsApp sobre um produto" },
  { nome: "Consultar no WhatsApp", quando: "Cliente pede o valor de um kit (preço sob consulta)" },
]

export default function AdminEstatisticasPage() {
  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Estatísticas</h1>
        <p className="text-sm text-zinc-400">Visitas ao site e cliques em produtos.</p>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-red-600/10 text-red-500">
            <Eye className="size-4.5" />
          </span>
          <div>
            <p className="font-medium text-white">Visitas ao site</p>
            <p className="mt-1 text-sm text-zinc-400">
              Já estão sendo contadas automaticamente pelo Vercel Analytics, que está instalado no site desde o
              início — não precisei adicionar nada novo para isso funcionar. Toda visita a qualquer página, incluindo
              cada produto, já é registrada.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
        <div className="mb-4 flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-red-600/10 text-red-500">
            <MousePointerClick className="size-4.5" />
          </span>
          <div>
            <p className="font-medium text-white">Cliques em produtos</p>
            <p className="mt-1 text-sm text-zinc-400">
              Agora o site registra estes eventos sempre que alguém interage com um produto:
            </p>
          </div>
        </div>
        <ul className="flex flex-col gap-2 border-t border-zinc-800 pt-4">
          {eventos.map((e) => (
            <li key={e.nome} className="flex flex-col gap-0.5 text-sm sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
              <span className="font-medium text-white">{e.nome}</span>
              <span className="text-zinc-500">{e.quando}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/50 p-5">
        <p className="font-medium text-zinc-300">Onde ver os números</p>
        <p className="mt-1 text-sm text-zinc-500">
          Depois que o site estiver publicado, os números de visitas e desses eventos aparecem no painel da própria
          Vercel: entre no projeto em vercel.com e abra a aba <span className="text-zinc-300">Analytics</span> (o
          total de visitas fica em "Pages" e os cliques em "Events").
        </p>
        <p className="mt-3 text-sm text-zinc-500">
          Para esses números aparecerem aqui dentro deste painel, seria preciso conectar a API paga do Vercel
          Analytics (plano Pro) ou um banco de dados próprio para guardar os eventos.
        </p>
        <a
          href="https://vercel.com/dashboard"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-red-500 hover:underline"
        >
          Abrir painel da Vercel
          <ExternalLink className="size-3.5" />
        </a>
      </div>
    </div>
  )
}
