import type React from "react"
import { cookies } from "next/headers"
import { AdminShell } from "@/components/admin/admin-shell"
import { readAdminSession } from "@/lib/admin-session"

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const store = await cookies()
  const session = await readAdminSession(store.get("admin_session")?.value)

  return (
    <div className="admin-theme min-h-screen bg-zinc-950 text-zinc-200">
      <AdminShell session={session}>{children}</AdminShell>
    </div>
  )
}
