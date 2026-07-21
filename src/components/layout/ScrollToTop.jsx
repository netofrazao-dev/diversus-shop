import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop — o React Router não reseta o scroll da página ao navegar
 * (diferente de um site tradicional). Sem isso, ao clicar num produto
 * vindo de uma tela rolada pra baixo, a nova página abre no mesmo ponto
 * de rolagem — parecendo que "foi pro rodapé" antes de mostrar o topo.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
