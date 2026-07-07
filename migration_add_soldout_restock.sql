-- Migração: adiciona "esgotado" nos produtos e a tabela de interesse de reposição

-- 1. Coluna de esgotado (controle manual, independente do campo stock)
alter table public.products
  add column if not exists is_sold_out boolean not null default false;

-- 2. Tabela de pedidos de "avise-me quando chegar"
create table if not exists public.restock_requests (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade,
  product_name text not null,
  customer_name text,
  customer_contact text,
  created_at timestamptz not null default now()
);

create index if not exists idx_restock_requests_product on public.restock_requests(product_id);

alter table public.restock_requests enable row level security;

create policy "restock_requests_public_insert"
  on public.restock_requests for insert
  with check (true);

create policy "restock_requests_admin_read"
  on public.restock_requests for select
  using (public.is_admin());

create policy "restock_requests_admin_delete"
  on public.restock_requests for delete
  using (public.is_admin());
