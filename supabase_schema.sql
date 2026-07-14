-- =============================================================
-- DIVERSUS SHOP — Schema completo Supabase (PostgreSQL)
-- Tabelas: categories, products, orders, order_items
-- Inclui: RLS, policies, triggers de updated_at, storage bucket
-- =============================================================

-- Extensão para gerar UUIDs
create extension if not exists "pgcrypto";

-- =============================================================
-- 1. TABELA: categories
-- =============================================================
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

-- =============================================================
-- 2. TABELA: products
-- =============================================================
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  description text,
  price numeric(10,2) not null check (price >= 0),
  compare_at_price numeric(10,2), -- preço "de/por" (riscado)
  stock integer not null default 0 check (stock >= 0),
  image_url text,
  images text[] default '{}', -- galeria de imagens adicionais
  is_featured boolean not null default false, -- "Mais Vendidos"
  is_new boolean not null default false,       -- "Lançamentos"
  is_sold_out boolean not null default false,  -- marcado manualmente pelo admin como esgotado
  is_active boolean not null default true,
  promo_price numeric(10,2),
  promo_starts_at timestamptz,
  promo_ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_products_category on public.products(category_id);
create index if not exists idx_products_featured on public.products(is_featured) where is_featured = true;
create index if not exists idx_products_new on public.products(is_new) where is_new = true;

-- =============================================================
-- 3. TABELA: orders
-- =============================================================
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  cep text,
  street text not null,
  number text not null,
  complement text,
  neighborhood text not null,
  city text,
  state text,
  total numeric(10,2) not null default 0,
  status text not null default 'pendente'
    check (status in ('pendente', 'confirmado', 'enviado', 'entregue', 'cancelado')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_created on public.orders(created_at desc);

-- =============================================================
-- 4. TABELA: order_items
-- =============================================================
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null, -- snapshot do nome no momento da compra
  unit_price numeric(10,2) not null,
  quantity integer not null check (quantity > 0),
  subtotal numeric(10,2) generated always as (unit_price * quantity) stored,
  created_at timestamptz not null default now()
);

create index if not exists idx_order_items_order on public.order_items(order_id);

-- =============================================================
-- 5. TABELA: restock_requests ("avise-me quando chegar")
-- Clientes marcam interesse em produtos esgotados; o admin vê a demanda.
-- =============================================================
create table if not exists public.restock_requests (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade,
  product_name text not null, -- snapshot, mesmo se o produto for excluído depois
  customer_name text,
  customer_contact text, -- telefone ou e-mail, opcional
  created_at timestamptz not null default now()
);

create index if not exists idx_restock_requests_product on public.restock_requests(product_id);

