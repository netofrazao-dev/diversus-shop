import { motion } from 'framer-motion';
import { History } from 'lucide-react';
import { useRecentlyViewed } from '../../hooks/useRecentlyViewed';
import { useCartStore } from '../../store/cartStore';
import ProductCard from './ProductCard';

/**
 * RecentlyViewed — mostra os últimos produtos que o cliente visitou
 * (guardados no localStorage do navegador dele, não no banco).
 *
 * excludeId: passe o id do produto atual (na PDP) pra não mostrar ele
 * mesmo na lista.
 */
export default function RecentlyViewed({ excludeId }) {
  const { data: products, isLoading } = useRecentlyViewed(excludeId);
  const addItem = useCartStore((state) => state.addItem);

  if (isLoading || !products || products.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center gap-2 mb-6">
        <History size={22} />
        <h2 className="font-display font-bold text-2xl sm:text-3xl">Vistos recentemente</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
        {products.map((product, i) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
          >
            <ProductCard product={product} onAddToCart={addItem} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
