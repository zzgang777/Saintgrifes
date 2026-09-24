-- Contas da equipe do painel admin (além do titular, que continua usando ADMIN_PASSWORD).
-- Rode isso no SQL Editor do Supabase pra habilitar a tela /admin/equipe.
create table if not exists admin_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  permissions text[] not null default '{}',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table admin_users enable row level security;
-- Sem política pública: só o backend (chave service role) acessa essa tabela.
