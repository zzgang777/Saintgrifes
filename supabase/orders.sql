-- Saint Grifes — pedidos
-- Rode este arquivo no SQL Editor do Supabase (depois do schema.sql).
--
-- A tabela fica com RLS ligado e SEM nenhuma policy pública: só o servidor (chave service_role)
-- lê e grava. Assim CPF, endereço e telefone dos clientes nunca ficam acessíveis pelo navegador.

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'cancelled')),

  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  customer_cpf text,

  shipping_service text not null,
  shipping_days text,
  shipping_address jsonb not null,

  items jsonb not null,
  subtotal numeric not null,
  shipping_cost numeric not null default 0,
  total numeric not null,

  payment_provider text,
  payment_id text,
  payment_url text,
  paid_at timestamptz
);

create index if not exists orders_created_at_idx on orders (created_at desc);
create index if not exists orders_payment_id_idx on orders (payment_id);

alter table orders enable row level security;
