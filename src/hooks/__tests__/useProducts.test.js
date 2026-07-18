import { describe, it, expect } from 'vitest';
import { getEffectivePrice } from '../useProducts';

/**
 * getEffectivePrice já "sumiu" sem querer numa reescrita do arquivo (bug
 * real encontrado na varredura de ponta a ponta) — quebrava a exibição
 * de preço em Home, Catálogo e recomendações. Esses testes garantem que,
 * se isso voltar a acontecer, o teste falha antes de ir pro ar.
 */

describe('getEffectivePrice', () => {
  it('sem promoção, retorna o preço normal', () => {
    const product = { price: 100, promo_price: null };
    const result = getEffectivePrice(product);

    expect(result.isPromo).toBe(false);
    expect(result.price).toBe(100);
    expect(result.originalPrice).toBe(100);
  });

  it('com promo_price menor que o preço, sem datas — promoção sempre ativa', () => {
    const product = { price: 100, promo_price: 80 };
    const result = getEffectivePrice(product);

    expect(result.isPromo).toBe(true);
    expect(result.price).toBe(80);
    expect(result.originalPrice).toBe(100);
  });

  it('ignora promo_price se ele for maior ou igual ao preço normal (dado inconsistente)', () => {
    const product = { price: 100, promo_price: 120 };
    const result = getEffectivePrice(product);

    expect(result.isPromo).toBe(false);
    expect(result.price).toBe(100);
  });

  it('promoção com janela de datas: ativa quando a data atual está dentro do período', () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString();
    const tomorrow = new Date(Date.now() + 86400000).toISOString();

    const product = {
      price: 100,
      promo_price: 70,
      promo_starts_at: yesterday,
      promo_ends_at: tomorrow,
    };

    const result = getEffectivePrice(product);
    expect(result.isPromo).toBe(true);
    expect(result.price).toBe(70);
  });

  it('promoção com janela de datas: inativa se ainda não começou', () => {
    const tomorrow = new Date(Date.now() + 86400000).toISOString();
    const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString();

    const product = {
      price: 100,
      promo_price: 70,
      promo_starts_at: tomorrow,
      promo_ends_at: nextWeek,
    };

    const result = getEffectivePrice(product);
    expect(result.isPromo).toBe(false);
    expect(result.price).toBe(100);
  });

  it('promoção com janela de datas: inativa se já acabou', () => {
    const lastWeek = new Date(Date.now() - 7 * 86400000).toISOString();
    const yesterday = new Date(Date.now() - 86400000).toISOString();

    const product = {
      price: 100,
      promo_price: 70,
      promo_starts_at: lastWeek,
      promo_ends_at: yesterday,
    };

    const result = getEffectivePrice(product);
    expect(result.isPromo).toBe(false);
    expect(result.price).toBe(100);
  });
});
