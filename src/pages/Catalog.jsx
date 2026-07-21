import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SlidersHorizontal, X } from 'lucide-react';
import { useProducts, useProductRatings } from '../hooks/useProducts';
import { useCartStore } from '../store/cartStore';
import ProductCard from '../components/product/ProductCard';
import Button from '../components/ui/Button';

const SORT_OPTIONS = [
  { value: '', label: 'Mais recentes' },
  { value: 'price_asc', label: 'Menor preço' },
  { value: 'price_desc', label: 'Maior preço' },
];

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const categorySlug = searchParams.get('categoria') || undefined;
  const searchQuery = searchParams.get('busca') || undefined;
  const sortBy = searchParams.get('ordenar') || undefined;
  const minPrice = searchParams.get('min') ? Number(searchParams.get('min')) : undefined;
  const maxPrice = searchParams.get('max') ? Number(searchParams.get('max')) : undefined;

  const addItem = useCartStore((state) => state.addItem);
  const { data: products, isLoading } = useProducts({
    categorySlug,
    search: searchQuery,
    sortBy,
    minPrice,
    maxPrice,
  });
  const { data: ratings } = useProductRatings();

  const title = searchQuery
    ? `Resultados para "${searchQuery}"`
    : categorySlug
    ? `Categoria: ${categorySlug}`
    : 'Catálogo completo';

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  };

  const hasActiveFilters = sortBy || minPrice != null || maxPrice != null;

  const clearFilters = () => {
    const next = new URLSearchParams(searchParams);
    next.delete('ordenar');
    next.delete('min');
    next.delete('max');
    setSearchParams(next);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-2">
        <h1 className="font-display font-bold text-3xl sm:text-4xl">{title}</h1>
        <Button
          variant={hasActiveFilters ? 'primary' : 'outline'}
          size="sm"
          icon={SlidersHorizontal}
          onClick={() => setFiltersOpen((v) => !v)}
        >
          Filtrar e ordenar
        </Button>
      </div>
      <p className="text-black/60 mb-6">
        Explore nossos acessórios e encontre o seu estilo.
      </p>

      {filtersOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-white border-3 border-black rounded-2xl shadow-cartoon p-5 mb-8 flex flex-col sm:flex-row gap-4 sm:items-end"
        >
          <div className="flex flex-col gap-1.5">
            <label className="font-display font-semibold text-sm">Ordenar por</label>
            <select
              value={sortBy || ''}
              onChange={(e) => updateParam('ordenar', e.target.value)}
              className="border-3 border-black rounded-2xl px-4 py-2.5 font-body shadow-cartoon-sm"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-display font-semibold text-sm">Preço mínimo</label>
            <input
              type="number"
              min="0"
              value={minPrice ?? ''}
              onChange={(e) => updateParam('min', e.target.value)}
              placeholder="R$ 0"
              className="border-3 border-black rounded-2xl px-4 py-2.5 font-body shadow-cartoon-sm w-32"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-display font-semibold text-sm">Preço máximo</label>
            <input
              type="number"
              min="0"
              value={maxPrice ?? ''}
              onChange={(e) => updateParam('max', e.target.value)}
              placeholder="Sem limite"
              className="border-3 border-black rounded-2xl px-4 py-2.5 font-body shadow-cartoon-sm w-32"
            />
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-sm font-display font-semibold text-black/60 hover:text-red-600"
            >
              <X size={16} /> Limpar filtros
            </button>
          )}
        </motion.div>
      )}

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
              <ProductCard product={product} onAddToCart={addItem} rating={ratings?.[product.id]} />
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="font-display font-semibold text-black/50 text-center py-16">
          {searchQuery
            ? `Nenhum produto encontrado para "${searchQuery}".`
            : 'Nenhum produto encontrado com esses filtros.'}
        </p>
      )}
    </div>
  );
}
