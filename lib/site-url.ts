// Endereço público do site (usado nas tags de compartilhamento e nos retornos do pagamento).
// NEXT_PUBLIC_SITE_URL é o jeito recomendado de configurar isso — defina no painel do Netlify.
// As variáveis abaixo são só um fallback automático (Netlify define URL/DEPLOY_PRIME_URL; a Vercel
// definia VERCEL_URL) para o site continuar funcionando mesmo sem configurar nada.
export function getSiteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.URL ??
    process.env.DEPLOY_PRIME_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`) ??
    (process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`) ??
    "http://localhost:3000"
  )
}
