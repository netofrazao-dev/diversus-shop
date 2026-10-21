import { useSyncExternalStore } from 'react';

/**
 * Preço de venda — regras em um lugar só.
 *
 * Existem dois tipos de desconto:
 *  1. Promoção do produto (promo_price, com janela de datas opcional)
 *  2. Desconto da loja toda (% definido pelo admin, com data final opcional)
 * Se os dois valerem, o cliente leva o MENOR preço (não acumula).
 */

let globalDiscount = { percent: 0, endsAt: null };
const listeners = new Set();

export function setGlobalDiscount(next) {
  const percent = Number(next?.percent) || 0;
  const endsAt = next?.endsAt || null;
  if (percent === globalDiscount.percent && endsAt === globalDiscount.endsAt) return;
  globalDiscount = { percent, endsAt };
  listeners.forEach((fn) => fn());
}

/** Retorna o % de desconto geral em vigor agora (0 se não há / já expirou) */
export function getActiveGlobalPercent(now = new Date()) {
  const { percent, endsAt } = globalDiscount;
  if (!(percent > 0)) return 0;
  if (endsAt && new Date(endsAt) < now) return 0;
  return percent;
}

/** Hook: re-renderiza o componente quando o desconto geral muda */
export function useGlobalDiscount() {
  const snapshot = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => globalDiscount
  );
  return { percent: getActiveGlobalPercent(), endsAt: snapshot.endsAt };
}

/**
 * getEffectivePrice — preço "de fato" de um produto agora.
 * Retorna { isPromo, price, originalPrice, globalPercent }.
 */
export function getEffectivePrice(product) {
  const now = new Date();
  const hasPromo =
    product.promo_price != null &&
    product.promo_price < product.price &&
    (!product.promo_starts_at || new Date(product.promo_starts_at) <= now) &&
    (!product.promo_ends_at || new Date(product.promo_ends_at) >= now);

  const productPrice = hasPromo ? product.promo_price : product.price;

  const percent = getActiveGlobalPercent(now);
  const globalPrice =
    percent > 0 ? Math.round(product.price * (1 - percent / 100) * 100) / 100 : null;

  if (globalPrice != null && globalPrice < productPrice) {
    return { isPromo: true, price: globalPrice, originalPrice: product.price, globalPercent: percent };
  }

  return {
    isPromo: hasPromo,
    price: productPrice,
    originalPrice: product.price,
    globalPercent: 0,
  };
}
