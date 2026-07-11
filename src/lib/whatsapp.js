/**
 * whatsapp — Formata a mensagem do pedido e abre a conversa com a loja via wa.me
 */

const formatPrice = (value) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

/**
 * Monta a mensagem de texto do pedido para enviar via WhatsApp.
 * customer: { name, phone, email, cep, street, number, complement, neighborhood, city, state }
 * items: [{ name, price, quantity }]
 */
export function buildOrderMessage(customer, items, total) {
  const lines = [];

  lines.push('🛍️ *NOVO PEDIDO — DIVERSUS SHOP*');
  lines.push('');
  lines.push('*Cliente:*');
  lines.push(customer.name);
  lines.push(customer.phone);
  if (customer.email) lines.push(customer.email);
  lines.push('');
  lines.push('*Endereço de entrega:*');
  lines.push(
    `${customer.street}, ${customer.number}${customer.complement ? ' - ' + customer.complement : ''}`
  );
  lines.push(customer.neighborhood);
  lines.push('');
  lines.push('*Itens do pedido:*');
  items.forEach((item) => {
    const variantSuffix = item.variantLabel ? ` (${item.variantLabel})` : '';
    lines.push(
      `• ${item.quantity}x ${item.name}${variantSuffix} — ${formatPrice(item.price * item.quantity)}`
    );
  });
  lines.push('');
  lines.push(`*Total: ${formatPrice(total)}*`);

  return lines.join('\n');
}

/**
 * Abre o WhatsApp (wa.me) com a mensagem do pedido já preenchida.
 * storePhone deve estar no formato internacional sem símbolos, ex: 5591999999999
 */
export function openWhatsAppOrder(storePhone, customer, items, total) {
  const message = buildOrderMessage(customer, items, total);
  const url = `https://wa.me/${storePhone}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}