-- =============================================================
-- 6. VARIAÇÕES — grupos de opção (ex: "Tamanho", "Cor") e valores
-- =============================================================
create table if not exists public.product_option_groups (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.product_option_values (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.product_option_groups(id) on delete cascade,
  value text not null,
  price_adjustment numeric(10,2) not null default 0,
  is_sold_out boolean not null default false,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_option_groups_product on public.product_option_groups(product_id);
create index if not exists idx_option_values_group on public.product_option_values(group_id);

-- =============================================================
-- 7. RECOMENDAÇÕES — "Você também pode gostar"
-- =============================================================
create table if not exists public.product_recommendations (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  recommended_product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (product_id, recommended_product_id)
);

create index if not exists idx_recommendations_product on public.product_recommendations(product_id);

-- =============================================================
-- 8. COMBOS — "compre junto e ganhe desconto"
-- =============================================================
create table if not exists public.product_combos (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  combo_product_id uuid not null references public.products(id) on delete cascade,
  discount_percent numeric(5,2),
  discount_amount numeric(10,2),
  created_at timestamptz not null default now(),
  unique (product_id, combo_product_id)
);

create index if not exists idx_combos_product on public.product_combos(product_id);

-- =============================================================
-- 10. TABELA: customer_suggestions — "o que você gostaria que a gente vendesse?"
-- =============================================================
create table if not exists public.customer_suggestions (
  id uuid primary key default gen_random_uuid(),
  message text not null,
  customer_name text,
  customer_contact text,
  created_at timestamptz not null default now()
);

-- =============================================================
-- 11. TABELA: admins (whitelist de administradores)
-- Usada para diferenciar admin de cliente comum via auth.uid()
-- =============================================================
create table if not exists public.admins (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now()
);

-- =============================================================
-- FUNÇÃO + TRIGGERS: updated_at automático
-- =============================================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

drop trigger if exists trg_orders_updated_at on public.orders;
create trigger trg_orders_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- =============================================================
-- FUNÇÃO + TRIGGER: baixa automática de estoque
-- Toda vez que um item de pedido é criado, reduz o estoque do
-- produto correspondente e marca como esgotado se chegar a zero.
-- =============================================================
create or replace function public.decrement_product_stock()
returns trigger as $$
begin
  update public.products
  set
    stock = greatest(stock - new.quantity, 0),
    is_sold_out = (stock - new.quantity) <= 0
  where id = new.product_id;

  return new;
end;
$$ language plpgsql security definer
set search_path = public;

drop trigger if exists trg_decrement_stock on public.order_items;
create trigger trg_decrement_stock
  after insert on public.order_items
  for each row
  when (new.product_id is not null)
  execute function public.decrement_product_stock();

-- =============================================================
-- FUNÇÃO AUXILIAR: verifica se o usuário logado é admin
-- =============================================================
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.admins where id = auth.uid()
  );
$$ language sql security definer stable
set search_path = public, auth;

-- =============================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.admins enable row level security;
alter table public.restock_requests enable row level security;
alter table public.product_option_groups enable row level security;
alter table public.product_option_values enable row level security;
alter table public.product_recommendations enable row level security;
alter table public.product_combos enable row level security;
alter table public.customer_suggestions enable row level security;

-- --- categories: leitura pública, escrita apenas admin ---
create policy "categories_public_read"
  on public.categories for select
  using (true);

create policy "categories_admin_write"
  on public.categories for insert
  with check (public.is_admin());

create policy "categories_admin_update"
  on public.categories for update
  using (public.is_admin());

create policy "categories_admin_delete"
  on public.categories for delete
  using (public.is_admin());

-- --- products: leitura pública (apenas ativos), escrita apenas admin ---
create policy "products_public_read"
  on public.products for select
  using (is_active = true or public.is_admin());

create policy "products_admin_insert"
  on public.products for insert
  with check (public.is_admin());

create policy "products_admin_update"
  on public.products for update
  using (public.is_admin());

create policy "products_admin_delete"
  on public.products for delete
  using (public.is_admin());

-- --- orders: cliente pode criar pedido (checkout público),
--     mas só admin pode ler/atualizar/deletar ---
create policy "orders_public_insert"
  on public.orders for insert
  with check (true);

create policy "orders_admin_read"
  on public.orders for select
  using (public.is_admin());

create policy "orders_admin_update"
  on public.orders for update
  using (public.is_admin());

create policy "orders_admin_delete"
  on public.orders for delete
  using (public.is_admin());

-- --- order_items: mesma lógica de orders ---
create policy "order_items_public_insert"
  on public.order_items for insert
  with check (true);

create policy "order_items_admin_read"
  on public.order_items for select
  using (public.is_admin());

create policy "order_items_admin_delete"
  on public.order_items for delete
  using (public.is_admin());

-- --- admins: só o próprio admin lê seu registro ---
create policy "admins_self_read"
  on public.admins for select
  using (auth.uid() = id);

-- --- restock_requests: qualquer visitante pode registrar interesse,
--     só admin pode ler e apagar ---
create policy "restock_requests_public_insert"
  on public.restock_requests for insert
  with check (true);

create policy "restock_requests_admin_read"
  on public.restock_requests for select
  using (public.is_admin());

create policy "restock_requests_admin_delete"
  on public.restock_requests for delete
  using (public.is_admin());

-- --- variações, recomendações e combos: leitura pública, escrita só admin ---
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

-- --- sugestões de clientes: qualquer um pode enviar, só admin lê/apaga ---
create policy "suggestions_public_insert" on public.customer_suggestions for insert with check (true);
create policy "suggestions_admin_read" on public.customer_suggestions for select using (public.is_admin());
create policy "suggestions_admin_delete" on public.customer_suggestions for delete using (public.is_admin());

-- =============================================================
-- STORAGE: bucket para imagens de produtos
-- =============================================================
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "product_images_public_read"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "product_images_admin_insert"
  on storage.objects for insert
  with check (bucket_id = 'product-images' and public.is_admin());

create policy "product_images_admin_update"
  on storage.objects for update
  using (bucket_id = 'product-images' and public.is_admin());

create policy "product_images_admin_delete"
  on storage.objects for delete
  using (bucket_id = 'product-images' and public.is_admin());

-- =============================================================
-- SEED opcional: categorias iniciais
-- =============================================================
insert into public.categories (name, slug) values
  ('Relógios', 'relogios'),
  ('Camisas', 'camisas'),
  ('Cordões', 'cordoes'),
  ('Pulseiras', 'pulseiras'),
  ('Óculos', 'oculos')
on conflict (name) do nothing;

-- =============================================================
-- COMO PROMOVER UM USUÁRIO A ADMIN (executar manualmente depois
-- de o usuário se cadastrar via Supabase Auth):
--
-- insert into public.admins (id, full_name)
-- values ('UUID-DO-USUARIO-AQUI', 'Nome do Admin');
-- =============================================================
