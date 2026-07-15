import { useEffect } from 'react';

/**
 * useDocumentTitle — atualiza o título da aba do navegador.
 * Sempre volta para o título padrão da loja ao desmontar a página.
 */
export function useDocumentTitle(title) {
  useEffect(() => {
    if (!title) return;
    const previous = document.title;
    document.title = title;
    return () => {
      document.title = previous;
    };
  }, [title]);
}
