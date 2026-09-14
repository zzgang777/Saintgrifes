import { PackageSearch } from "lucide-react"

const columns = ["Data", "Valor", "Cliente", "Produtos", "Status", "Pagamento"]

export default function AdminPedidosPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Pedidos</h1>
        <p className="text-sm text-zinc-400">Veja todos os pedidos da sua loja.</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-xs uppercase tracking-wide text-zinc-500">
                {columns.map((col) => (
                  <th key={col} className="p-4 font-medium">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={columns.length}>
                  <div className="flex flex-col items-center gap-2 py-16 text-center">
                    <PackageSearch className="size-6 text-zinc-600" />
                    <p className="text-sm text-zinc-400">Nenhum pedido registrado ainda.</p>
                    <p className="max-w-sm text-xs text-zinc-500">
                      O checkout da loja hoje é feito pelo WhatsApp, então os pedidos não ficam salvos aqui. Para ver
                      pedidos de verdade nesta tabela, é preciso conectar um sistema de pedidos.
                    </p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="border-t border-zinc-800 p-4 text-sm text-zinc-500">Total de 0 resultados</div>
      </div>
    </div>
  )
}
