-- Remove os produtos e a categoria "kits", que não existem mais no site
-- (o site já ignora essa categoria, mas os dados antigos continuam no banco).
-- Rode no SQL Editor do Supabase.

delete from products where category = 'kits';
delete from categories where key = 'kits';
