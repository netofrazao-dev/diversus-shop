import { MapPin } from 'lucide-react';
import { FREE_DELIVERY_MIN_ORDER } from '../../lib/constants';
import { useGlobalDiscount } from '../../lib/pricing';

const formatPrice = (value) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

/**
 * FreeShippingBanner — faixa fina no topo do site.
 * Reforça que a loja é de Breves (confiança local) e anuncia a regra de
 * frete grátis a partir do valor mínimo.
 */
export default function FreeShippingBanner() {
  const { percent } = useGlobalDiscount();
  return (
    <div className="bg-accent-green border-b-3 border-black">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center gap-2 text-center flex-wrap">
        <MapPin size={16} strokeWidth={2.5} />
        <p className="font-display font-bold text-xs sm:text-sm text-black">
          Loja de Breves-PA 🏝️ <span className="hidden sm:inline">·</span> Frete GRÁTIS em compras
          a partir de {formatPrice(FREE_DELIVERY_MIN_ORDER)}! 🎉
          {percent > 0 && (
            <>
              {' '}<span className="hidden sm:inline">·</span> 🔥 {percent}% OFF na loja toda!
            </>
          )}
        </p>
      </div>
    </div>
  );
}
