import { describe, it, expect } from 'vitest';
import {
  reachesMinOrder,
  amountMissingForMinOrder,
  MIN_ORDER_VALUE,
} from '../constants';

/**
 * Regra do pedido mínimo — isso é dinheiro, então fica travado por teste.
 * Padrão: pedido mínimo de R$ 25, com entrega sempre grátis.
 */

describe('reachesMinOrder', () => {
  it('bloqueia pedido abaixo do mínimo', () => {
    expect(reachesMinOrder(0)).toBe(false);
    expect(reachesMinOrder(5)).toBe(false);
    expect(reachesMinOrder(MIN_ORDER_VALUE - 0.01)).toBe(false);
  });

  it('libera pedido exatamente no valor mínimo', () => {
    expect(reachesMinOrder(MIN_ORDER_VALUE)).toBe(true);
  });

  it('libera pedido acima do valor mínimo', () => {
    expect(reachesMinOrder(MIN_ORDER_VALUE + 0.01)).toBe(true);
    expect(reachesMinOrder(MIN_ORDER_VALUE * 3)).toBe(true);
  });

  it('não trava por erro de arredondamento na soma dos preços', () => {
    // 0.1 + 0.2 = 0.30000000000000004 no JavaScript
    expect(reachesMinOrder(MIN_ORDER_VALUE - 0.3 + 0.1 + 0.2)).toBe(true);
  });
});

describe('amountMissingForMinOrder', () => {
  it('diz quanto falta pra atingir o pedido mínimo', () => {
    expect(amountMissingForMinOrder(0)).toBe(MIN_ORDER_VALUE);
    expect(amountMissingForMinOrder(10)).toBe(MIN_ORDER_VALUE - 10);
    expect(amountMissingForMinOrder(MIN_ORDER_VALUE - 0.1)).toBe(0.1);
  });

  it('não mostra valor negativo quando já atingiu o mínimo', () => {
    expect(amountMissingForMinOrder(MIN_ORDER_VALUE)).toBe(0);
    expect(amountMissingForMinOrder(MIN_ORDER_VALUE + 50)).toBe(0);
  });
});

describe('configuração padrão da loja', () => {
  it('usa R$ 25 de pedido mínimo quando nada é configurado', () => {
    expect(MIN_ORDER_VALUE).toBe(25);
  });
});
