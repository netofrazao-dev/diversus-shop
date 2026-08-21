import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { initMetaPixel, trackPixelPageView } from '../../lib/metaPixel';

/**
 * MetaPixelTracker — inicializa o Pixel do Meta uma vez, e dispara um
 * PageView a cada troca de página (o site é uma SPA de página única, então
 * sem isso o Pixel só contaria UMA visita por sessão, nunca a navegação).
 */
export default function MetaPixelTracker() {
  const { pathname } = useLocation();
  const isFirstRender = useRef(true);

  useEffect(() => {
    initMetaPixel(); // já dispara o primeiro PageView sozinho
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return; // evita contar o PageView inicial em dobro
    }
    trackPixelPageView();
  }, [pathname]);

  return null;
}
