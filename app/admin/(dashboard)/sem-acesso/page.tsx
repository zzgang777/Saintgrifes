import { ShieldAlert } from "lucide-react"

export default function AdminSemAcessoPage() {
  return (
    <div className="flex max-w-md flex-col items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-10 text-center">
      <ShieldAlert className="size-8 text-zinc-600" />
      <h1 className="text-lg font-semibold text-white">Sem permissão</h1>
      <p className="text-sm text-zinc-400">
        Sua conta ainda não tem nenhuma permissão liberada. Fale com o titular da loja para que ele libere o acesso em
        Equipe.
      </p>
    </div>
  )
}
