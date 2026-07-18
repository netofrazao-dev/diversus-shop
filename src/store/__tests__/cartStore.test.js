import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore } from '../cartStore';

/**
 * Testes do carrinho — a lógica mais "cara" do sistema se der errado
 * (é literalmente dinheiro: subtotal, desconto de combo, total final).
 */

const productA = { id: 'prod-a', name: 'Camisa', price: 50, image_url: null };
const productB = { id: 'prod-b', name: 'Boné', price: 30, image_url: null };

// Reseta o carrinho antes de cada teste (o store é global/singleton)
beforeEach(() => {
  useCartStore.setState({ items: [], combos: [], isDrawerOpen: false });
});

describe('cartStore — itens básicos', () => {
  it('adiciona um item novo com quantidade 1 por padrão', () => {
    useCartStore.getState().addItem(productA);
    const items = useCartStore.getState().items;

    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ id: 'prod-a', productId: 'prod-a', quantity: 1, price: 50 });
  });

  it('somar a mesma adição duas vezes acumula quantidade, não duplica linha', () => {
    useCartStore.getState().addItem(productA, 2);
    useCartStore.getState().addItem(productA, 1);

    const items = useCartStore.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(3);
  });

  it('produtos com variações diferentes viram linhas separadas no carrinho', () => {
    const variantAzul = { label: 'Cor: Azul', signature: 'Cor:Azul', priceAdjustment: 0 };
    const variantVerde = { label: 'Cor: Verde', signature: 'Cor:Verde', priceAdjustment: 5 };

    useCartStore.getState().addItem(productA, 1, variantAzul);
    useCartStore.getState().addItem(productA, 1, variantVerde);

    const items = useCartStore.getState().items;
    expect(items).toHaveLength(2);
    expect(items.find((i) => i.variantLabel === 'Cor: Azul').price).toBe(50);
    expect(items.find((i) => i.variantLabel === 'Cor: Verde').price).toBe(55); // 50 + ajuste de 5
  });

  it('preço promocional do produto é respeitado ao adicionar', () => {
    useCartStore.getState().addItem({ ...productA, promo_price: 40 });
    expect(useCartStore.getState().items[0].price).toBe(40);
  });

  it('remover item tira ele da lista', () => {
    useCartStore.getState().addItem(productA);
    const lineId = useCartStore.getState().items[0].id;
    useCartStore.getState().removeItem(lineId);
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('diminuir quantidade até zero remove o item automaticamente', () => {
    useCartStore.getState().addItem(productA, 1);
    const lineId = useCartStore.getState().items[0].id;
    useCartStore.getState().decrementItem(lineId);
    expect(useCartStore.getState().items).toHaveLength(0);
  });
});

describe('cartStore — subtotal e total', () => {
  it('getSubtotal soma preço x quantidade de todos os itens', () => {
    useCartStore.getState().addItem(productA, 2); // 100
    useCartStore.getState().addItem(productB, 1); // 30
    expect(useCartStore.getState().getSubtotal()).toBe(130);
  });

  it('sem combo aplicado, getTotalPrice é igual ao subtotal', () => {
    useCartStore.getState().addItem(productA, 1);
    const state = useCartStore.getState();
    expect(state.getTotalPrice()).toBe(state.getSubtotal());
  });
});

describe('cartStore — desconto de combo', () => {
  it('aplica desconto percentual só quando os DOIS produtos do combo estão no carrinho', () => {
    const combo = { id: 'combo-1', discount_percent: 10, discount_amount: null };
    useCartStore.getState().addCombo(combo, productA, productB);

    // 50 + 30 = 80, 10% de desconto = 8
    expect(useCartStore.getState().getComboDiscount()).toBe(8);
    expect(useCartStore.getState().getTotalPrice()).toBe(72);
  });

  it('desconto de combo some se um dos produtos for removido do carrinho', () => {
    const combo = { id: 'combo-1', discount_percent: 10, discount_amount: null };
    useCartStore.getState().addCombo(combo, productA, productB);

    const items = useCartStore.getState().items;
    const productBLineId = items.find((i) => i.productId === 'prod-b').id;
    useCartStore.getState().removeItem(productBLineId);

    expect(useCartStore.getState().getComboDiscount()).toBe(0);
  });

  it('desconto de valor fixo é aplicado por par completo', () => {
    const combo = { id: 'combo-1', discount_percent: null, discount_amount: 15 };
    useCartStore.getState().addCombo(combo, productA, productB);
    useCartStore.getState().addCombo(combo, productA, productB); // adiciona mais um par

    // 2 pares completos x R$15 de desconto fixo = R$30
    expect(useCartStore.getState().getComboDiscount()).toBe(30);
  });

  it('getTotalPrice nunca fica negativo mesmo com desconto maior que o subtotal', () => {
    const combo = { id: 'combo-1', discount_percent: null, discount_amount: 999 };
    useCartStore.getState().addCombo(combo, productA, productB);
    expect(useCartStore.getState().getTotalPrice()).toBe(0);
  });
});

describe('cartStore — clearCart', () => {
  it('limpa itens E combos aplicados', () => {
    const combo = { id: 'combo-1', discount_percent: 10, discount_amount: null };
    useCartStore.getState().addCombo(combo, productA, productB);
    useCartStore.getState().clearCart();

    expect(useCartStore.getState().items).toHaveLength(0);
    expect(useCartStore.getState().combos).toHaveLength(0);
  });
});
