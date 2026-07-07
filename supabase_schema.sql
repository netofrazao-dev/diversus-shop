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
-- 6. TABELA: admins (whitelist de administradores)
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
