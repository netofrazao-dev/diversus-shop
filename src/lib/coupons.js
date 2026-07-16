import { supabase } from './supabaseClient';

/**
 * validateCoupon — valida um cupom digitado pelo cliente.
 *
 * Usa a função validate_coupon() do banco (RPC) em vez de consultar a
 * tabela "coupons" direto — assim os códigos promocionais não ficam
 * expostos publicamente (a tabela só permite leitura para admins).
 *
 * @param {string} rawCode - código digitado pelo cliente
 * @param {number} subtotal - subtotal do carrinho (já com desconto de combo, sem taxa de entrega)
 * @returns {Promise<{ coupon: object, discount: number } | { error: string }>}
 */
export async function validateCoupon(rawCode, subtotal) {
  const code = rawCode.trim().toUpperCase();
  if (!code) return { error: 'Digite um código de cupom.' };

  const { data, error } = await supabase.rpc('validate_coupon', {
    p_code: code,
    p_order_total: subtotal,
  });

  if (error) {
    console.error(error);
    return { error: 'Não foi possível validar o cupom agora. Tente novamente.' };
  }

  const result = data?.[0];

  if (!result || result.message !== 'ok') {
    return { error: result?.message || 'Cupom inválido ou expirado.' };
  }

  const discount =
    result.discount_type === 'percent'
      ? (subtotal * Number(result.discount_value)) / 100
      : Number(result.discount_value);

  // O desconto nunca pode ser maior que o próprio subtotal
  const cappedDiscount = Math.min(discount, subtotal);

  return {
    coupon: {
      id: result.id,
      code: result.code,
      discount_type: result.discount_type,
      discount_value: result.discount_value,
    },
    discount: cappedDiscount,
  };
}
