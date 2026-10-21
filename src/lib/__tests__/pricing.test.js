import { describe, it, expect, beforeEach } from 'vitest';
import { getEffectivePrice, setGlobalDiscount, getActiveGlobalPercent } from '../pricing';

beforeEach(() => setGlobalDiscount({ percent: 0, endsAt: null }));

const product = { price: 50 };
const day = 86400000;

describe('desconto da loja toda', () => {
  it('sem desconto: preço normal', () => {
    expect(getEffectivePrice(product)).toMatchObject({ isPromo: false, price: 50 });
  });

  it('aplica o % sobre o preço do produto', () => {
    setGlobalDiscount({ percent: 10, endsAt: null });
    expect(getEffectivePrice(product)).toMatchObject({ isPromo: true, price: 45, originalPrice: 50, globalPercent: 10 });
  });

  it('desconto vencido não vale', () => {
    setGlobalDiscount({ percent: 10, endsAt: new Date(Date.now() - day).toISOString() });
    expect(getActiveGlobalPercent()).toBe(0);
    expect(getEffectivePrice(product).price).toBe(50);
  });

  it('desconto com data futura vale', () => {
    setGlobalDiscount({ percent: 20, endsAt: new Date(Date.now() + day).toISOString() });
    expect(getEffectivePrice(product).price).toBe(40);
  });

  it('não soma com promoção: vale o menor preço', () => {
    setGlobalDiscount({ percent: 10, endsAt: null }); // 45
    expect(getEffectivePrice({ price: 50, promo_price: 40 }).price).toBe(40);
    expect(getEffectivePrice({ price: 50, promo_price: 48 }).price).toBe(45);
  });

  it('arredonda em centavos', () => {
    setGlobalDiscount({ percent: 15, endsAt: null });
    expect(getEffectivePrice({ price: 9.99 }).price).toBe(8.49);
  });

  it('promoção própria expirada é ignorada', () => {
    const expired = { price: 50, promo_price: 30, promo_ends_at: new Date(Date.now() - day).toISOString() };
    expect(getEffectivePrice(expired).price).toBe(50);
  });
});
