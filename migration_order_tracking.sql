-- =============================================================
-- MIGRAÇÃO — Rastreamento de pedido pelo cliente
-- Permite o cliente consultar os próprios pedidos pelo telefone,
-- sem abrir a tabela orders inteira pro público (só retorna os
-- pedidos que baterem com o telefone informado).
-- Rode no SQL Editor do Supabase. Não apaga nada existente.
-- =============================================================

create or replace function public.track_orders_by_phone(p_phone text)
returns table(
  id uuid,
  status text,
  total numeric,
  coupon_code text,
  coupon_discount numeric,
  customer_name text,
  street text,
  number text,
  complement text,
  neighborhood text,
  created_at timestamptz,
  items jsonb
)
language sql
security definer
stable
set search_path = public
as $$
  select
    o.id,
    o.status,
    o.total,
    o.coupon_code,
    o.coupon_discount,
    o.customer_name,
    o.street,
    o.number,
    o.complement,
    o.neighborhood,
    o.created_at,
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'product_name', oi.product_name,
            'quantity', oi.quantity,
            'unit_price', oi.unit_price
          )
          order by oi.created_at
        )
        from public.order_items oi
        where oi.order_id = o.id
      ),
      '[]'::jsonb
    ) as items
  from public.orders o
  where regexp_replace(p_phone, '\D', '', 'g') <> ''
    and regexp_replace(o.customer_phone, '\D', '', 'g') = regexp_replace(p_phone, '\D', '', 'g')
  order by o.created_at desc
  limit 20;
$$;

grant execute on function public.track_orders_by_phone(text) to anon, authenticated;
