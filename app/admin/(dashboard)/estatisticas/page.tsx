import { Eye, MousePointerClick } from "lucide-react"

const eventos = [
  { nome: "Clique em produto", quando: "Cliente clica na foto de um produto na vitrine" },
  { nome: "Adicionar ao carrinho", quando: "Cliente adiciona um produto ao carrinho" },
  { nome: "Instagram produto", quando: "Cliente clica em falar no Instagram sobre um produto" },
  { nome: "Consultar no Instagram", quando: "Cliente pede o valor de um produto sob consulta" },
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
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
            <Eye className="size-4.5" />
          </span>
          <div>
            <p className="font-medium text-white">Visitas ao site</p>
            <p className="mt-1 text-sm text-zinc-400">
              Por enquanto, nada está contando as visitas. A loja roda na Vercel, então dá pra ativar o Vercel
              Analytics em Settings → Analytics do projeto — é só isso, sem precisar mexer no código.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
        <div className="mb-4 flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
            <MousePointerClick className="size-4.5" />
          </span>
          <div>
            <p className="font-medium text-white">Cliques em produtos</p>
            <p className="mt-1 text-sm text-zinc-400">
              O site já registra estes eventos em cada ponto do código (função <code>track</code> em{" "}
              <code>lib/track.ts</code>), mas eles não estão sendo guardados em lugar nenhum ainda:
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
        <p className="font-medium text-zinc-300">Como ativar de novo</p>
        <p className="mt-1 text-sm text-zinc-500">
          Peça pra gravar visitas e esses cliques direto no Supabase (o mesmo banco dos produtos e pedidos) — aí os
          números aparecem aqui dentro deste painel, sem depender de nenhum serviço externo.
        </p>
      </div>
    </div>
  )
}
