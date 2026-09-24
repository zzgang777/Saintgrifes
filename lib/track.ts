// Ponto único pra registrar eventos de clique (vitrine, produto, Instagram...).
// Antes usava o Vercel Analytics, que só funciona em sites hospedados na Vercel — como a loja não
// usa mais a Vercel, isso aqui não faz nada por enquanto. Dá pra trocar por um evento salvo no
// Supabase (ou outro serviço) sem mudar nenhum lugar que chama track(...).
export function track(_eventName: string, _properties?: Record<string, unknown>) {}
