-- =============================================================
-- MIGRAÇÃO — Validação (melhor esforço) do total do pedido no servidor
--
-- IMPORTANTE — leia antes de rodar:
-- O total do pedido é calculado no navegador do cliente. Como o
-- pagamento é sempre confirmado manualmente por vocês (WhatsApp/Pix),
-- o risco real é baixo — mas essa validação adiciona uma camada
-- extra pra pegar manipulações grosseiras (ex: alguém mandando um
-- total muito menor que o valor real do carrinho).
--
-- Essa validação NÃO é perfeita: como descontos de combo são
-- calculados no app (não no banco), a checagem usa margens generosas
-- pra não travar vendas de verdade. Ela pega fraude grosseira, não
-- sofisticada.
--
-- Inclui duas camadas:
-- 1. Uma função "create_order_with_items" que cria o pedido E os itens
--    numa transação só (o checkout do site passa a usar ela em vez de
--    dois inserts separados) — se a validação recusar, nada fica salvo
--    pela metade.
-- 2. Um trigger na tabela order_items como segunda camada de proteção,
--    caso alguém tente inserir direto sem passar pela função acima.
--
-- Rode no SQL Editor do Supabase. Não apaga nada existente.
-- =============================================================

create or replace function public.validate_order_total()
returns trigger as $$
declare
  rec record;
  computed_subtotal numeric;
  order_row public.orders%rowtype;
  coupon_exists boolean;
begin
  for rec in select distinct order_id from new_rows loop
    select coalesce(sum(quantity * unit_price), 0) into computed_subtotal
    from public.order_items where order_id = rec.order_id;

    select * into order_row from public.orders where id = rec.order_id;

    if order_row.total > computed_subtotal + 50 then
      raise exception 'Total do pedido inconsistente: maior que o valor dos itens';
    end if;

    if order_row.total < 0 then
      raise exception 'Total do pedido não pode ser negativo';
    end if;

    if order_row.total < (computed_subtotal * 0.1) - 20 then
      raise exception 'Total do pedido muito abaixo do esperado pros itens';
    end if;

    if order_row.coupon_code is not null then
      select exists(select 1 from public.coupons where code = order_row.coupon_code) into coupon_exists;
      if not coupon_exists then
        raise exception 'Cupom informado não existe';
      end if;

      if order_row.coupon_discount is not null and order_row.coupon_discount > computed_subtotal then
        raise exception 'Desconto de cupom maior que o valor dos itens';
      end if;
    end if;
  end loop;

  return null;
end;
$$ language plpgsql security definer
set search_path = public;

drop trigger if exists trg_validate_order_total on public.order_items;
create trigger trg_validate_order_total
  after insert on public.order_items
  referencing new table as new_rows
  for each statement
  execute function public.validate_order_total();

-- =============================================================
-- FUNÇÃO: create_order_with_items — cria pedido + itens numa transação só
-- =============================================================
create or replace function public.create_order_with_items(p_order jsonb, p_items jsonb)
returns uuid
language plpgsql
as $$
declare
  v_order_id uuid;
  v_total numeric;
  v_computed_subtotal numeric;
  v_coupon_code text;
  v_coupon_discount numeric;
begin
  v_total := (p_order->>'total')::numeric;
  v_coupon_code := nullif(p_order->>'coupon_code', '');
  v_coupon_discount := nullif(p_order->>'coupon_discount', '')::numeric;

  select coalesce(sum((item->>'quantity')::int * (item->>'unit_price')::numeric), 0)
  into v_computed_subtotal
  from jsonb_array_elements(p_items) as item;

  if v_total > v_computed_subtotal + 50 then
    raise exception 'Total do pedido inconsistente: maior que o valor dos itens';
  end if;
  if v_total < 0 then
    raise exception 'Total do pedido não pode ser negativo';
  end if;
  if v_total < (v_computed_subtotal * 0.1) - 20 then
    raise exception 'Total do pedido muito abaixo do esperado pros itens';
  end if;
  if v_coupon_code is not null then
    if not exists(select 1 from public.coupons where code = v_coupon_code) then
      raise exception 'Cupom informado não existe';
    end if;
    if v_coupon_discount is not null and v_coupon_discount > v_computed_subtotal then
      raise exception 'Desconto de cupom maior que o valor dos itens';
    end if;
  end if;

  insert into public.orders (
    customer_name, customer_phone, customer_email, street, number,
    complement, neighborhood, total, coupon_code, coupon_discount
  ) values (
    p_order->>'customer_name', p_order->>'customer_phone', nullif(p_order->>'customer_email', ''),
    p_order->>'street', p_order->>'number', nullif(p_order->>'complement', ''), p_order->>'neighborhood',
    v_total, v_coupon_code, v_coupon_discount
  ) returning id into v_order_id;

  insert into public.order_items (order_id, product_id, product_name, unit_price, quantity)
  select
    v_order_id,
    nullif(item->>'product_id', '')::uuid,
    item->>'product_name',
    (item->>'unit_price')::numeric,
    (item->>'quantity')::int
  from jsonb_array_elements(p_items) as item;

  return v_order_id;
end;
$$;

grant execute on function public.create_order_with_items(jsonb, jsonb) to anon, authenticated;
