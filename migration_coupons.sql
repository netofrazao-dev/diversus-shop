-- =============================================================
-- MIGRAÇÃO — Cupons de desconto
-- Rode no SQL Editor do Supabase. Não apaga nada existente.
-- =============================================================

create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_type text not null check (discount_type in ('percent', 'amount')),
  discount_value numeric(10,2) not null check (discount_value > 0),
  is_active boolean not null default true,
  expires_at timestamptz,          -- null = sem validade
  min_order_value numeric(10,2),   -- null = sem pedido mínimo
  usage_limit integer,             -- null = sem limite de usos
  times_used integer not null default 0,
  created_at timestamptz not null default now()
);

-- Guarda qual cupom foi usado em cada pedido (histórico)
alter table public.orders add column if not exists coupon_code text;
alter table public.orders add column if not exists coupon_discount numeric(10,2);

-- RLS: só admin acessa a tabela diretamente. A validação pública
-- passa pela função validate_coupon() abaixo — assim os códigos
-- promocionais não ficam visíveis pra qualquer um que consultar o banco.
alter table public.coupons enable row level security;

create policy "coupons_admin_all"
  on public.coupons for all
  using (public.is_admin())
  with check (public.is_admin());

-- Função pública e segura de validação de cupom
create or replace function public.validate_coupon(p_code text, p_order_total numeric default null)
returns table(
  id uuid,
  code text,
  discount_type text,
  discount_value numeric,
  min_order_value numeric,
  message text
)
language plpgsql
security definer
stable
set search_path = public
as $$
declare
  v_coupon record;
begin
  select * into v_coupon from public.coupons c where upper(c.code) = upper(p_code) limit 1;

  if v_coupon is null then
    return query select null::uuid, null::text, null::text, null::numeric, null::numeric, 'Cupom não encontrado'::text;
    return;
  end if;

  if not v_coupon.is_active then
    return query select null::uuid, null::text, null::text, null::numeric, null::numeric, 'Este cupom não está mais ativo'::text;
    return;
  end if;

  if v_coupon.expires_at is not null and v_coupon.expires_at < now() then
    return query select null::uuid, null::text, null::text, null::numeric, null::numeric, 'Este cupom expirou'::text;
    return;
  end if;

  if v_coupon.usage_limit is not null and v_coupon.times_used >= v_coupon.usage_limit then
    return query select null::uuid, null::text, null::text, null::numeric, null::numeric, 'Este cupom já atingiu o limite de usos'::text;
    return;
  end if;

  if v_coupon.min_order_value is not null and p_order_total is not null and p_order_total < v_coupon.min_order_value then
    return query select null::uuid, null::text, null::text, null::numeric, v_coupon.min_order_value,
      ('Pedido mínimo de R$ ' || to_char(v_coupon.min_order_value, 'FM999999990.00') || ' para usar este cupom')::text;
    return;
  end if;

  return query select v_coupon.id, v_coupon.code, v_coupon.discount_type, v_coupon.discount_value, v_coupon.min_order_value, 'ok'::text;
end;
$$;

grant execute on function public.validate_coupon(text, numeric) to anon, authenticated;

-- Toda vez que um pedido com cupom é criado, soma 1 no contador de uso
create or replace function public.increment_coupon_usage()
returns trigger as $$
begin
  if new.coupon_code is not null then
    update public.coupons
    set times_used = times_used + 1
    where code = new.coupon_code;
  end if;
  return new;
end;
$$ language plpgsql security definer
set search_path = public;

drop trigger if exists trg_increment_coupon_usage on public.orders;
create trigger trg_increment_coupon_usage
  after insert on public.orders
  for each row
  execute function public.increment_coupon_usage();
