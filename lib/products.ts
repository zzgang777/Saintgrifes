import { supabase } from "@/lib/supabase"

export type Category = "tenis" | "sandalia" | "bermuda" | "camisa"

// Categorias que existem na loja agora. Linhas do banco com outra categoria (por exemplo, uma
// categoria pausada temporariamente) são ignoradas, mesmo que ainda estejam cadastradas no
// Supabase — os produtos continuam lá, só saem do ar. Tênis e sandálias foram pausados por
// enquanto; para voltar a vendê-los, é só incluir "tenis" e "sandalia" aqui de novo.
const knownCategories: string[] = ["bermuda", "camisa"]

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
  // Quantidade em estoque por tamanho (ex.: { M: 2, G: 0 }). Um tamanho sem entrada aqui é
  // tratado como esgotado — sempre que um tamanho existe em "sizes", ele deve aparecer aqui também.
  stock: Record<string, number>
  description: string
  bestSeller?: boolean
  isNew?: boolean
  onRequest?: boolean
}

// Estoque restante de um tamanho (0 se não estiver cadastrado).
export function sizeStock(product: Product, size: string): number {
  return Math.max(0, Math.trunc(product.stock?.[size] ?? 0))
}

export function isSizeAvailable(product: Product, size: string): boolean {
  return sizeStock(product, size) > 0
}

// Verdadeiro quando nenhum tamanho tem unidade disponível.
export function isSoldOut(product: Product): boolean {
  return product.sizes.length > 0 && product.sizes.every((s) => !isSizeAvailable(product, s))
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
  { key: "bermuda", label: "Bermudas", description: "Pra aguentar o calor de SLZ", image: "/products/bermuda-sarja.jpg" },
  { key: "novidades", label: "Novidades", description: "Acabou de chegar na loja", image: "/products/conjunto-de-time.jpg" },
]

const SIZES_TOP = ["P", "M", "G", "GG"]
const SIZES_SHORT = ["38", "40", "42", "44"]
const SIZES_SHOE = ["38", "39", "40", "41", "42", "43"]

// 10 unidades por tamanho, só para o catálogo de reserva não aparecer todo esgotado.
const stockFrom = (sizes: string[], qty = 10): Record<string, number> =>
  Object.fromEntries(sizes.map((s) => [s, qty]))

const fallbackProductsBase: Omit<Product, "stock">[] = [
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
    description: "Sandália slide Nike Asuna 2.0, confortável para o dia a dia em São Luís. Consulte disponibilidade de cor e numeração.",
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
    description: "Sandália Kenner nacional, resistente e confortável para o dia a dia em São Luís.",
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
]

export const fallbackProducts: Product[] = fallbackProductsBase.map((p) => ({ ...p, stock: stockFrom(p.sizes) }))

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
  stock: Record<string, number> | null
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
    stock: row.stock ?? {},
    description: row.description,
    bestSeller: row.best_seller,
    isNew: row.is_new,
    onRequest: row.on_request,
  }
}

// Depois de uma falha, o banco é considerado fora do ar por 5 minutos e as consultas seguintes
// usam o catálogo de reserva na hora, sem esperar outro timeout.
let databaseDownUntil = 0
const databaseIsUp = () => Boolean(supabase) && Date.now() >= databaseDownUntil
const markDatabaseDown = () => {
  databaseDownUntil = Date.now() + 300_000
}

// O catálogo de reserva também passa pelo filtro de categorias — assim, uma categoria pausada
// (como tênis e sandálias agora) some da loja mesmo se o Supabase cair no meio do caminho.
const visibleFallbackProducts = () => fallbackProducts.filter((p) => knownCategories.includes(p.category))
const visibleFallbackCategories = () => fallbackCategories.filter((c) => c.key === "novidades" || knownCategories.includes(c.key))

export async function getProducts(): Promise<Product[]> {
  if (!supabase || !databaseIsUp()) return visibleFallbackProducts()
  const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: true })
  if (error || !data) {
    markDatabaseDown()
    return visibleFallbackProducts()
  }
  return data.map(mapProductRow).filter((p) => knownCategories.includes(p.category))
}

export async function getCategories(): Promise<CategoryTile[]> {
  if (!supabase || !databaseIsUp()) return visibleFallbackCategories()
  const { data, error } = await supabase.from("categories").select("*").order("sort_order", { ascending: true })
  if (error || !data) {
    markDatabaseDown()
    return visibleFallbackCategories()
  }
  return data
    .filter((row) => row.key === "novidades" || knownCategories.includes(row.key))
    .map((row) => ({ key: row.key, label: row.label, description: row.description, image: row.image }))
}

export async function getProduct(slug: string): Promise<Product | undefined> {
  if (!supabase || !databaseIsUp()) return visibleFallbackProducts().find((p) => p.slug === slug)
  const { data, error } = await supabase.from("products").select("*").eq("slug", slug).maybeSingle()
  if (error || !data) {
    if (error) markDatabaseDown()
    return visibleFallbackProducts().find((p) => p.slug === slug)
  }
  const product = mapProductRow(data)
  return knownCategories.includes(product.category) ? product : undefined
}

export async function getRelated(product: Product, count = 4): Promise<Product[]> {
  const all = await getProducts()
  return all.filter((p) => p.slug !== product.slug && p.category === product.category).slice(0, count)
}
