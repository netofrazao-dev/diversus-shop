-- =============================================================
-- MIGRAÇÃO — Log de atividade do admin
-- Registra ações importantes feitas no painel (quem fez o quê e
-- quando) — útil se mais de uma pessoa tem acesso ao admin.
-- Rode no SQL Editor do Supabase. Não apaga nada existente.
-- =============================================================

create table if not exists public.admin_activity_log (
  id uuid primary key default gen_random_uuid(),
  admin_email text,
  action text not null,        -- ex: "Produto criado", "Status do pedido alterado"
  details jsonb,                -- contexto extra (nome do produto, status novo, etc)
  created_at timestamptz not null default now()
);

create index if not exists idx_activity_log_created on public.admin_activity_log(created_at desc);

alter table public.admin_activity_log enable row level security;

create policy "activity_log_admin_all"
  on public.admin_activity_log for all
  using (public.is_admin())
  with check (public.is_admin());
