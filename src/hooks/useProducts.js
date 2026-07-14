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
  const { featured, isNew, categorySlug, limit, search } = options;

  return useQuery({
    queryKey: ['products', options],
    queryFn: async () => {
      // Quando filtramos por categoria, o join precisa ser "!inner" — sem isso,
      // o Supabase só filtra o campo embutido "categories" no resultado, mas
      // continua retornando TODOS os produtos (esse era o bug de categorias
      // aparecendo misturadas).
      const selectStr = categorySlug
        ? '*, categories!inner(name, slug)'
        : '*, categories(name, slug)';

      let query = supabase
        .from('products')
        .select(selectStr)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (featured) query = query.eq('is_featured', true);
      if (isNew) query = query.eq('is_new', true);
      if (categorySlug) query = query.eq('categories.slug', categorySlug);
      if (search) query = query.ilike('name', `%${search}%`);
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

/**
 * useProductOptions — busca os grupos de variação (ex: Tamanho, Cor)
 * e seus valores, já ordenados, para montar os seletores na PDP.
 */
export function useProductOptions(productId) {
  return useQuery({
    queryKey: ['product-options', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_option_groups')
        .select('*, product_option_values(*)')
        .eq('product_id', productId)
        .order('display_order', { ascending: true });

      if (error) throw error;

      return (data || []).map((group) => ({
        ...group,
        product_option_values: [...(group.product_option_values || [])].sort(
          (a, b) => a.display_order - b.display_order
        ),
      }));
    },
    enabled: !!productId,
  });
}

/**
 * useProductRecommendations — busca os produtos recomendados
 * ("Você também pode gostar") para a PDP.
 *
 * Prioridade:
 *  1. Recomendações cadastradas manualmente pelo admin
 *  2. Automático: outros produtos da mesma categoria
 *  3. Automático: produtos em destaque (fallback final)
 */
export function useProductRecommendations(productId, categoryId) {
  return useQuery({
    queryKey: ['product-recommendations', productId, categoryId],
    queryFn: async () => {
      // 1. Recomendações manuais
      const { data: manual, error: manualError } = await supabase
        .from('product_recommendations')
        .select('recommended_product_id, products:recommended_product_id(*, categories(name, slug))')
        .eq('product_id', productId);

      if (manualError) throw manualError;

      const manualProducts = (manual || [])
        .map((row) => row.products)
        .filter((p) => p && p.is_active);

      if (manualProducts.length > 0) return manualProducts;

      // 2. Automático: mesma categoria
      if (categoryId) {
        const { data: sameCategory, error: catError } = await supabase
          .from('products')
          .select('*, categories(name, slug)')
          .eq('category_id', categoryId)
          .eq('is_active', true)
          .neq('id', productId)
          .limit(4);

        if (catError) throw catError;
        if (sameCategory?.length > 0) return sameCategory;
      }

      // 3. Automático: destaques (fallback final)
      const { data: featuredFallback, error: featError } = await supabase
        .from('products')
        .select('*, categories(name, slug)')
        .eq('is_featured', true)
        .eq('is_active', true)
        .neq('id', productId)
        .limit(4);

      if (featError) throw featError;
      return featuredFallback || [];
    },
    enabled: !!productId,
  });
}

/**
 * useProductCombos — busca combinações de "compre junto e ganhe desconto"
 * cadastradas para este produto.
 */
export function useProductCombos(productId) {
  return useQuery({
    queryKey: ['product-combos', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_combos')
        .select('*, combo_product:combo_product_id(*, categories(name, slug))')
        .eq('product_id', productId);

      if (error) throw error;
      return (data || []).filter((row) => row.combo_product?.is_active);
    },
    enabled: !!productId,
  });
}

/**
 * getEffectivePrice — calcula o preço "de fato" de um produto,
 * considerando promoção ativa (se dentro da janela de validade).
 */
export function getEffectivePrice(product) {
  const now = new Date();
  const hasPromo =
    product.promo_price != null &&
    product.promo_price < product.price &&
    (!product.promo_starts_at || new Date(product.promo_starts_at) <= now) &&
    (!product.promo_ends_at || new Date(product.promo_ends_at) >= now);

  return {
    isPromo: hasPromo,
    price: hasPromo ? product.promo_price : product.price,
    originalPrice: product.price,
  };
}
