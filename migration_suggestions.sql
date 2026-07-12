-- =============================================================
-- MIGRAÇÃO — Caixinha de sugestões dos clientes
-- Rode no SQL Editor do Supabase. Não apaga nada existente.
-- =============================================================

create table if not exists public.customer_suggestions (
  id uuid primary key default gen_random_uuid(),
  message text not null,
  customer_name text,
  customer_contact text,
  created_at timestamptz not null default now()
);

alter table public.customer_suggestions enable row level security;

create policy "suggestions_public_insert"
  on public.customer_suggestions for insert
  with check (true);

create policy "suggestions_admin_read"
  on public.customer_suggestions for select
  using (public.is_admin());

create policy "suggestions_admin_delete"
  on public.customer_suggestions for delete
  using (public.is_admin());
