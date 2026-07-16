-- =============================================================
-- MIGRAÇÃO — Foto vinculada à variação
-- Permite que cada valor de variação (ex: "Azul") tenha uma foto
-- específica do produto associada, trocando a imagem em destaque
-- automaticamente quando o cliente seleciona aquela opção.
-- Rode no SQL Editor do Supabase. Não apaga nada existente.
-- =============================================================

alter table public.product_option_values
  add column if not exists image_url text;
