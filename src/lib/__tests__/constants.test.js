import { describe, it, expect } from 'vitest';
import {
  getDeliveryFee,
  amountMissingForFreeDelivery,
  FREE_DELIVERY_MIN_ORDER,
  DELIVERY_FEE_BELOW_MIN,
} from '../constants';

/**
 * Regra de entrega — isso é dinheiro, então fica travado por teste.
 * Padrão: compras a partir de R$ 15 têm entrega grátis; abaixo, R$ 2.
 */

describe('getDeliveryFee', () => {
  it('cobra a taxa quando a compra está abaixo do mínimo', () => {
    expect(getDeliveryFee(0)).toBe(DELIVERY_FEE_BELOW_MIN);
    expect(getDeliveryFee(5)).toBe(DELIVERY_FEE_BELOW_MIN);
    expect(getDeliveryFee(FREE_DELIVERY_MIN_ORDER - 0.01)).toBe(DELIVERY_FEE_BELOW_MIN);
  });

  it('entrega de graça exatamente no valor mínimo', () => {
    expect(getDeliveryFee(FREE_DELIVERY_MIN_ORDER)).toBe(0);
  });

  it('entrega de graça acima do valor mínimo', () => {
    expect(getDeliveryFee(FREE_DELIVERY_MIN_ORDER + 0.01)).toBe(0);
    expect(getDeliveryFee(FREE_DELIVERY_MIN_ORDER * 3)).toBe(0);
  });
});

describe('amountMissingForFreeDelivery', () => {
  it('diz quanto falta pra ganhar o frete grátis', () => {
    expect(amountMissingForFreeDelivery(0)).toBe(FREE_DELIVERY_MIN_ORDER);
    expect(amountMissingForFreeDelivery(10)).toBeCloseTo(FREE_DELIVERY_MIN_ORDER - 10, 2);
  });

  it('não mostra valor negativo quando já ganhou o frete grátis', () => {
    expect(amountMissingForFreeDelivery(FREE_DELIVERY_MIN_ORDER)).toBe(0);
    expect(amountMissingForFreeDelivery(FREE_DELIVERY_MIN_ORDER + 50)).toBe(0);
  });
});

describe('configuração padrão da loja', () => {
  it('usa R$ 15 de mínimo e R$ 2 de taxa quando nada é configurado', () => {
    expect(FREE_DELIVERY_MIN_ORDER).toBe(15);
    expect(DELIVERY_FEE_BELOW_MIN).toBe(2);
  });
});
