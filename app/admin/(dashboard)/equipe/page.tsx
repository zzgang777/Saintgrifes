import { UserPlus, ShieldCheck } from "lucide-react"
import { siteConfig } from "@/lib/site"

export default function AdminEquipePage() {
  const initials = siteConfig.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Equipe</h1>
        <p className="text-sm text-zinc-400">Quem tem acesso ao painel da loja.</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
        <div className="border-b border-zinc-800 p-4">
          <h2 className="text-sm font-medium text-zinc-300">Titular da loja</h2>
        </div>
        <div className="flex items-center gap-3 p-4">
          <span className="flex size-10 items-center justify-center rounded-full bg-red-600 text-sm font-semibold text-white">
            {initials}
          </span>
          <div>
            <p className="font-medium text-white">{siteConfig.name}</p>
            <p className="text-xs text-zinc-500">Acesso total ao painel</p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-800 p-4">
          <h2 className="text-sm font-medium text-zinc-300">Membros da equipe (0)</h2>
        </div>
        <div className="flex flex-col items-center gap-2 p-8 text-center">
          <UserPlus className="size-6 text-zinc-600" />
          <p className="text-sm text-zinc-400">Nenhum membro adicionado ainda.</p>
          <p className="max-w-sm text-xs text-zinc-500">
            Hoje o painel usa uma senha única compartilhada, sem contas individuais. Para convidar colaboradores com
            login próprio e permissões separadas, é preciso configurar um sistema de contas.
          </p>
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-zinc-500" />
        <div>
          <p className="text-sm font-medium text-zinc-300">Como o acesso funciona hoje</p>
          <p className="mt-1 text-sm text-zinc-500">
            Qualquer pessoa com a senha do painel (definida em <code className="text-zinc-400">ADMIN_PASSWORD</code>)
            consegue entrar com acesso total. Troque essa senha sempre que alguém deixar de precisar de acesso.
          </p>
        </div>
      </div>
    </div>
  )
}
