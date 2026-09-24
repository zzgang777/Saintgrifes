import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { CouponForm } from "@/components/admin/coupon-form"

export default function NewCouponPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/admin/cupons" className="mb-2 inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white">
          <ArrowLeft className="size-4" />
          Voltar para cupons
        </Link>
        <h1 className="text-xl font-semibold text-white">Criar cupom</h1>
      </div>
      <CouponForm />
    </div>
  )
}
