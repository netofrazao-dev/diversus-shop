import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Eye, BellRing } from 'lucide-react';
import { Link } from 'react-router-dom';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import RestockRequestModal from './RestockRequestModal';

/**
 * ProductCard — Card de produto do DIVERSUS SHOP
 *
 * Usado no Catálogo, na Home ("Mais Vendidos" / "Lançamentos")
 * e em listagens de busca.
 *
 * props:
 *  - product: { id, name, price, compare_at_price, image_url, is_featured, is_new, is_sold_out }
 *  - onAddToCart: fn(product) — chamado ao clicar no botão de carrinho
 */
export default function ProductCard({ product, onAddToCart }) {
  const [restockModalOpen, setRestockModalOpen] = useState(false);
  const {
    id,
    name,
    price,
    compare_at_price: compareAtPrice,
    image_url: imageUrl,
    is_featured: isFeatured,
    is_new: isNew,
    is_sold_out: isSoldOut,
  } = product;

  const hasDiscount = compareAtPrice && compareAtPrice > price;
  const formatPrice = (value) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="
        group relative flex flex-col
        bg-white rounded-2xl border-3 border-black
        shadow-cartoon overflow-hidden
      "
    >
      {/* Tags */}
      {(isFeatured || isNew || isSoldOut) && (
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
          {isSoldOut && <Badge color="pink">ESGOTADO</Badge>}
          {!isSoldOut && isNew && <Badge color="secondary">NOVIDADE</Badge>}
          {!isSoldOut && isFeatured && <Badge color="yellow">MAIS VENDIDO</Badge>}
        </div>
      )}

      {/* Imagem */}
      <Link to={`/produto/${id}`} className="block relative aspect-square overflow-hidden bg-primary-50 border-b-3 border-black">
        <img
          src={imageUrl || '/placeholder-product.png'}
          alt={name}
          className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 ${isSoldOut ? 'grayscale opacity-70' : ''}`}
          loading="lazy"
        />

        {/* Overlay "ver produto" no hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <span className="flex items-center gap-1.5 bg-white border-2 border-black rounded-full px-4 py-2 font-display font-semibold text-sm shadow-cartoon-sm">
            <Eye size={16} strokeWidth={2.5} />
            Ver produto
          </span>
        </div>
      </Link>

      {/* Conteúdo */}
      <div className="flex flex-col gap-2 p-4 flex-1">
        <h3 className="font-display font-semibold text-black text-base leading-snug line-clamp-2">
          {name}
        </h3>

        <div className="flex items-baseline gap-2 mt-auto">
          {hasDiscount && (
            <span className="text-sm text-black/40 line-through font-body">
              {formatPrice(compareAtPrice)}
            </span>
          )}
          <span className="font-display font-bold text-xl text-primary">
            {formatPrice(price)}
          </span>
        </div>

        {isSoldOut ? (
          <Button
            variant="outline"
            size="md"
            icon={BellRing}
            isFullWidth
            onClick={() => setRestockModalOpen(true)}
            className="mt-2"
          >
            Avise-me
          </Button>
        ) : (
          <Button
            variant="primary"
            size="md"
            icon={ShoppingCart}
            isFullWidth
            onClick={() => onAddToCart?.(product)}
            className="mt-2"
          >
            Adicionar
          </Button>
        )}
      </div>

      <RestockRequestModal
        product={product}
        isOpen={restockModalOpen}
        onClose={() => setRestockModalOpen(false)}
      />
    </motion.div>
  );
}
