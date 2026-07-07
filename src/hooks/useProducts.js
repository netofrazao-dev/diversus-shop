import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';

/**
 * useProducts — busca produtos do Supabase com filtros opcionais
 *
 * options:
 *  - featured: true  -> só "Mais Vendidos"
 *  - isNew: true     -> só "Lançamentos"
 *  - categorySlug: 'relogios' -> filtra por categoria
 *  - limit: number
 */
export function useProducts(options = {}) {
  const { featured, isNew, categorySlug, limit } = options;

  return useQuery({
    queryKey: ['products', options],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('*, categories(name, slug)')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (featured) query = query.eq('is_featured', true);
      if (isNew) query = query.eq('is_new', true);
      if (categorySlug) query = query.eq('categories.slug', categorySlug);
      if (limit) query = query.limit(limit);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

/**
 * useProduct — busca um único produto por id (para a PDP)
 */
export function useProduct(productId) {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name, slug)')
        .eq('id', productId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!productId,
  });
}
