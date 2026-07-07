import { AnimatePresence, motion } from 'framer-motion';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';
import Button from '../ui/Button';

const formatPrice = (value) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export default function CartDrawer() {
  const navigate = useNavigate();
  const {
    items,
    isDrawerOpen,
    closeDrawer,
    incrementItem,
    decrementItem,
    removeItem,
    getTotalPrice,
  } = useCartStore();

  const total = getTotalPrice();

  const handleCheckout = () => {
    closeDrawer();
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Gaveta */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="
              fixed top-0 right-0 h-full w-full sm:w-[420px] z-50
              bg-white border-l-4 border-black
              flex flex-col
            "
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b-3 border-black bg-primary">
              <h2 className="font-display font-bold text-xl text-white flex items-center gap-2">
                <ShoppingBag size={24} strokeWidth={2.5} />
                Seu carrinho
              </h2>
              <button
                onClick={closeDrawer}
                className="bg-white border-2 border-black rounded-full p-1.5 shadow-cartoon-sm active:translate-y-0.5 active:shadow-none transition-all"
                aria-label="Fechar carrinho"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>

            {/* Itens */}
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                  <div className="bg-primary-50 border-3 border-black rounded-full p-6">
                    <ShoppingBag size={40} className="text-primary" />
                  </div>
                  <p className="font-display font-semibold text-black/60">
                    Seu carrinho está vazio
                  </p>
                  <Button variant="outline" onClick={closeDrawer}>
                    Continuar comprando
                  </Button>
                </div>
              ) : (
                items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex gap-3 bg-white border-3 border-black rounded-2xl p-3 shadow-cartoon-sm"
                  >
                    <img
                      src={item.image_url || '/placeholder-product.png'}
                      alt={item.name}
                      className="w-16 h-16 rounded-xl border-2 border-black object-cover flex-shrink-0"
                    />
                    <div className="flex-1 flex flex-col gap-1 min-w-0">
                      <p className="font-display font-semibold text-sm text-black truncate">
                        {item.name}
                      </p>
                      <p className="font-display font-bold text-primary">
                        {formatPrice(item.price)}
                      </p>

                      <div className="flex items-center gap-2 mt-1">
                        <button
                          onClick={() => decrementItem(item.id)}
                          className="bg-white border-2 border-black rounded-full p-1 shadow-cartoon-sm active:translate-y-0.5 active:shadow-none transition-all"
                          aria-label="Diminuir quantidade"
                        >
                          <Minus size={14} strokeWidth={3} />
                        </button>
                        <span className="font-display font-bold text-sm w-5 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => incrementItem(item.id)}
                          className="bg-white border-2 border-black rounded-full p-1 shadow-cartoon-sm active:translate-y-0.5 active:shadow-none transition-all"
                          aria-label="Aumentar quantidade"
                        >
                          <Plus size={14} strokeWidth={3} />
                        </button>

                        <button
                          onClick={() => removeItem(item.id)}
                          className="ml-auto text-red-500 hover:text-red-700 transition-colors"
                          aria-label="Remover item"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer / Total + Checkout */}
            {items.length > 0 && (
              <div className="border-t-3 border-black p-5 flex flex-col gap-3 bg-accent-yellow/20">
                <div className="flex items-center justify-between">
                  <span className="font-display font-semibold text-lg">Total</span>
                  <span className="font-display font-bold text-2xl text-primary">
                    {formatPrice(total)}
                  </span>
                </div>
                <Button
                  variant="primary"
                  size="lg"
                  isFullWidth
                  onClick={handleCheckout}
                >
                  Finalizar pedido
                </Button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
