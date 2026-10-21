-- =============================================================
-- MIGRAÇÃO — Desconto na loja toda (botão no painel admin)
-- Rode no SQL Editor do Supabase. Não apaga nada existente.
-- Uma única linha de configuração; o admin liga/desliga pelo painel.
-- =============================================================

create table if not exists public.store_settings (
  id integer primary key default 1 check (id = 1),
  global_discount_percent numeric(5,2) not null default 0
    check (global_discount_percent >= 0 and global_discount_percent <= 90),
  global_discount_ends_at timestamptz,   -- null = sem data pra acabar
  updated_at timestamptz not null default now()
);

insert into public.store_settings (id) values (1) on conflict (id) do nothing;

alter table public.store_settings enable row level security;

-- Qualquer visitante precisa LER (pra mostrar os preços com desconto)
drop policy if exists "store_settings_public_read" on public.store_settings;
create policy "store_settings_public_read"
  on public.store_settings for select using (true);

-- Só admin altera
drop policy if exists "store_settings_admin_write" on public.store_settings;
create policy "store_settings_admin_write"
  on public.store_settings for all
  using (public.is_admin())
  with check (public.is_admin());
