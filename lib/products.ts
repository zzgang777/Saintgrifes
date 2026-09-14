import { supabase } from "@/lib/supabase"

export type Category = "tenis" | "sandalia" | "bermuda" | "camisa" | "kits"

export type Product = {
  slug: string
  name: string
  price: number
  salePrice?: number
  image: string
  category: Category
  categoryLabel: string
  badge?: "NOVO" | "OFERTA"
  sizes: string[]
  description: string
  bestSeller?: boolean
  isNew?: boolean
  onRequest?: boolean
}

export type CategoryTile = {
  key: Category | "novidades"
  label: string
  description: string
  image: string
}

// Dados usados enquanto o Supabase não estiver configurado (ver lib/supabase.ts),
// e como fallback caso a consulta ao banco falhe por qualquer motivo. Mantém o
// site funcionando mesmo sem NEXT_PUBLIC_SUPABASE_URL / ANON_KEY definidos.
export const fallbackCategories: CategoryTile[] = [
  { key: "tenis", label: "Tênis", description: "Os modelos mais procurados da rua", image: "/products/tenis-dunk.jpg" },
  { key: "camisa", label: "Camisas", description: "Camisas e conjuntos que fecham o look", image: "/products/camisa-tailandesa.jpg" },
  { key: "sandalia", label: "Sandálias", description: "Conforto pra qualquer hora do dia", image: "/products/kenner-slide.jpg" },
  { key: "bermuda", label: "Bermudas", description: "Pra aguentar o calor da ilha", image: "/products/bermuda-sarja.jpg" },
  { key: "kits", label: "Kits", description: "Combos fechados sob consulta", image: "/products/kit-oversized.jpg" },
  { key: "novidades", label: "Novidades", description: "Acabou de chegar na loja", image: "/products/conjunto-de-time.jpg" },
]

const SIZES_TOP = ["P", "M", "G", "GG"]
const SIZES_SHORT = ["38", "40", "42", "44"]
const SIZES_SHOE = ["38", "39", "40", "41", "42", "43"]

