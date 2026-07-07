-- Migração: torna cep, city e state opcionais na tabela orders
-- (não são mais coletados no formulário de checkout)
alter table public.orders alter column cep drop not null;
alter table public.orders alter column city drop not null;
alter table public.orders alter column state drop not null;
