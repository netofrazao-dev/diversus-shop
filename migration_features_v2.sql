-- =============================================================
-- MIGRAÇÃO v2 — Promoções, ocultar produtos, recomendações,
-- combos com desconto e variações (cor/tamanho/sabor)
-- Rode isso no SQL Editor do Supabase. É seguro rodar no banco
-- que você já tem — não apaga nada existente.
-- =============================================================

-- -------------------------------------------------------------
-- 1. PROMOÇÕES — preço promocional com janela de validade opcional
-- -------------------------------------------------------------
alter table public.products add column if not exists promo_price numeric(10,2);
alter table public.products add column if not exists promo_starts_at timestamptz;
alter table public.products add column if not exists promo_ends_at timestamptz;

-- (is_active já existe e é o que usamos para "ocultar produto")

-- -------------------------------------------------------------
-- 2. VARIAÇÕES — grupos de opção (ex: "Tamanho", "Cor") e seus valores
-- -------------------------------------------------------------
create table if not exists public.product_option_groups (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null, -- ex: "Tamanho", "Cor", "Sabor"
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.product_option_values (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.product_option_groups(id) on delete cascade,
  value text not null, -- ex: "P", "Azul", "Chocolate"
  price_adjustment numeric(10,2) not null default 0, -- soma ou subtrai do preço base
  is_sold_out boolean not null default false,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_option_groups_product on public.product_option_groups(product_id);
create index if not exists idx_option_values_group on public.product_option_values(group_id);

-- -------------------------------------------------------------
-- 3. RECOMENDAÇÕES — "Você também pode gostar"
-- -------------------------------------------------------------
create table if not exists public.product_recommendations (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  recommended_product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (product_id, recommended_product_id)
);

create index if not exists idx_recommendations_product on public.product_recommendations(product_id);

-- -------------------------------------------------------------
-- 4. COMBOS — "compre junto e ganhe desconto"
-- -------------------------------------------------------------
create table if not exists public.product_combos (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  combo_product_id uuid not null references public.products(id) on delete cascade,
  discount_percent numeric(5,2), -- ex: 10.00 = 10% off no par
  discount_amount numeric(10,2), -- alternativa: valor fixo de desconto no par
  created_at timestamptz not null default now(),
  unique (product_id, combo_product_id)
);

create index if not exists idx_combos_product on public.product_combos(product_id);

-- -------------------------------------------------------------
-- RLS — leitura pública (loja precisa mostrar tudo isso), escrita só admin
-- -------------------------------------------------------------
alter table public.product_option_groups enable row level security;
alter table public.product_option_values enable row level security;
alter table public.product_recommendations enable row level security;
alter table public.product_combos enable row level security;

create policy "option_groups_public_read" on public.product_option_groups for select using (true);
create policy "option_groups_admin_insert" on public.product_option_groups for insert with check (public.is_admin());
create policy "option_groups_admin_update" on public.product_option_groups for update using (public.is_admin());
create policy "option_groups_admin_delete" on public.product_option_groups for delete using (public.is_admin());

create policy "option_values_public_read" on public.product_option_values for select using (true);
create policy "option_values_admin_insert" on public.product_option_values for insert with check (public.is_admin());
create policy "option_values_admin_update" on public.product_option_values for update using (public.is_admin());
create policy "option_values_admin_delete" on public.product_option_values for delete using (public.is_admin());

create policy "recommendations_public_read" on public.product_recommendations for select using (true);
create policy "recommendations_admin_insert" on public.product_recommendations for insert with check (public.is_admin());
create policy "recommendations_admin_delete" on public.product_recommendations for delete using (public.is_admin());

create policy "combos_public_read" on public.product_combos for select using (true);
create policy "combos_admin_insert" on public.product_combos for insert with check (public.is_admin());
create policy "combos_admin_update" on public.product_combos for update using (public.is_admin());
create policy "combos_admin_delete" on public.product_combos for delete using (public.is_admin());
