import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProducts } from '../hooks/useProducts';
import { useCartStore } from '../store/cartStore';
import ProductCard from '../components/product/ProductCard';

export default function Catalog() {
  const [searchParams] = useSearchParams();
  const categorySlug = searchParams.get('categoria') || undefined;
  const searchQuery = searchParams.get('busca') || undefined;
  const addItem = useCartStore((state) => state.addItem);

  const { data: products, isLoading } = useProducts({ categorySlug, search: searchQuery });

  const title = searchQuery
    ? `Resultados para "${searchQuery}"`
    : categorySlug
    ? `Categoria: ${categorySlug}`
    : 'Catálogo completo';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display font-bold text-3xl sm:text-4xl mb-2">{title}</h1>
      <p className="text-black/60 mb-8">
        Explore nossos acessórios e encontre o seu estilo.
      </p>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="bg-primary-50 border-3 border-black rounded-2xl aspect-[3/4] animate-pulse"
            />
          ))}
        </div>
      ) : products?.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {products.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <ProductCard product={product} onAddToCart={addItem} />
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="font-display font-semibold text-black/50 text-center py-16">
          {searchQuery
            ? `Nenhum produto encontrado para "${searchQuery}".`
            : 'Nenhum produto encontrado nesta categoria.'}
        </p>
      )}
    </div>
  );
}
