-- Adiciona controle de estoque por tamanho aos produtos que já existem no banco.
-- Rode no SQL Editor do Supabase (uma vez só).

alter table products add column if not exists stock jsonb not null default '{}';

-- Preenche 10 unidades por tamanho nos produtos que ainda não têm estoque cadastrado,
-- só para nada aparecer "esgotado" por engano. Ajuste a quantidade real de cada peça
-- na tela de edição do produto, no admin.
update products
set stock = (select coalesce(jsonb_object_agg(size, 10), '{}'::jsonb) from unnest(sizes) as size)
where stock = '{}'::jsonb and array_length(sizes, 1) > 0;
