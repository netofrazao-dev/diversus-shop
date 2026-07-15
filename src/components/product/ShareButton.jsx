import { useState } from 'react';
import { Share2, Check, MessageCircle } from 'lucide-react';

/**
 * ShareButton — compartilha o link atual usando a Web Share API nativa
 * (funciona muito bem no celular — abre o menu de compartilhar do sistema,
 * incluindo Instagram, WhatsApp, etc). No desktop, cai num fallback simples
 * de "copiar link" já que a maioria dos navegadores de mesa não suporta
 * a Web Share API.
 */
export default function ShareButton({ title, text, className = '' }) {
  const [copied, setCopied] = useState(false);
  const canNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

  const handleShare = async () => {
    const url = window.location.href;

    if (canNativeShare) {
      try {
        await navigator.share({ title, text, url });
      } catch {
        // usuário cancelou o compartilhamento — não é um erro de verdade
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard indisponível — sem problema, botão só não dá feedback visual
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className={`
        inline-flex items-center gap-2 bg-white border-3 border-black rounded-2xl
        px-4 py-2.5 font-display font-semibold text-sm shadow-cartoon-sm
        active:translate-y-0.5 active:shadow-none transition-all hover:bg-secondary/30
        ${className}
      `}
    >
      {copied ? (
        <>
          <Check size={16} /> Link copiado!
        </>
      ) : canNativeShare ? (
        <>
          <Share2 size={16} /> Compartilhar
        </>
      ) : (
        <>
          <MessageCircle size={16} /> Copiar link
        </>
      )}
    </button>
  );
}
