import { Truck } from 'lucide-react';
import { IS_FREE_DELIVERY } from '../../lib/constants';

/**
 * FreeShippingBanner — faixa fina no topo do site anunciando frete grátis.
 * Só aparece quando a entrega é realmente gratuita (IS_FREE_DELIVERY).
 */
export default function FreeShippingBanner() {
  if (!IS_FREE_DELIVERY) return null;

  return (
    <div className="bg-accent-green border-b-3 border-black">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center gap-2 text-center">
        <Truck size={16} strokeWidth={2.5} />
        <p className="font-display font-bold text-sm text-black">
          FRETE GRÁTIS em toda a loja! 🎉
        </p>
      </div>
    </div>
  );
}
