-- Saint Grifes — schema do catálogo (produtos e categorias)
-- Rode este arquivo inteiro no SQL Editor do seu projeto Supabase.

create table if not exists categories (
  key text primary key,
  label text not null,
  description text not null,
  image text not null,
  sort_order int not null default 0
);

create table if not exists products (
  slug text primary key,
  name text not null,
  price numeric not null default 0,
  sale_price numeric,
  image text not null,
  category text not null references categories (key),
  category_label text not null,
  badge text check (badge in ('NOVO', 'OFERTA')),
  sizes text[] not null default '{}',
  stock jsonb not null default '{}',
  description text not null default '',
  best_seller boolean not null default false,
  is_new boolean not null default false,
  on_request boolean not null default false,
  created_at timestamptz not null default now()
);

alter table categories enable row level security;
alter table products enable row level security;

drop policy if exists "Leitura pública de categorias" on categories;
create policy "Leitura pública de categorias" on categories for select using (true);

drop policy if exists "Leitura pública de produtos" on products;
create policy "Leitura pública de produtos" on products for select using (true);

-- Categorias (a categoria "novidades" é só um cartão da loja; nenhum produto
-- é cadastrado diretamente nela — ela reúne quem tem is_new = true).
insert into categories (key, label, description, image, sort_order) values
  ('tenis', 'Tênis', 'Os modelos mais procurados da rua', '/products/tenis-dunk.jpg', 1),
  ('camisa', 'Camisas', 'Camisas e conjuntos que fecham o look', '/products/camisa-tailandesa.jpg', 2),
  ('sandalia', 'Sandálias', 'Conforto pra qualquer hora do dia', '/products/kenner-slide.jpg', 3),
  ('bermuda', 'Bermudas', 'Pra aguentar o calor de SLZ', '/products/bermuda-sarja.jpg', 4),
  ('novidades', 'Novidades', 'Acabou de chegar na loja', '/products/conjunto-de-time.jpg', 6)
on conflict (key) do nothing;

insert into products
  (slug, name, price, sale_price, image, category, category_label, badge, sizes, description, best_seller, is_new, on_request)
values
  ('asuna-2-0', 'Sandália Nike Asuna 2.0', 135.00, null, '/products/asuna-2-0.jpg', 'sandalia', 'Sandálias', 'NOVO', array['38','39','40','41','42','43'], 'Sandália slide Nike Asuna 2.0, confortável para o dia a dia em São Luís. Consulte disponibilidade de cor e numeração.', true, true, false),
  ('bermuda-sarja', 'Bermuda Sarja', 75.00, null, '/products/bermuda-sarja.jpg', 'bermuda', 'Bermudas', null, array['38','40','42','44'], 'Bermuda de sarja resistente, corte reto e caimento confortável para o calor de São Luís.', false, false, false),
  ('bermuda-termica-importada', 'Bermuda Térmica Importada', 89.90, null, '/products/bermuda-termica-importada.jpg', 'bermuda', 'Bermudas', null, array['38','40','42','44'], 'Bermuda térmica importada, tecido leve e secagem rápida. Ideal para treino ou uso casual.', false, false, false),
  ('camisa-compressao', 'Camisa de Compressão', 65.00, null, '/products/camisa-compressao.jpg', 'camisa', 'Camisas', null, array['P','M','G','GG'], 'Camisa de compressão Dri-FIT, ajuste ao corpo e tecido respirável para treino ou uso por baixo de outras peças.', false, false, false),
  ('camisa-tailandesa', 'Camisa Tailandesa', 145.00, null, '/products/camisa-tailandesa.jpg', 'camisa', 'Camisas', 'NOVO', array['P','M','G','GG'], 'Camisa tailandesa premium, acabamento de primeira linha e caimento impecável.', true, true, false),
  ('conjunto-academy', 'Conjunto Academy', 145.00, null, '/products/conjunto-academy.jpg', 'camisa', 'Camisas', null, array['P','M','G','GG'], 'Conjunto camisa + bermuda Academy, tecido leve de secagem rápida. Combina treino e estilo em uma peça só.', true, false, false),
  ('conjunto-de-time', 'Conjunto de Time', 170.00, null, '/products/conjunto-de-time.jpg', 'camisa', 'Camisas', 'NOVO', array['P','M','G','GG'], 'Conjunto de time completo para quem vive o futebol. Consulte os escudos disponíveis.', false, true, false),
  ('sandalia-kenner', 'Sandália Kenner', 119.90, null, '/products/kenner-slide.jpg', 'sandalia', 'Sandálias', 'NOVO', array['38','39','40','41','42','43'], 'Sandália Kenner nacional, resistente e confortável para o dia a dia em São Luís.', true, true, false),
  ('tenis-academy', 'Tênis Academy', 145.00, null, '/products/tenis-academy.jpg', 'tenis', 'Tênis', null, array['38','39','40','41','42','43'], 'Tênis Academy, leve e confortável para treino e uso casual.', false, false, false),
  ('tenis-academy-nike', 'Tênis Academy Nike', 135.00, null, '/products/tenis-academy-nike.jpg', 'tenis', 'Tênis', null, array['38','39','40','41','42','43'], 'Tênis Nike Academy, indicado para treino e para compor o look de rua.', true, false, false),
  ('tenis-air-force', 'Tênis Air Force', 135.00, null, '/products/tenis-air-force.jpg', 'tenis', 'Tênis', null, array['38','39','40','41','42','43'], 'O clássico Air Force, atemporal e versátil para qualquer combinação.', true, false, false),
  ('tenis-air-force-novo', 'Tênis Air Force Novo', 149.90, null, '/products/tenis-air-force-novo.jpg', 'tenis', 'Tênis', 'NOVO', array['38','39','40','41','42','43'], 'Versão mais recente do Air Force, com detalhes atualizados e acabamento premium.', false, true, false),
  ('tenis-lv', 'Tênis LV', 155.00, null, '/products/tenis-lv.jpg', 'tenis', 'Tênis', null, array['38','39','40','41','42','43'], 'Tênis LV, para quem busca um visual sofisticado sem abrir mão do conforto.', false, false, false),
  ('tenis-dunk', 'Tênis Dunk', 170.00, null, '/products/tenis-dunk.jpg', 'tenis', 'Tênis', null, array['38','39','40','41','42','43'], 'Tênis Dunk, ícone do streetwear com cores disponíveis sob consulta.', true, false, false)
on conflict (slug) do nothing;

-- Estoque inicial: 10 unidades por tamanho, só para os produtos que ainda não têm nada
-- cadastrado em "stock" (edite a quantidade real na tela de cada produto no admin).
update products
set stock = (select coalesce(jsonb_object_agg(size, 10), '{}'::jsonb) from unnest(sizes) as size)
where stock = '{}'::jsonb and array_length(sizes, 1) > 0;
