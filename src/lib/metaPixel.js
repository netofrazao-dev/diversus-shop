/**
 * metaPixel.js — integração com o Pixel do Meta (Facebook/Instagram Ads)
 *
 * Usado pra medir resultado de anúncio: quantas pessoas viram um produto,
 * adicionaram ao carrinho, começaram a comprar e finalizaram — e permite
 * criar públicos personalizados/semelhantes no Gerenciador de Anúncios.
 *
 * Configuração: preencha VITE_META_PIXEL_ID no .env com o ID do seu Pixel
 * (Gerenciador de Eventos → Fontes de dados → seu Pixel → ID do Pixel).
 * Se deixar em branco, nada é carregado — o site funciona normal.
 */

const PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID || '';

export const isPixelConfigured = () => !!PIXEL_ID;

/**
 * initMetaPixel — injeta o script oficial do Pixel no <head> e dispara o
 * primeiro PageView. Chame isso UMA VEZ, no carregamento do app.
 */
export function initMetaPixel() {
  if (!isPixelConfigured() || typeof window === 'undefined') return;
  if (window.fbq) return; // já inicializado, evita duplicar

  /* eslint-disable */
  !(function (f, b, e, v, n, t, s) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = '2.0';
    n.queue = [];
    t = b.createElement(e);
    t.async = true;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
  /* eslint-enable */

  window.fbq('init', PIXEL_ID);
  window.fbq('track', 'PageView');
}

/**
 * trackPixelPageView — dispara PageView numa troca de rota (o site é uma
 * SPA, então só o carregamento inicial não é suficiente pra medir navegação).
 */
export function trackPixelPageView() {
  if (!isPixelConfigured() || !window.fbq) return;
  window.fbq('track', 'PageView');
}

/**
 * trackViewContent — cliente abriu a página de um produto.
 */
export function trackViewContent(product) {
  if (!isPixelConfigured() || !window.fbq) return;
  window.fbq('track', 'ViewContent', {
    content_ids: [product.id],
    content_name: product.name,
    content_type: 'product',
    value: Number(product.promo_price ?? product.price),
    currency: 'BRL',
  });
}

/**
 * trackAddToCart — cliente adicionou um produto ao carrinho.
 */
export function trackAddToCart(product, quantity = 1) {
  if (!isPixelConfigured() || !window.fbq) return;
  window.fbq('track', 'AddToCart', {
    content_ids: [product.id],
    content_name: product.name,
    content_type: 'product',
    value: Number(product.promo_price ?? product.price) * quantity,
    currency: 'BRL',
  });
}

/**
 * trackInitiateCheckout — cliente chegou na tela de checkout.
 */
export function trackInitiateCheckout(items, total) {
  if (!isPixelConfigured() || !window.fbq) return;
  window.fbq('track', 'InitiateCheckout', {
    content_ids: items.map((i) => i.productId),
    num_items: items.reduce((sum, i) => sum + i.quantity, 0),
    value: total,
    currency: 'BRL',
  });
}

/**
 * trackPurchase — pedido confirmado com sucesso. O evento mais importante
 * pra otimização de anúncio (é o que o Meta usa pra achar mais compradores).
 */
export function trackPurchase(items, total, orderId) {
  if (!isPixelConfigured() || !window.fbq) return;
  window.fbq('track', 'Purchase', {
    content_ids: items.map((i) => i.productId),
    num_items: items.reduce((sum, i) => sum + i.quantity, 0),
    value: total,
    currency: 'BRL',
    order_id: orderId,
  });
}
