/**
 * Caminho da imagem "sem foto", usando o BASE_URL do Vite — assim
 * funciona tanto em domínio raiz (Vercel/Netlify) quanto em subpasta
 * (ex: GitHub Pages), sem precisar trocar nada manualmente.
 */
export const PLACEHOLDER_IMAGE = `${import.meta.env.BASE_URL}placeholder-product.png`;

/**
 * Regra de pedido da loja:
 *  - Pedido mínimo de MIN_ORDER_VALUE → abaixo disso não dá pra finalizar
 *  - A entrega é SEMPRE GRÁTIS (não existe mais taxa de entrega)
 *
 * O mínimo pode ser mudado sem mexer no código, pela variável de ambiente
 * VITE_MIN_ORDER.
 *
 * O valor considerado é o total dos produtos já com desconto de combo
 * (o mesmo nos dois lugares: carrinho e checkout), ANTES do cupom, de
 * propósito: assim o cupom nunca "trava" um pedido que o cliente já tinha
 * visto liberado no carrinho.
 */
export const MIN_ORDER_VALUE = Number(import.meta.env.VITE_MIN_ORDER ?? 25);

// Compara em centavos pra soma de preços quebrados (ex: 8,30 x 3) não
// ficar 1 centavo "abaixo" do mínimo por erro de arredondamento.
const toCents = (value) => Math.round(value * 100);

/** true quando o pedido já atingiu o valor mínimo */
export function reachesMinOrder(orderValue) {
  return toCents(orderValue) >= toCents(MIN_ORDER_VALUE);
}

/** Quanto ainda falta pra atingir o pedido mínimo (0 se já atingiu) */
export function amountMissingForMinOrder(orderValue) {
  return Math.max(0, toCents(MIN_ORDER_VALUE) - toCents(orderValue)) / 100;
}

/** Aviso sobre o horário das entregas, mostrado no carrinho e no checkout. */
export const DELIVERY_TIME_NOTE = 'As entregas começam a partir das 15h30.';

/** Identificação legal da empresa (exigido por lei em sites de venda no Brasil) */
export const STORE_LEGAL_NAME = import.meta.env.VITE_STORE_LEGAL_NAME || '';
export const STORE_DOCUMENT = import.meta.env.VITE_STORE_DOCUMENT || '';
export const hasLegalInfo = () => !!(STORE_LEGAL_NAME && STORE_DOCUMENT);
