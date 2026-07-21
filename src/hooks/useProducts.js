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
 *  - sortBy: 'newest' (padrão) | 'price_asc' | 'price_desc'
 *  - minPrice / maxPrice: number (opcional, filtra por faixa de preço)
 */
export function useProducts(options = {}) {
  const { featured, isNew, categorySlug, limit, search, sortBy, minPrice, maxPrice } = options;

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

      let query = supabase.from('products').select(selectStr).eq('is_active', true);

      if (sortBy === 'price_asc') query = query.order('price', { ascending: true });
      else if (sortBy === 'price_desc') query = query.order('price', { ascending: false });
      else query = query.order('created_at', { ascending: false });

      if (featured) query = query.eq('is_featured', true);
      if (isNew) query = query.eq('is_new', true);
      if (categorySlug) query = query.eq('categories.slug', categorySlug);
      if (search) query = query.ilike('name', `%${search}%`);
      if (minPrice != null) query = query.gte('price', minPrice);
      if (maxPrice != null) query = query.lte('price', maxPrice);
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
 * useProductReviews — busca as avaliações visíveis de um produto,
 * já com a média e o total calculados.
 */
export function useProductReviews(productId) {
  return useQuery({
    queryKey: ['product-reviews', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_reviews')
        .select('*')
        .eq('product_id', productId)
        .eq('is_visible', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const reviews = data || [];
      const average = reviews.length
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

      return { reviews, average, count: reviews.length };
    },
    enabled: !!productId,
  });
}

/**
 * useStories — busca os stories ativos (e ainda não expirados) da loja,
 * do mais recente pro mais antigo — pro feed estilo "stories" da Home.
 */
export function useStories() {
  return useQuery({
    queryKey: ['store-stories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('store_stories')
        .select('*, products(id, name, image_url)')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
}

/**
 * useProductRatings — busca a nota média e o total de avaliações de
 * TODOS os produtos de uma vez (uma query só, evita fazer uma consulta
 * por produto na listagem). Usado pra mostrar a notinha nos cards do
 * catálogo/Home.
 */
export function useProductRatings() {
  return useQuery({
    queryKey: ['product-ratings-summary'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_reviews')
        .select('product_id, rating')
        .eq('is_visible', true);

      if (error) throw error;

      const summary = {};
      (data || []).forEach(({ product_id, rating }) => {
        if (!summary[product_id]) summary[product_id] = { total: 0, count: 0 };
        summary[product_id].total += rating;
        summary[product_id].count += 1;
      });

      const result = {};
      Object.entries(summary).forEach(([productId, { total, count }]) => {
        result[productId] = { average: total / count, count };
      });
      return result;
    },
    staleTime: 1000 * 60 * 5,
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
