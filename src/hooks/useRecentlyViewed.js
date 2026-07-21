import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';

const STORAGE_KEY = 'diversus-shop-recently-viewed';
const MAX_ITEMS = 10;

/** Lê a lista de IDs vistos recentemente do localStorage (mais recente primeiro) */
function getStoredIds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * trackProductView — registra que o cliente viu um produto.
 * Chame isso no mount da página do produto.
 */
export function trackProductView(productId) {
  if (!productId) return;
  const current = getStoredIds().filter((id) => id !== productId);
  const updated = [productId, ...current].slice(0, MAX_ITEMS);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // localStorage indisponível (ex: modo privado) — sem problema, só não salva
  }
}

/**
 * useRecentlyViewed — busca os produtos vistos recentemente (excluindo,
 * opcionalmente, o produto que está sendo visto agora).
 */
export function useRecentlyViewed(excludeId) {
  const [ids, setIds] = useState([]);

  useEffect(() => {
    setIds(getStoredIds().filter((id) => id !== excludeId));
  }, [excludeId]);

  return useQuery({
    queryKey: ['recently-viewed', ids],
    queryFn: async () => {
      if (ids.length === 0) return [];

      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name, slug)')
        .in('id', ids)
        .eq('is_active', true);

      if (error) throw error;

      // Mantém a ordem "mais recente primeiro" (o Supabase não garante
      // a ordem do .in(), então reordena manualmente pelos IDs salvos)
      const byId = Object.fromEntries((data || []).map((p) => [p.id, p]));
      return ids.map((id) => byId[id]).filter(Boolean);
    },
    enabled: ids.length > 0,
    staleTime: 1000 * 60 * 5,
  });
}
