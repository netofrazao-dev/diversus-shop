import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X, ChevronLeft, ChevronRight, ShoppingBag, Volume2, VolumeX } from 'lucide-react';

const IMAGE_DURATION_MS = 6000; // quanto tempo cada story de FOTO fica na tela

/**
 * StoryViewer — visualizador em tela cheia, estilo Stories do Instagram.
 * Vídeo avança sozinho quando termina; foto avança depois de alguns segundos.
 * Barrinhas de progresso no topo mostram quantos stories tem e onde você está.
 */
export default function StoryViewer({ stories, startIndex = 0, onClose }) {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [progress, setProgress] = useState(0);
  const [muted, setMuted] = useState(true);
  const videoRef = useRef(null);
  const rafRef = useRef(null);
  const startTimeRef = useRef(null);

  const current = stories[currentIndex];

  const goNext = () => {
    if (currentIndex >= stories.length - 1) {
      onClose();
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  };

  // Barra de progresso pra imagens (vídeo usa o próprio evento de tempo)
  useEffect(() => {
    setProgress(0);
    if (current?.media_type !== 'image') return;

    startTimeRef.current = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min(100, (elapsed / IMAGE_DURATION_MS) * 100);
      setProgress(pct);
      if (pct >= 100) {
        goNext();
      } else {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  const handleVideoTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    setProgress((video.currentTime / video.duration) * 100);
  };

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  if (!current) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
      {/* Barras de progresso */}
      <div className="absolute top-3 left-3 right-3 z-10 flex gap-1.5">
        {stories.map((_, i) => (
          <div key={i} className="flex-1 h-1 rounded-full bg-white/30 overflow-hidden">
            <div
              className="h-full bg-white rounded-full"
              style={{
                width: i < currentIndex ? '100%' : i === currentIndex ? `${progress}%` : '0%',
                transition: i === currentIndex ? 'none' : 'width 0.2s',
              }}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-8 left-3 right-3 z-10 flex items-center justify-between">
        <span className="font-display font-bold text-white text-sm bg-black/30 rounded-full px-3 py-1">
          DIVERSUS SHOP
        </span>
        <div className="flex items-center gap-2">
          {current.media_type === 'video' && (
            <button
              onClick={() => setMuted((m) => !m)}
              className="bg-black/30 rounded-full p-2 text-white"
              aria-label="Som"
            >
              {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
          )}
          <button onClick={onClose} className="bg-black/30 rounded-full p-2 text-white" aria-label="Fechar">
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Áreas de toque pra navegar (esquerda/direita) */}
      <button
        onClick={goPrev}
        className="absolute left-0 top-0 bottom-0 w-1/3 z-[5]"
        aria-label="Story anterior"
      />
      <button
        onClick={goNext}
        className="absolute right-0 top-0 bottom-0 w-1/3 z-[5]"
        aria-label="Próximo story"
      />

      {/* Setas visuais em telas maiores */}
      <button
        onClick={goPrev}
        className="hidden sm:flex absolute left-4 z-10 bg-white/10 hover:bg-white/20 rounded-full p-2 text-white"
        aria-label="Anterior"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={goNext}
        className="hidden sm:flex absolute right-4 z-10 bg-white/10 hover:bg-white/20 rounded-full p-2 text-white"
        aria-label="Próximo"
      >
        <ChevronRight size={24} />
      </button>

      {/* Conteúdo do story */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="relative w-full h-full max-w-md mx-auto flex items-center justify-center"
        >
          {current.media_type === 'video' ? (
            <video
              ref={videoRef}
              src={current.media_url}
              autoPlay
              muted={muted}
              playsInline
              onTimeUpdate={handleVideoTimeUpdate}
              onEnded={goNext}
              className="w-full h-full object-contain"
            />
          ) : (
            <img src={current.media_url} alt="" className="w-full h-full object-contain" />
          )}

          {/* Legenda + link do produto */}
          {(current.caption || current.products) && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-5 pt-14 flex flex-col gap-3">
              {current.caption && (
                <p className="text-white font-body text-sm leading-relaxed">{current.caption}</p>
              )}
              {current.products && (
                <button
                  onClick={() => navigate(`/produto/${current.products.id}`)}
                  className="flex items-center gap-2 bg-white text-black border-2 border-black rounded-2xl px-4 py-2.5 font-display font-semibold text-sm shadow-cartoon-sm w-fit"
                >
                  <ShoppingBag size={16} /> Ver {current.products.name}
                </button>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
