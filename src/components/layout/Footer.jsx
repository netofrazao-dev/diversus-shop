import { Link } from 'react-router-dom';
import { Instagram, MessageCircle } from 'lucide-react';

export default function Footer() {
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
            <Link to="/admin/login" className="hover:text-secondary">Área do administrador</Link>
          </div>
        </div>

        <div>
          <p className="font-display font-semibold mb-3">Fale conosco</p>
          <div className="flex gap-3">
            <a
              href="#"
              className="bg-white/10 hover:bg-secondary hover:text-black rounded-full p-2.5 transition-colors"
              aria-label="WhatsApp"
            >
              <MessageCircle size={18} />
            </a>
            <a
              href="#"
              className="bg-white/10 hover:bg-secondary hover:text-black rounded-full p-2.5 transition-colors"
              aria-label="Instagram"
            >
              <Instagram size={18} />
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/40">
        © {new Date().getFullYear()} DIVERSUS SHOP. Todos os direitos reservados.
      </div>
    </footer>
  );
}
