-- =============================================================
-- MIGRAÇÃO — Storys / mini-vlogs da loja
-- Vídeos ou fotos curtas que o admin publica pra falar com o
-- cliente sobre produtos, estoque, bastidores, etc — estilo
-- "Stories" do Instagram, direto no site.
-- Rode no SQL Editor do Supabase. Não apaga nada existente.
-- =============================================================

create table if not exists public.store_stories (
  id uuid primary key default gen_random_uuid(),
  caption text,
  media_url text not null,
  media_type text not null check (media_type in ('image', 'video')),
  thumbnail_url text,              -- reservado pra uso futuro (capa pré-gerada)
  product_id uuid references public.products(id) on delete set null, -- opcional: "Ver produto"
  is_active boolean not null default true,
  display_order integer not null default 0, -- reservado pra reordenação manual futura
  expires_at timestamptz,           -- opcional: se preenchido, some sozinho depois dessa data
  created_at timestamptz not null default now()
);

create index if not exists idx_stories_active on public.store_stories(is_active, display_order, created_at desc);

alter table public.store_stories enable row level security;

create policy "stories_public_read"
  on public.store_stories for select
  using (is_active = true and (expires_at is null or expires_at >= now()));

create policy "stories_admin_all"
  on public.store_stories for all
  using (public.is_admin())
  with check (public.is_admin());

-- Bucket de storage pra vídeos/fotos dos storys
insert into storage.buckets (id, name, public)
values ('store-stories', 'store-stories', true)
on conflict (id) do nothing;

create policy "store_stories_media_public_read"
  on storage.objects for select
  using (bucket_id = 'store-stories');

create policy "store_stories_media_admin_insert"
  on storage.objects for insert
  with check (bucket_id = 'store-stories' and public.is_admin());

create policy "store_stories_media_admin_update"
  on storage.objects for update
  using (bucket_id = 'store-stories' and public.is_admin());

create policy "store_stories_media_admin_delete"
  on storage.objects for delete
  using (bucket_id = 'store-stories' and public.is_admin());
