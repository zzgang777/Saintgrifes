"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2 } from "lucide-react"
import type { Product, CategoryTile } from "@/lib/products"

type StockRow = { size: string; qty: string }

function stockRowsFrom(product?: Product): StockRow[] {
  if (!product) return [{ size: "", qty: "" }]
  const sizes = product.sizes.length > 0 ? product.sizes : Object.keys(product.stock ?? {})
  if (sizes.length === 0) return [{ size: "", qty: "" }]
  return sizes.map((size) => ({ size, qty: String(product.stock?.[size] ?? 0) }))
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export function ProductForm({ product, categories }: { product?: Product; categories: CategoryTile[] }) {
  const router = useRouter()
  const isEdit = Boolean(product)

  const [slug, setSlug] = useState(product?.slug ?? "")
  const [name, setName] = useState(product?.name ?? "")
  const [price, setPrice] = useState(String(product?.price ?? ""))
  const [salePrice, setSalePrice] = useState(product?.salePrice != null ? String(product.salePrice) : "")
  const [image, setImage] = useState(product?.image ?? "")
  const [category, setCategory] = useState<string>(product?.category ?? categories[0]?.key ?? "")
  const [badge, setBadge] = useState(product?.badge ?? "")
  const [stockRows, setStockRows] = useState<StockRow[]>(stockRowsFrom(product))
  const [description, setDescription] = useState(product?.description ?? "")
  const [bestSeller, setBestSeller] = useState(product?.bestSeller ?? false)
  const [isNew, setIsNew] = useState(product?.isNew ?? false)
  const [onRequest, setOnRequest] = useState(product?.onRequest ?? false)

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError("")

    const categoryLabel = categories.find((c) => c.key === category)?.label ?? category

    const cleanRows = stockRows
      .map((r) => ({ size: r.size.trim(), qty: Math.max(0, Math.trunc(Number(r.qty)) || 0) }))
      .filter((r) => r.size)

    if (cleanRows.length === 0) {
      setError("Adicione pelo menos um tamanho.")
      setSaving(false)
      return
    }

    const payload = {
      slug: isEdit ? product!.slug : slugify(slug || name),
      name,
      price: onRequest ? 0 : Number(price) || 0,
      salePrice: !onRequest && salePrice !== "" ? Number(salePrice) : undefined,
      image,
      category,
      categoryLabel,
      badge: badge || undefined,
      sizes: cleanRows.map((r) => r.size),
      stock: Object.fromEntries(cleanRows.map((r) => [r.size, r.qty])),
      description,
      bestSeller,
      isNew,
      onRequest,
    }

    const res = await fetch(isEdit ? `/api/admin/products/${product!.slug}` : "/api/admin/products", {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    if (res.ok) {
      router.push("/admin/produtos")
      router.refresh()
    } else {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? "Não foi possível salvar o produto.")
      setSaving(false)
    }
  }

  const inputClass =
    "rounded-lg border border-zinc-700 bg-zinc-950 px-3.5 py-2.5 text-sm text-white outline-none focus:border-indigo-500"

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 rounded-xl border border-zinc-800 bg-zinc-900 p-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-zinc-400">Nome</label>
          <input required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-zinc-400">
            Slug (URL) {!isEdit && <span className="text-zinc-600">— deixe vazio para gerar do nome</span>}
          </label>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            disabled={isEdit}
            placeholder={slugify(name) || "gerado-automaticamente"}
            className={`${inputClass} disabled:opacity-50`}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-zinc-400">Categoria</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
            {categories.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-zinc-400">Badge</label>
          <select value={badge} onChange={(e) => setBadge(e.target.value)} className={inputClass}>
            <option value="">Nenhum</option>
            <option value="NOVO">NOVO</option>
            <option value="OFERTA">OFERTA</option>
          </select>
        </div>

        {!onRequest && (
          <>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-zinc-400">Preço (R$)</label>
              <input
                required
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-zinc-400">Preço promocional (R$) — opcional</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                className={inputClass}
              />
            </div>
          </>
        )}

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label className="text-sm text-zinc-400">Imagem (caminho em /public)</label>
          <input
            required
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="/products/nome-do-arquivo.jpg"
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-2 sm:col-span-2">
          <label className="text-sm text-zinc-400">Tamanhos e estoque</label>
          <div className="flex flex-col gap-2">
            {stockRows.map((row, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  value={row.size}
                  onChange={(e) =>
                    setStockRows((rows) => rows.map((r, ri) => (ri === i ? { ...r, size: e.target.value } : r)))
                  }
                  placeholder="Tamanho (ex.: M)"
                  className={`${inputClass} w-32`}
                />
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={row.qty}
                  onChange={(e) =>
                    setStockRows((rows) => rows.map((r, ri) => (ri === i ? { ...r, qty: e.target.value } : r)))
                  }
                  placeholder="Qtd. em estoque"
                  className={`${inputClass} w-36`}
                />
                <button
                  type="button"
                  onClick={() => setStockRows((rows) => rows.filter((_, ri) => ri !== i))}
                  disabled={stockRows.length === 1}
                  aria-label="Remover tamanho"
                  className="rounded-lg p-2.5 text-zinc-500 hover:bg-zinc-800 hover:text-red-400 disabled:opacity-30"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setStockRows((rows) => [...rows, { size: "", qty: "" }])}
            className="flex w-fit items-center gap-1.5 rounded-lg border border-dashed border-zinc-700 px-3 py-2 text-sm text-zinc-400 hover:border-indigo-500 hover:text-indigo-400"
          >
            <Plus className="size-4" />
            Adicionar tamanho
          </button>
          <p className="text-xs text-zinc-600">
            Coloque 0 quando um tamanho estiver esgotado — ele aparece assim para quem visita a loja.
          </p>
        </div>

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label className="text-sm text-zinc-400">Descrição</label>
          <textarea
            required
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`${inputClass} resize-none`}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-5 border-t border-zinc-800 pt-4">
        <label className="flex items-center gap-2 text-sm text-zinc-300">
          <input type="checkbox" checked={isNew} onChange={(e) => setIsNew(e.target.checked)} className="size-4" />
          Novidade
        </label>
        <label className="flex items-center gap-2 text-sm text-zinc-300">
          <input
            type="checkbox"
            checked={bestSeller}
            onChange={(e) => setBestSeller(e.target.checked)}
            className="size-4"
          />
          Mais vendido
        </label>
        <label className="flex items-center gap-2 text-sm text-zinc-300">
          <input
            type="checkbox"
            checked={onRequest}
            onChange={(e) => setOnRequest(e.target.checked)}
            className="size-4"
          />
          Preço sob consulta
        </label>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {saving ? "Salvando..." : isEdit ? "Salvar alterações" : "Criar produto"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/produtos")}
          className="rounded-lg border border-zinc-700 px-5 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-800"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
