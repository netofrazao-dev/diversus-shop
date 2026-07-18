import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const STORAGE_KEY = 'diversus-shop-pending-coupon';

/**
 * useCouponCapture — fica de olho em qualquer link que chegue com
 * ?cupom=CODIGO (ex: compartilhado no Instagram) e guarda esse código
 * pra ser aplicado automaticamente quando o cliente chegar no checkout.
 *
 * Deve ser usado uma vez, no componente raiz (App.jsx), pra funcionar
 * em qualquer página que o link aponte.
 */
export function useCouponCapture() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const coupon = params.get('cupom');
    if (!coupon) return;

    localStorage.setItem(STORAGE_KEY, coupon.trim().toUpperCase());

    // Remove o "?cupom=..." da URL depois de capturar, pra ela ficar limpa
    params.delete('cupom');
    const newSearch = params.toString();
    navigate(
      { pathname: location.pathname, search: newSearch ? `?${newSearch}` : '' },
      { replace: true }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);
}

export function getPendingCoupon() {
  return localStorage.getItem(STORAGE_KEY);
}

export function clearPendingCoupon() {
  localStorage.removeItem(STORAGE_KEY);
}
