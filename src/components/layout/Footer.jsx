import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, MessageCircle, MessageSquareHeart, Package, RotateCcw } from 'lucide-react';
import SuggestionModal from '../product/SuggestionModal';
import { STORE_LEGAL_NAME, STORE_DOCUMENT, hasLegalInfo } from '../../lib/constants';

const INSTAGRAM_URL =
  'https://www.instagram.com/diversus__shop.acessorios?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==';

const STORE_WHATSAPP = import.meta.env.VITE_STORE_WHATSAPP || '5500000000000';

export default function Footer() {
  const [suggestionOpen, setSuggestionOpen] = useState(false);

  return (
    <footer className="bg-black text-white mt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid sm:grid-cols-3 gap-8">
        <div>
          <p className="font-display font-bold text-xl mb-2">
            DIVERSUS<span className="text-secondary"> SHOP</span>
          </p>
          <p className="text-white/60 text-sm">
            Acessórios com atitude: relógios, camisas e cordões para todos os estilos.
          </p>
        </div>

        <div>
          <p className="font-display font-semibold mb-3">Navegação</p>
          <div className="flex flex-col gap-2 text-sm text-white/70">
            <Link to="/" className="hover:text-secondary">Início</Link>
            <Link to="/catalogo" className="hover:text-secondary">Catálogo</Link>
            <button
              onClick={() => setSuggestionOpen(true)}
              className="flex items-center gap-1.5 hover:text-secondary text-left"
            >
              <MessageSquareHeart size={14} /> Sugerir um produto
            </button>
            <Link to="/meu-pedido" className="flex items-center gap-1.5 hover:text-secondary">
              <Package size={14} /> Consultar meu pedido
            </Link>
            <Link to="/admin/login" className="hover:text-secondary">Área do administrador</Link>
            <Link to="/privacidade" className="hover:text-secondary">Política de Privacidade</Link>
            <Link to="/trocas-e-devolucoes" className="flex items-center gap-1.5 hover:text-secondary">
              <RotateCcw size={14} /> Trocas e Devoluções
            </Link>
          </div>
        </div>

        <div>
          <p className="font-display font-semibold mb-3">Fale conosco</p>
          <div className="flex gap-3">
            <a
              href={`https://wa.me/${STORE_WHATSAPP}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/10 hover:bg-secondary hover:text-black rounded-full p-2.5 transition-colors"
              aria-label="WhatsApp"
            >
              <MessageCircle size={18} />
            </a>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/10 hover:bg-secondary hover:text-black rounded-full p-2.5 transition-colors"
              aria-label="Instagram"
            >
              <Instagram size={18} />
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 flex flex-col items-center gap-1.5 text-center px-4">
        {hasLegalInfo() && (
          <p className="text-xs text-white/40">
            {STORE_LEGAL_NAME} — {STORE_DOCUMENT}
          </p>
        )}
        <p className="text-xs text-white/40">
          © {new Date().getFullYear()} DIVERSUS SHOP. Todos os direitos reservados.
        </p>
        <p className="text-xs text-white/50">
          desenvolvido por neto e gabi
        </p>
        <a
          href="https://netofrazao-dev.github.io/Neto-Dev/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold text-secondary hover:underline"
        >
          faça um sistema/site assim para você clicando aqui
        </a>
      </div>

      <SuggestionModal isOpen={suggestionOpen} onClose={() => setSuggestionOpen(false)} />
    </footer>
  );
}
