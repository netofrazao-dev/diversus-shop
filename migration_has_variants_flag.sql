-- =============================================================
-- MIGRAÇÃO — Sinalizador "tem variação obrigatória"
-- Corrige um bug: o botão "Adicionar" dos cards de produto (Catálogo,
-- Home) permitia adicionar ao carrinho produtos com variação
-- obrigatória (cor/tamanho) SEM escolher a variação. Esse campo deixa
-- o card saber disso sem precisar de uma consulta extra por produto.
-- Rode no SQL Editor do Supabase. Não apaga nada existente.
-- =============================================================

alter table public.products
  add column if not exists has_variants boolean not null default false;

-- Preenche o valor pros produtos que já têm grupo de variação obrigatório
update public.products p
set has_variants = true
where exists (
  select 1
  from public.product_option_groups g
  join public.product_option_values v on v.group_id = g.id
  where g.product_id = p.id
    and g.is_required is not false
);
