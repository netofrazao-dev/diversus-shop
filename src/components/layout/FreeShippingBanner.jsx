import { MapPin } from 'lucide-react';
import { IS_FREE_DELIVERY } from '../../lib/constants';

/**
 * FreeShippingBanner — faixa fina no topo do site.
 * Sempre reforça que a loja é de Breves (confiança local), e quando a
 * entrega é gratuita, junta o "frete grátis" na mesma mensagem.
 */
export default function FreeShippingBanner() {
  return (
    <div className="bg-accent-green border-b-3 border-black">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center gap-2 text-center flex-wrap">
        <MapPin size={16} strokeWidth={2.5} />
        <p className="font-display font-bold text-xs sm:text-sm text-black">
          Loja de Breves-PA 🏝️
          {IS_FREE_DELIVERY && (
            <>
              {' '}
              <span className="hidden sm:inline">·</span> Frete GRÁTIS aqui na cidade! 🎉
            </>
          )}
        </p>
      </div>
    </div>
  );
}
