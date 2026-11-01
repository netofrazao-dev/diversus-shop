import { MapPin } from 'lucide-react';
import { MIN_ORDER_VALUE } from '../../lib/constants';
import { useGlobalDiscount } from '../../lib/pricing';

const formatPrice = (value) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

/**
 * FreeShippingBanner — faixa fina no topo do site.
 * Reforça que a loja é de Breves (confiança local) e anuncia a entrega
 * sempre grátis, com o valor do pedido mínimo.
 */
export default function FreeShippingBanner() {
  const { percent } = useGlobalDiscount();
  return (
    <div className="bg-accent-green border-b-3 border-black">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center gap-2 text-center flex-wrap">
        <MapPin size={16} strokeWidth={2.5} />
        <p className="font-display font-bold text-xs sm:text-sm text-black">
          Loja de Breves-PA 🏝️ <span className="hidden sm:inline">·</span> Entrega GRÁTIS! 🎉
          Pedido mínimo de {formatPrice(MIN_ORDER_VALUE)}
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
