import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { motion } from 'framer-motion';
import { Copy, Check, QrCode } from 'lucide-react';
import { buildPixPayload, getStorePixConfig } from '../../lib/pix';
import Button from '../ui/Button';

const formatPrice = (value) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

/**
 * PixPayment — tela de pagamento via Pix (QR Code + copia e cola)
 * exibida logo depois que o pedido é criado, antes de voltar pra loja.
 */
export default function PixPayment({ amount, orderShortId, onContinue }) {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [payload, setPayload] = useState('');

  useEffect(() => {
    const { pixKey, merchantName, merchantCity } = getStorePixConfig();
    const code = buildPixPayload({
      pixKey,
      merchantName,
      merchantCity,
      amount,
      txid: orderShortId,
    });
    setPayload(code);
    QRCode.toDataURL(code, { width: 260, margin: 1 }).then(setQrDataUrl);
  }, [amount, orderShortId]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(payload);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // navegadores muito antigos podem não suportar clipboard API — sem problema,
      // o cliente ainda consegue selecionar o texto manualmente
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border-4 border-black rounded-3xl shadow-cartoon-lg p-6 sm:p-8 max-w-md mx-auto flex flex-col items-center gap-4 text-center"
    >
      <div className="bg-primary-100 border-3 border-black rounded-full p-3">
        <QrCode size={28} className="text-primary" />
      </div>

      <h2 className="font-display font-bold text-2xl">Pague com Pix</h2>
      <p className="text-black/60 text-sm -mt-2">
        Escaneie o QR Code ou copie o código abaixo no app do seu banco. Depois de pagar, clique
        no botão abaixo pra confirmar — vamos te levar direto pro WhatsApp da loja com o resumo
        do pedido, e é só mandar o comprovante por lá.
      </p>

      <p className="font-display font-bold text-3xl text-primary">{formatPrice(amount)}</p>

      {qrDataUrl ? (
        <img
          src={qrDataUrl}
          alt="QR Code Pix"
          className="w-56 h-56 border-3 border-black rounded-2xl shadow-cartoon-sm"
        />
      ) : (
        <div className="w-56 h-56 border-3 border-black rounded-2xl bg-primary-50 animate-pulse" />
      )}

      <div className="w-full flex flex-col gap-2">
        <div className="bg-primary-50 border-2 border-black rounded-xl px-3 py-2 text-xs font-mono break-all text-left max-h-20 overflow-y-auto">
          {payload}
        </div>
        <Button
          variant={copied ? 'secondary' : 'outline'}
          icon={copied ? Check : Copy}
          onClick={handleCopy}
          isFullWidth
        >
          {copied ? 'Código copiado!' : 'Copiar código Pix'}
        </Button>
      </div>

      <Button variant="primary" size="lg" isFullWidth onClick={onContinue} className="mt-2">
        Já paguei / enviar pedido no WhatsApp
      </Button>
    </motion.div>
  );
}
