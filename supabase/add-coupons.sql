-- Cupons de desconto. Rode no SQL Editor do Supabase.
-- Tabela fechada por padrão (RLS sem política pública): o checkout valida o cupom através de uma
-- rota do servidor (que usa a chave de admin), o cliente nunca lê essa tabela direto.

create table if not exists coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  type text not null check (type in ('fixed', 'percentage')),
  value numeric not null check (value > 0),
  min_order_value numeric not null default 0,
  usage_limit int, -- null = ilimitado
  used_count int not null default 0,
  expires_at timestamptz, -- null = nunca expira
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists coupons_code_idx on coupons (code);

alter table coupons enable row level security;

-- O pedido guarda qual cupom foi usado e quanto de desconto deu, pra aparecer no admin depois.
alter table orders add column if not exists coupon_code text;
alter table orders add column if not exists discount numeric not null default 0;
