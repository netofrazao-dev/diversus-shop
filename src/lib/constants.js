/**
 * Caminho da imagem "sem foto", usando o BASE_URL do Vite — assim
 * funciona tanto em domínio raiz (Vercel/Netlify) quanto em subpasta
 * (ex: GitHub Pages), sem precisar trocar nada manualmente.
 */
export const PLACEHOLDER_IMAGE = `${import.meta.env.BASE_URL}placeholder-product.png`;

/**
 * Regra de entrega da loja:
 *  - Compras a partir de FREE_DELIVERY_MIN_ORDER → entrega GRÁTIS
 *  - Abaixo disso → cobra DELIVERY_FEE_BELOW_MIN
 *
 * Os dois valores podem ser mudados sem mexer no código, pelas variáveis
 * de ambiente VITE_FREE_DELIVERY_MIN e VITE_DELIVERY_FEE.
 */
export const FREE_DELIVERY_MIN_ORDER = Number(import.meta.env.VITE_FREE_DELIVERY_MIN ?? 15);
export const DELIVERY_FEE_BELOW_MIN = Number(import.meta.env.VITE_DELIVERY_FEE ?? 2);

/**
 * getDeliveryFee — quanto custa a entrega pra um determinado valor de compra.
 * O valor considerado é o total dos produtos já com desconto de combo
 * (o mesmo nos dois lugares: carrinho e checkout), de propósito: assim o
 * cupom nunca "tira" o frete grátis que o cliente já tinha visto no carrinho.
 */
export function getDeliveryFee(orderValue) {
  return orderValue >= FREE_DELIVERY_MIN_ORDER ? 0 : DELIVERY_FEE_BELOW_MIN;
}

/** Quanto ainda falta pra ganhar frete grátis (0 se já ganhou) */
export function amountMissingForFreeDelivery(orderValue) {
  return Math.max(0, FREE_DELIVERY_MIN_ORDER - orderValue);
}

/** true quando a loja oferece frete grátis em alguma condição */
export const HAS_FREE_DELIVERY_OFFER = DELIVERY_FEE_BELOW_MIN >= 0;

/** Aviso sobre o horário das entregas, mostrado no carrinho e no checkout. */
export const DELIVERY_TIME_NOTE = 'As entregas começam a partir das 15h30.';

/** Identificação legal da empresa (exigido por lei em sites de venda no Brasil) */
export const STORE_LEGAL_NAME = import.meta.env.VITE_STORE_LEGAL_NAME || '';
export const STORE_DOCUMENT = import.meta.env.VITE_STORE_DOCUMENT || '';
export const hasLegalInfo = () => !!(STORE_LEGAL_NAME && STORE_DOCUMENT);
