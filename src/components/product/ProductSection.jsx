import { motion } from 'framer-motion';
import ProductCard from './ProductCard';

/**
 * ProductSection — Seção de grid de produtos usada na Home
 * (ex: "Mais Vendidos", "Lançamentos")
 */
export default function ProductSection({ title, subtitle, products, isLoading, onAddToCart, accentColor = 'primary', ratings }) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col items-center text-center mb-8 gap-2">
        <span
          className={`
            font-display font-bold text-xs uppercase tracking-wider
            border-2 border-black rounded-full px-4 py-1.5 shadow-cartoon-sm
            ${accentColor === 'primary' ? 'bg-primary text-white' : 'bg-secondary text-black'}
          `}
        >
          {subtitle}
        </span>
        <h2 className="font-display font-bold text-3xl sm:text-4xl text-black">
          {title}
        </h2>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
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
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <ProductCard product={product} onAddToCart={onAddToCart} rating={ratings?.[product.id]} />
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="text-center font-display font-semibold text-black/50">
          Nenhum produto encontrado por aqui ainda.
        </p>
      )}
    </section>
  );
}
