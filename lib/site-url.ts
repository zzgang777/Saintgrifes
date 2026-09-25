// Endereço público do site (usado nas tags de compartilhamento e nos retornos do pagamento).
// NEXT_PUBLIC_SITE_URL é o jeito recomendado de configurar isso — defina no painel da Vercel.
// As variáveis da Vercel abaixo são só um fallback automático pro site continuar funcionando mesmo
// sem configurar nada. Trata string vazia como "não definida" — uma env var criada em branco no
// painel não pode derrubar o build.
export function getSiteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`) ||
    (process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`) ||
    "http://localhost:3000"
  )
}
