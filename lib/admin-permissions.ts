// Catálogo de permissões dos membros da equipe. Fica num arquivo à parte, sem depender do Supabase,
// porque também é usado pelo proxy (edge) pra decidir quais páginas um membro pode ver.
export const ORDERS_PERMISSION = "orders" as const

export const AVAILABLE_PERMISSIONS = [
  {
    key: ORDERS_PERMISSION,
    label: "Ver pedidos",
    description: "Acessa a lista de pedidos e pedidos pendentes no painel, e recebe e-mail quando um pedido é feito ou aprovado.",
  },
] as const
