/**
 * Caminho da imagem "sem foto", usando o BASE_URL do Vite — assim
 * funciona tanto em domínio raiz (Vercel/Netlify) quanto em subpasta
 * (ex: GitHub Pages), sem precisar trocar nada manualmente.
 */
export const PLACEHOLDER_IMAGE = `${import.meta.env.BASE_URL}placeholder-product.png`;

/** Taxa de entrega fixa, somada ao total no carrinho e no checkout. */
export const DELIVERY_FEE = Number(import.meta.env.VITE_DELIVERY_FEE ?? 1);

/** Aviso sobre o horário das entregas, mostrado no carrinho e no checkout. */
export const DELIVERY_TIME_NOTE = 'As entregas começam a partir das 15h30.';