export const fallbackProducts: Product[] = [
  {
    slug: "asuna-2-0",
    name: "Sandália Nike Asuna 2.0",
    price: 135.0,
    image: "/products/asuna-2-0.jpg",
    category: "sandalia",
    categoryLabel: "Sandálias",
    badge: "NOVO",
    isNew: true,
    bestSeller: true,
    sizes: SIZES_SHOE,
    description: "Sandália slide Nike Asuna 2.0, confortável no dia a dia da ilha. Consulte disponibilidade de cor e numeração.",
  },
  {
    slug: "bermuda-sarja",
    name: "Bermuda Sarja",
    price: 75.0,
    image: "/products/bermuda-sarja.jpg",
    category: "bermuda",
    categoryLabel: "Bermudas",
    sizes: SIZES_SHORT,
    description: "Bermuda de sarja resistente, corte reto e caimento confortável para o calor de São Luís.",
  },
  {
    slug: "bermuda-termica-importada",
    name: "Bermuda Térmica Importada",
    price: 89.9,
    image: "/products/bermuda-termica-importada.jpg",
    category: "bermuda",
    categoryLabel: "Bermudas",
    sizes: SIZES_SHORT,
    description: "Bermuda térmica importada, tecido leve e secagem rápida. Ideal para treino ou uso casual.",
  },
  {
    slug: "camisa-compressao",
    name: "Camisa de Compressão",
    price: 65.0,
    image: "/products/camisa-compressao.jpg",
    category: "camisa",
    categoryLabel: "Camisas",
    sizes: SIZES_TOP,
    description: "Camisa de compressão Dri-FIT, ajuste ao corpo e tecido respirável para treino ou uso por baixo de outras peças.",
  },
  {
    slug: "camisa-tailandesa",
    name: "Camisa Tailandesa",
    price: 145.0,
    image: "/products/camisa-tailandesa.jpg",
    category: "camisa",
    categoryLabel: "Camisas",
    badge: "NOVO",
    isNew: true,
    bestSeller: true,
    sizes: SIZES_TOP,
    description: "Camisa tailandesa premium, acabamento de primeira linha e caimento impecável.",
  },
  {
    slug: "conjunto-academy",
    name: "Conjunto Academy",
    price: 145.0,
    image: "/products/conjunto-academy.jpg",
    category: "camisa",
    categoryLabel: "Camisas",
    bestSeller: true,
    sizes: SIZES_TOP,
    description: "Conjunto camisa + bermuda Academy, tecido leve de secagem rápida. Combina treino e estilo em uma peça só.",
  },
  {
    slug: "conjunto-de-time",
    name: "Conjunto de Time",
    price: 170.0,
    image: "/products/conjunto-de-time.jpg",
    category: "camisa",
    categoryLabel: "Camisas",
    badge: "NOVO",
    isNew: true,
    sizes: SIZES_TOP,
    description: "Conjunto de time completo para quem vive o futebol. Consulte os escudos disponíveis.",
  },
  {
    slug: "sandalia-kenner",
    name: "Sandália Kenner",
    price: 119.9,
    image: "/products/kenner-slide.jpg",
    category: "sandalia",
    categoryLabel: "Sandálias",
    badge: "NOVO",
    isNew: true,
    bestSeller: true,
    sizes: SIZES_SHOE,
    description: "Sandália Kenner nacional, resistente e confortável para o dia a dia na ilha.",
  },
  {
    slug: "tenis-academy",
    name: "Tênis Academy",
    price: 145.0,
    image: "/products/tenis-academy.jpg",
    category: "tenis",
    categoryLabel: "Tênis",
    sizes: SIZES_SHOE,
    description: "Tênis Academy, leve e confortável para treino e uso casual.",
  },
  {
    slug: "tenis-academy-nike",
    name: "Tênis Academy Nike",
    price: 135.0,
    image: "/products/tenis-academy-nike.jpg",
    category: "tenis",
    categoryLabel: "Tênis",
    bestSeller: true,
    sizes: SIZES_SHOE,
    description: "Tênis Nike Academy, indicado para treino e para compor o look de rua.",
  },
  {
    slug: "tenis-air-force",
    name: "Tênis Air Force",
    price: 135.0,
    image: "/products/tenis-air-force.jpg",
    category: "tenis",
    categoryLabel: "Tênis",
    bestSeller: true,
    sizes: SIZES_SHOE,
    description: "O clássico Air Force, atemporal e versátil para qualquer combinação.",
  },
  {
    slug: "tenis-air-force-novo",
    name: "Tênis Air Force Novo",
    price: 149.9,
    image: "/products/tenis-air-force-novo.jpg",
    category: "tenis",
    categoryLabel: "Tênis",
    badge: "NOVO",
    isNew: true,
    sizes: SIZES_SHOE,
    description: "Versão mais recente do Air Force, com detalhes atualizados e acabamento premium.",
  },
  {
    slug: "tenis-lv",
    name: "Tênis LV",
    price: 155.0,
    image: "/products/tenis-lv.jpg",
    category: "tenis",
    categoryLabel: "Tênis",
    sizes: SIZES_SHOE,
    description: "Tênis LV, para quem busca um visual sofisticado sem abrir mão do conforto.",
  },
  {
    slug: "tenis-dunk",
    name: "Tênis Dunk",
    price: 170.0,
    image: "/products/tenis-dunk.jpg",
    category: "tenis",
    categoryLabel: "Tênis",
    bestSeller: true,
    sizes: SIZES_SHOE,
    description: "Tênis Dunk, ícone do streetwear com cores disponíveis sob consulta.",
  },
  {
    slug: "kit-algodao",
    name: "Kit Algodão",
    price: 0,
    onRequest: true,
    image: "/products/kit-algodao.jpg",
    category: "kits",
    categoryLabel: "Kits",
    sizes: SIZES_TOP,
    description: "Kit fechado em algodão, quantidade e peças a combinar direto com a loja pelo WhatsApp.",
  },
  {
    slug: "kit-oversized",
    name: "Kit Oversized",
    price: 0,
    onRequest: true,
    image: "/products/kit-oversized.jpg",
    category: "kits",
    categoryLabel: "Kits",
    sizes: SIZES_TOP,
    description: "Kit de camisetas oversized, quantidade e peças a combinar direto com a loja pelo WhatsApp.",
  },
  {
    slug: "kit-polo",
    name: "Kit Polo",
    price: 0,
    onRequest: true,
    image: "/products/kit-polo.jpg",
    category: "kits",
    categoryLabel: "Kits",
    sizes: SIZES_TOP,
    description: "Kit de camisas polo, quantidade e peças a combinar direto com a loja pelo WhatsApp.",
  },
  {
    slug: "kit-zara",
    name: "Kit Zara",
    price: 0,
    onRequest: true,
    image: "/products/kit-zara.jpg",
    category: "kits",
    categoryLabel: "Kits",
    sizes: SIZES_TOP,
    description: "Kit de looks estilo Zara, quantidade e peças a combinar direto com a loja pelo WhatsApp.",
  },
]

type ProductRow = {
  slug: string
  name: string
  price: number | string
  sale_price: number | string | null
  image: string
  category: Category
  category_label: string
  badge: "NOVO" | "OFERTA" | null
  sizes: string[]
  description: string
  best_seller: boolean
  is_new: boolean
  on_request: boolean
}

function mapProductRow(row: ProductRow): Product {
  return {
    slug: row.slug,
    name: row.name,
    price: Number(row.price),
    salePrice: row.sale_price != null ? Number(row.sale_price) : undefined,
    image: row.image,
    category: row.category,
    categoryLabel: row.category_label,
    badge: row.badge ?? undefined,
    sizes: row.sizes,
    description: row.description,
    bestSeller: row.best_seller,
    isNew: row.is_new,
    onRequest: row.on_request,
  }
}

export async function getProducts(): Promise<Product[]> {
  if (!supabase) return fallbackProducts
  const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: true })
  if (error || !data) return fallbackProducts
  return data.map(mapProductRow)
}

export async function getCategories(): Promise<CategoryTile[]> {
  if (!supabase) return fallbackCategories
  const { data, error } = await supabase.from("categories").select("*").order("sort_order", { ascending: true })
  if (error || !data) return fallbackCategories
  return data.map((row) => ({ key: row.key, label: row.label, description: row.description, image: row.image }))
}

export async function getProduct(slug: string): Promise<Product | undefined> {
  if (!supabase) return fallbackProducts.find((p) => p.slug === slug)
  const { data, error } = await supabase.from("products").select("*").eq("slug", slug).maybeSingle()
  if (error || !data) return fallbackProducts.find((p) => p.slug === slug)
  return mapProductRow(data)
}

export async function getRelated(product: Product, count = 4): Promise<Product[]> {
  const all = await getProducts()
  return all.filter((p) => p.slug !== product.slug && p.category === product.category).slice(0, count)
}
