import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { TeamMemberForm } from "@/components/admin/team-member-form"

export default function NewTeamMemberPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/admin/equipe" className="mb-2 inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white">
          <ArrowLeft className="size-4" />
          Voltar para equipe
        </Link>
        <h1 className="text-xl font-semibold text-white">Adicionar membro</h1>
      </div>
      <TeamMemberForm />
    </div>
  )
}
