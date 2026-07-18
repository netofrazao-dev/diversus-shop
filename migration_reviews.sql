-- =============================================================
-- MIGRAÇÃO — Avaliações com estrelas
-- Rode no SQL Editor do Supabase. Não apaga nada existente.
-- =============================================================

create table if not exists public.product_reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  customer_name text not null,
  rating integer not null check (rating between 1 and 5),
  comment text,
  is_visible boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_reviews_product on public.product_reviews(product_id);

alter table public.product_reviews enable row level security;

-- Leitura pública só das avaliações visíveis; qualquer um pode enviar uma nova
create policy "reviews_public_read"
  on public.product_reviews for select
  using (is_visible = true);

create policy "reviews_public_insert"
  on public.product_reviews for insert
  with check (true);

-- Admin pode ler todas (inclusive ocultas), atualizar (ocultar/mostrar) e apagar
create policy "reviews_admin_read_all"
  on public.product_reviews for select
  using (public.is_admin());

create policy "reviews_admin_update"
  on public.product_reviews for update
  using (public.is_admin());

create policy "reviews_admin_delete"
  on public.product_reviews for delete
  using (public.is_admin());
