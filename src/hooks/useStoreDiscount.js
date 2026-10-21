import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { setGlobalDiscount } from '../lib/pricing';

/**
 * useStoreDiscount — busca o desconto da loja toda e alimenta lib/pricing.
 * Montado uma vez no Layout. Se a tabela ainda não existir (migração não
 * rodada), simplesmente não há desconto — a loja segue normal.
 */
export function useStoreDiscount() {
  const query = useQuery({
    queryKey: ['store-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('store_settings')
        .select('global_discount_percent, global_discount_ends_at')
        .eq('id', 1)
        .maybeSingle();
      if (error) return null;
      return data;
    },
    staleTime: 1000 * 60 * 2,
    retry: false,
  });

  useEffect(() => {
    const d = query.data;
    setGlobalDiscount({
      percent: d?.global_discount_percent ?? 0,
      endsAt: d?.global_discount_ends_at ?? null,
    });
  }, [query.data]);

  return query;
}
