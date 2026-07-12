import { motion } from 'framer-motion';
import { Instagram } from 'lucide-react';

const INSTAGRAM_URL =
  'https://www.instagram.com/diversus__shop.acessorios?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==';

/**
 * InstagramCTA — banner reutilizável convidando o cliente a seguir a loja no Instagram.
 *
 * variant:
 *  - "banner" (padrão): cartão grande, para Home/PDP
 *  - "compact": faixa fina, para caber em espaços menores (ex: pós-checkout, carrinho)
 */
export default function InstagramCTA({ variant = 'banner' }) {
  if (variant === 'compact') {
    return (
      <a
        href={INSTAGRAM_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="
          flex items-center justify-center gap-2 w-full
          bg-gradient-to-r from-primary to-secondary
          border-3 border-black rounded-2xl shadow-cartoon-sm
          px-4 py-3 font-display font-bold text-sm text-white
          hover:brightness-110 transition-all active:translate-y-0.5 active:shadow-none
        "
      >
        <Instagram size={18} strokeWidth={2.5} />
        Siga a gente no Instagram
      </a>
    );
  }

  return (
    <motion.a
      href={INSTAGRAM_URL}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ y: -3 }}
      className="
        block relative overflow-hidden
        bg-gradient-to-br from-primary via-primary to-secondary
        border-4 border-black rounded-3xl shadow-cartoon-lg
        px-6 py-8 sm:px-10 sm:py-10 text-center
      "
    >
      <div className="relative z-10 flex flex-col items-center gap-3">
        <div className="bg-white border-3 border-black rounded-full p-3 shadow-cartoon-sm">
          <Instagram size={28} className="text-primary" strokeWidth={2.5} />
        </div>
        <h3 className="font-display font-bold text-2xl sm:text-3xl text-white">
          Segue a gente no Instagram!
        </h3>
        <p className="text-white/90 font-body max-w-md">
          Lançamentos, bastidores e promoções relâmpago saem primeiro por lá.
          @diversus__shop.acessorios
        </p>
        <span className="mt-2 inline-flex items-center gap-2 bg-white text-black border-3 border-black rounded-2xl px-6 py-3 font-display font-bold shadow-cartoon-sm">
          <Instagram size={18} /> Seguir agora
        </span>
      </div>
    </motion.a>
  );
}
