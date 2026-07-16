-- =============================================================
-- MIGRAÇÃO — Grupo de variação opcional
-- Permite marcar um grupo de variação (ex: "Cor") como não
-- obrigatório, liberando a compra mesmo sem escolher essa opção.
-- Rode no SQL Editor do Supabase. Não apaga nada existente.
-- =============================================================

alter table public.product_option_groups
  add column if not exists is_required boolean not null default true;
