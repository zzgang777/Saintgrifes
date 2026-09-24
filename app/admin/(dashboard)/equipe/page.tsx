import Link from "next/link"
import { UserPlus, Plus } from "lucide-react"
import { siteConfig } from "@/lib/site"
import { listAdminUsers } from "@/lib/admin-users"
import { ORDERS_PERMISSION } from "@/lib/admin-permissions"
import { TeamMemberActions } from "@/components/admin/team-member-actions"

export const dynamic = "force-dynamic"

export default async function AdminEquipePage() {
  const members = await listAdminUsers()

  const initials = siteConfig.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Equipe</h1>
          <p className="text-sm text-zinc-400">Quem tem acesso ao painel da loja.</p>
        </div>
        <Link
          href="/admin/equipe/novo"
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          <Plus className="size-4" />
          Adicionar membro
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
        <div className="border-b border-zinc-800 p-4">
          <h2 className="text-sm font-medium text-zinc-300">Titular da loja</h2>
        </div>
        <div className="flex items-center gap-3 p-4">
          <span className="flex size-10 items-center justify-center rounded-full bg-indigo-500 text-sm font-semibold text-white">
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
          <h2 className="text-sm font-medium text-zinc-300">Membros da equipe ({members.length})</h2>
        </div>

        {members.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-8 text-center">
            <UserPlus className="size-6 text-zinc-600" />
            <p className="text-sm text-zinc-400">Nenhum membro adicionado ainda.</p>
            <p className="max-w-sm text-xs text-zinc-500">
              Crie um acesso com e-mail e senha pra um colaborador, e escolha o que ele pode ver no painel.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-zinc-800">
            {members.map((member) => (
              <li key={member.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-white">{member.email}</p>
                  <p className="text-xs text-zinc-500">
                    {member.active ? "Ativo" : "Desativado"} ·{" "}
                    {member.permissions.includes(ORDERS_PERMISSION) ? "Pode ver pedidos" : "Sem permissões"}
                  </p>
                </div>
                <TeamMemberActions id={member.id} email={member.email} active={member.active} permissions={member.permissions} />
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-sm text-zinc-500">
        O titular sempre entra com a senha única do painel (<code className="text-zinc-400">ADMIN_PASSWORD</code>). Membros da
        equipe entram em <code className="text-zinc-400">/admin/login</code> com o e-mail e a senha cadastrados aqui, e só veem
        o que tiverem permissão.
      </div>
    </div>
  )
}
