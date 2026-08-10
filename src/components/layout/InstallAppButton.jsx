import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Share } from 'lucide-react';

const DISMISSED_KEY = 'diversus-install-dismissed';

/**
 * InstallAppButton — convite pra instalar a loja como app (PWA).
 *
 * Como funciona:
 *  - Chrome/Android/Edge disparam o evento 'beforeinstallprompt', que a gente
 *    guarda e usa pra abrir o instalador nativo no clique.
 *  - iPhone/Safari NÃO suporta esse evento — nesse caso mostramos uma
 *    instrução manual ("Compartilhar → Adicionar à Tela de Início").
 *  - Se o app já está instalado (display-mode: standalone) ou o cliente
 *    dispensou o convite antes, nada aparece.
 */
export default function InstallAppButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showIosHint, setShowIosHint] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Já instalado? não mostra nada
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    if (isStandalone) return;

    // Cliente já dispensou antes? respeita a escolha dele
    try {
      if (localStorage.getItem(DISMISSED_KEY) === '1') return;
    } catch {
      // localStorage indisponível — segue normal
    }

    const isIos = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
    const isSafari = /^((?!chrome|android|crios|fxios).)*safari/i.test(window.navigator.userAgent);

    if (isIos && isSafari) {
      setVisible(true);
      return;
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setVisible(false);
      setDeferredPrompt(null);
    } else {
      // iPhone: não dá pra abrir instalador via código, então explicamos
      setShowIosHint(true);
    }
  };

  const handleDismiss = () => {
    setVisible(false);
    setShowIosHint(false);
    try {
      localStorage.setItem(DISMISSED_KEY, '1');
    } catch {
      // sem problema
    }
  };

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        className="fixed bottom-4 inset-x-4 sm:left-auto sm:right-4 sm:w-80 z-40"
      >
        <div className="bg-white border-3 border-black rounded-2xl shadow-cartoon-lg p-4">
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 text-black/40 hover:text-black"
            aria-label="Dispensar"
          >
            <X size={16} />
          </button>

          {showIosHint ? (
            <div className="flex flex-col gap-2">
              <p className="font-display font-bold text-sm">Como instalar no iPhone</p>
              <p className="text-xs text-black/60 flex items-center gap-1.5 flex-wrap">
                Toque em <Share size={14} className="inline" /> (Compartilhar) na barra do Safari e
                escolha <strong>&quot;Adicionar à Tela de Início&quot;</strong>.
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="bg-primary border-2 border-black rounded-xl w-11 h-11 flex items-center justify-center shrink-0">
                <span className="font-display font-bold text-white text-lg">D</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display font-bold text-sm leading-tight">
                  Instale a DIVERSUS SHOP
                </p>
                <p className="text-xs text-black/50">Acesso rápido direto da tela do celular</p>
              </div>
              <button
                onClick={handleInstall}
                className="bg-primary text-white border-2 border-black rounded-xl px-3 py-2 font-display font-bold text-xs shadow-cartoon-sm active:translate-y-0.5 active:shadow-none transition-all shrink-0 flex items-center gap-1"
              >
                <Download size={14} /> Instalar
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
