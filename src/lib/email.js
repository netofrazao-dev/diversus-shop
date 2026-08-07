import emailjs from '@emailjs/browser';

/**
 * email.js — envio de e-mail de confirmação de pedido via EmailJS
 * (funciona 100% no navegador, sem servidor).
 *
 * Configuração (variáveis de ambiente):
 *  - VITE_EMAILJS_PUBLIC_KEY    : chave pública da sua conta EmailJS
 *  - VITE_EMAILJS_SERVICE_ID    : ID do serviço de e-mail conectado
 *  - VITE_EMAILJS_TEMPLATE_STORE: template do e-mail que VOCÊ (loja) recebe
 *  - VITE_EMAILJS_TEMPLATE_CUSTOMER: template do e-mail que o CLIENTE recebe
 *  - VITE_STORE_EMAIL           : e-mail da loja (pra onde chega o aviso de novo pedido)
 *
 * Se essas variáveis não estiverem preenchidas, o envio é simplesmente
 * pulado — o pedido continua funcionando normal (o e-mail é um extra).
 */

const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || '';
const TEMPLATE_STORE = import.meta.env.VITE_EMAILJS_TEMPLATE_STORE || '';
const TEMPLATE_CUSTOMER = import.meta.env.VITE_EMAILJS_TEMPLATE_CUSTOMER || '';
const STORE_EMAIL = import.meta.env.VITE_STORE_EMAIL || '';

export const isEmailConfigured = () => !!(PUBLIC_KEY && SERVICE_ID);

const formatPrice = (value) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

/**
 * Monta o resumo do pedido em texto simples, usado dentro do e-mail.
 */
function buildOrderSummary(items, total, deliveryFee, coupon) {
  const lines = items.map((item) => {
    const variant = item.variantLabel ? ` (${item.variantLabel})` : '';
    return `${item.quantity}x ${item.name}${variant} — ${formatPrice(item.price * item.quantity)}`;
  });
  if (deliveryFee) lines.push(`Taxa de entrega: ${formatPrice(deliveryFee)}`);
  if (coupon) lines.push(`Cupom ${coupon.code}: -${formatPrice(coupon.discount)}`);
  lines.push(`TOTAL: ${formatPrice(total)}`);
  return lines.join('\n');
}

/**
 * Envia os e-mails de confirmação — um pra loja, outro pro cliente (se ele
 * tiver informado e-mail). Nunca lança erro pra fora: se falhar, só avisa no
 * console, sem travar a finalização do pedido.
 */
export async function sendOrderEmails({ orderShortId, customer, items, total, deliveryFee, coupon }) {
  if (!isEmailConfigured()) return;

  const address = `${customer.street}, ${customer.number}${
    customer.complement ? ' - ' + customer.complement : ''
  } — ${customer.neighborhood}`;

  const summary = buildOrderSummary(items, total, deliveryFee, coupon);

  const commonParams = {
    order_id: orderShortId,
    customer_name: customer.name,
    customer_phone: customer.phone,
    customer_email: customer.email || '(não informado)',
    address,
    order_summary: summary,
    total: formatPrice(total),
  };

  const tasks = [];

  // E-mail pra loja
  if (TEMPLATE_STORE && STORE_EMAIL) {
    tasks.push(
      emailjs.send(SERVICE_ID, TEMPLATE_STORE, { ...commonParams, to_email: STORE_EMAIL }, {
        publicKey: PUBLIC_KEY,
      })
    );
  }

  // E-mail pro cliente (só se ele informou um e-mail)
  if (TEMPLATE_CUSTOMER && customer.email) {
    tasks.push(
      emailjs.send(SERVICE_ID, TEMPLATE_CUSTOMER, { ...commonParams, to_email: customer.email }, {
        publicKey: PUBLIC_KEY,
      })
    );
  }

  try {
    await Promise.allSettled(tasks);
  } catch (err) {
    console.error('Falha ao enviar e-mail de confirmação:', err);
  }
}
