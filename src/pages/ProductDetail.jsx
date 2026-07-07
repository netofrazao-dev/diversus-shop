import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Minus, Plus, ChevronLeft, BellRing } from 'lucide-react';
import { useProduct } from '../hooks/useProducts';
import { useCartStore } from '../store/cartStore';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import RestockRequestModal from '../components/product/RestockRequestModal';

const formatPrice = (value) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export default function ProductDetail() {
  const { id } = useParams();
  const { data: product, isLoading } = useProduct(id);
  const addItem = useCartStore((state) => state.addItem);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [restockModalOpen, setRestockModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 grid md:grid-cols-2 gap-10">
        <div className="bg-primary-50 border-3 border-black rounded-2xl aspect-square animate-pulse" />
        <div className="flex flex-col gap-4">
          <div className="h-8 bg-primary-50 rounded-xl w-3/4 animate-pulse" />
          <div className="h-10 bg-primary-50 rounded-xl w-1/2 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <h1 className="font-display font-bold text-2xl mb-4">Produto não encontrado</h1>
        <Link to="/catalogo">
          <Button variant="primary">Voltar ao catálogo</Button>
        </Link>
      </div>
    );
  }

  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;

  const handleAddToCart = () => {
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <Link
        to="/catalogo"
        className="inline-flex items-center gap-1 font-display font-semibold text-sm mb-6 hover:underline"
      >
        <ChevronLeft size={18} /> Voltar ao catálogo
      </Link>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Imagem */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative bg-primary-50 border-4 border-black rounded-3xl shadow-cartoon-lg overflow-hidden aspect-square"
        >
          {(product.is_new || product.is_featured || product.is_sold_out) && (
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
              {product.is_sold_out && <Badge color="pink">ESGOTADO</Badge>}
              {!product.is_sold_out && product.is_new && <Badge color="secondary">NOVIDADE</Badge>}
              {!product.is_sold_out && product.is_featured && <Badge color="yellow">MAIS VENDIDO</Badge>}
            </div>
          )}
          <img
            src={product.image_url || '/placeholder-product.png'}
            alt={product.name}
            className={`w-full h-full object-cover ${product.is_sold_out ? 'grayscale opacity-70' : ''}`}
          />
        </motion.div>

        {/* Informações */}
        <div className="flex flex-col gap-5">
          {product.categories?.name && (
            <span className="font-display font-semibold text-xs uppercase tracking-wide text-primary">
              {product.categories.name}
            </span>
          )}

          <h1 className="font-display font-bold text-3xl sm:text-4xl text-black">
            {product.name}
          </h1>

          {product.description && (
            <p className="font-body text-black/70 leading-relaxed">{product.description}</p>
          )}

          <div className="flex items-baseline gap-3">
            {hasDiscount && (
              <span className="text-lg text-black/40 line-through font-body">
                {formatPrice(product.compare_at_price)}
              </span>
            )}
            <span className="font-display font-bold text-4xl text-primary">
              {formatPrice(product.price)}
            </span>
          </div>

          {product.is_sold_out ? (
            <>
              <p className="font-display font-semibold text-black/70 bg-accent-pink/20 border-2 border-black rounded-2xl px-4 py-3 mt-2">
                Este produto está esgotado no momento.
              </p>
              <Button
                variant="primary"
                size="xl"
                icon={BellRing}
                isFullWidth
                onClick={() => setRestockModalOpen(true)}
              >
                Avise-me quando chegar
              </Button>
            </>
          ) : (
            <>
              {/* Seletor de quantidade */}
              <div className="flex items-center gap-4">
                <span className="font-display font-semibold text-sm">Quantidade</span>
                <div className="flex items-center gap-3 bg-white border-3 border-black rounded-2xl shadow-cartoon-sm px-2 py-1">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-2 hover:bg-secondary/30 rounded-xl transition-colors"
                    aria-label="Diminuir quantidade"
                  >
                    <Minus size={16} strokeWidth={3} />
                  </button>
                  <span className="font-display font-bold w-6 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="p-2 hover:bg-secondary/30 rounded-xl transition-colors"
                    aria-label="Aumentar quantidade"
                  >
                    <Plus size={16} strokeWidth={3} />
                  </button>
                </div>
              </div>

              {/* Botão gigante de adicionar */}
              <Button
                variant="primary"
                size="xl"
                icon={ShoppingCart}
                isFullWidth
                onClick={handleAddToCart}
                className="mt-2"
              >
                {added ? 'Adicionado! ✓' : 'Adicionar ao carrinho'}
              </Button>

              {product.stock > 0 && product.stock <= 5 && (
                <p className="text-sm font-semibold text-accent-orange">
                  Últimas {product.stock} unidades em estoque!
                </p>
              )}
            </>
          )}

          <RestockRequestModal
            product={product}
            isOpen={restockModalOpen}
            onClose={() => setRestockModalOpen(false)}
          />
        </div>
      </div>
    </div>
  );
}
