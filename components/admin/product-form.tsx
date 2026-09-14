"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import type { Product, CategoryTile } from "@/lib/products"

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
  const [sizes, setSizes] = useState(product?.sizes.join(", ") ?? "")
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

    const payload = {
      slug: isEdit ? product!.slug : slugify(slug || name),
      name,
      price: onRequest ? 0 : Number(price) || 0,
      salePrice: !onRequest && salePrice !== "" ? Number(salePrice) : undefined,
      image,
      category,
      categoryLabel,
      badge: badge || undefined,
      sizes: sizes.split(",").map((s) => s.trim()).filter(Boolean),
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
    "rounded-lg border border-zinc-700 bg-zinc-950 px-3.5 py-2.5 text-sm text-white outline-none focus:border-red-600"

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

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label className="text-sm text-zinc-400">Tamanhos (separados por vírgula)</label>
          <input
            required
            value={sizes}
            onChange={(e) => setSizes(e.target.value)}
            placeholder="P, M, G, GG"
            className={inputClass}
          />
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
          Preço sob consulta (kits)
        </label>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
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
