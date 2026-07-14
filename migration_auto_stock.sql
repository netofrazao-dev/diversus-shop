-- =============================================================
-- MIGRAÇÃO — Baixa automática de estoque
-- Toda vez que um item de pedido é criado, o estoque do produto
-- correspondente é reduzido automaticamente. Se chegar a zero,
-- o produto é marcado como esgotado sozinho.
-- Roda no banco (SECURITY DEFINER) então funciona mesmo o cliente
-- não tendo permissão de editar produtos.
-- =============================================================

create or replace function public.decrement_product_stock()
returns trigger as $$
begin
  update public.products
  set
    stock = greatest(stock - new.quantity, 0),
    is_sold_out = (stock - new.quantity) <= 0
  where id = new.product_id;

  return new;
end;
$$ language plpgsql security definer
set search_path = public;

drop trigger if exists trg_decrement_stock on public.order_items;

create trigger trg_decrement_stock
  after insert on public.order_items
  for each row
  when (new.product_id is not null)
  execute function public.decrement_product_stock();
