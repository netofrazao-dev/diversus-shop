/**
 * pix.js — Gera o "Pix Copia e Cola" (BR Code) estático, seguindo o
 * padrão EMV do Banco Central. Não depende de nenhum gateway/API —
 * é só matemática/formatação de texto, funciona 100% no navegador.
 */

// Remove acentos e caracteres fora do padrão aceito pelo BR Code
const sanitize = (text) =>
  (text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .trim();

// Monta um campo EMV: ID (2 dígitos) + tamanho (2 dígitos) + valor
const emv = (id, value) => {
  const length = String(value.length).padStart(2, '0');
  return `${id}${length}${value}`;
};

// CRC16-CCITT (polinômio 0x1021, valor inicial 0xFFFF) — exigido no final do payload
function crc16(payload) {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = (crc & 0x8000) !== 0 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

/**
 * buildPixPayload — gera a string do "Pix Copia e Cola"
 *
 * @param {string} pixKey - chave Pix da loja (CPF, CNPJ, e-mail, telefone ou chave aleatória)
 * @param {string} merchantName - nome do recebedor (até 25 caracteres)
 * @param {string} merchantCity - cidade do recebedor (até 15 caracteres)
 * @param {number} amount - valor da cobrança (opcional)
 * @param {string} txid - identificador da transação (opcional, até 25 caracteres alfanuméricos)
 */
export function buildPixPayload({ pixKey, merchantName, merchantCity, amount, txid }) {
  const merchantAccountInfo = emv('26', emv('00', 'br.gov.bcb.pix') + emv('01', pixKey));

  const name = sanitize(merchantName).slice(0, 25).toUpperCase() || 'LOJA';
  const city = sanitize(merchantCity).slice(0, 15).toUpperCase() || 'BRASIL';
  const cleanTxid = sanitize(txid).replace(/\s/g, '').slice(0, 25) || '***';

  let payload =
    emv('00', '01') + // Payload Format Indicator
    merchantAccountInfo +
    emv('52', '0000') + // Merchant Category Code
    emv('53', '986') + // Moeda: Real (BRL)
    (amount ? emv('54', Number(amount).toFixed(2)) : '') +
    emv('58', 'BR') +
    emv('59', name) +
    emv('60', city) +
    emv('62', emv('05', cleanTxid));

  payload += '6304'; // ID + tamanho do campo do CRC (o valor vem calculado depois)
  return payload + crc16(payload);
}

/** Configuração da loja lida das variáveis de ambiente */
export function getStorePixConfig() {
  return {
    pixKey: import.meta.env.VITE_STORE_PIX_KEY || '',
    merchantName: import.meta.env.VITE_STORE_PIX_NAME || 'DIVERSUS SHOP',
    merchantCity: import.meta.env.VITE_STORE_PIX_CITY || 'BRASIL',
  };
}

export const isPixConfigured = () => !!import.meta.env.VITE_STORE_PIX_KEY;
