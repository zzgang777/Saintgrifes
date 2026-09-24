-- Permite o cliente criar conta e ver os próprios pedidos.
-- Rode no SQL Editor do Supabase. Não precisa mexer em nada mais: o cadastro/login em si usa o
-- Supabase Auth, que já vem pronto no projeto (não precisa criar tabela pra isso).

alter table orders add column if not exists user_id uuid references auth.users(id) on delete set null;
create index if not exists orders_user_id_idx on orders (user_id);

-- Sem essa policy, o cliente não consegue ler nem os próprios pedidos (a tabela é fechada por
-- padrão). Ela só libera leitura da linha que pertence à própria conta — nada de escrita.
drop policy if exists "Cliente vê os próprios pedidos" on orders;
create policy "Cliente vê os próprios pedidos" on orders for select using (auth.uid() = user_id);
