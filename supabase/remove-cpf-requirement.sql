-- O checkout não pede mais CPF do cliente. Rode no SQL Editor do Supabase.
alter table orders alter column customer_cpf drop not null;
