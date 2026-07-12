import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, Sparkles, Watch, Shirt, Gem, MessageSquareHeart, PartyPopper } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { useCartStore } from '../store/cartStore';
import ProductSection from '../components/product/ProductSection';
import Button from '../components/ui/Button';
import InstagramCTA from '../components/layout/InstagramCTA';
import SuggestionModal from '../components/product/SuggestionModal';

const CATEGORY_SHORTCUTS = [
  { label: 'Relógios', icon: Watch, slug: 'relogios', color: 'bg-primary-100' },
  { label: 'Camisas', icon: Shirt, slug: 'camisas', color: 'bg-secondary/30' },
  { label: 'Cordões', icon: Gem, slug: 'cordoes', color: 'bg-accent-pink/30' },
];

export default function Home() {
  const location = useLocation();
  const { data: featured, isLoading: loadingFeatured } = useProducts({ featured: true, limit: 8 });
  const { data: newArrivals, isLoading: loadingNew } = useProducts({ isNew: true, limit: 8 });
  const addItem = useCartStore((state) => state.addItem);
  const [suggestionOpen, setSuggestionOpen] = useState(false);
  const orderSuccess = location.state?.orderSuccess;

  return (
    <div>
      {/* Mensagem pós-compra */}
      {orderSuccess && (
        <div className="bg-accent-green/30 border-b-4 border-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-3 flex-wrap justify-center text-center">
            <PartyPopper size={22} />
            <p className="font-display font-semibold">
              Pedido enviado! A loja já recebeu tudo pelo WhatsApp. Enquanto isso, que tal seguir a gente no Instagram?
            </p>
          </div>
        </div>
      )}

      {/* HERO */}
      <section className="relative overflow-hidden bg-primary-50 border-b-4 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 grid lg:grid-cols-2 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-6"
          >
            <span className="inline-flex items-center gap-1.5 self-start bg-accent-yellow border-2 border-black rounded-full px-4 py-1.5 font-display font-bold text-xs shadow-cartoon-sm">
              <Sparkles size={14} />
              NOVA COLEÇÃO CHEGOU
            </span>

            <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-black leading-[1.1]">
              Acessórios com
              <span className="text-primary"> atitude</span> e
              <span className="text-secondary bg-black px-2 ml-1 rounded-lg inline-block"> estilo</span>
            </h1>

            <p className="font-body text-lg text-black/70 max-w-md">
              Relógios, camisas e cordões que combinam com quem não tem medo de se destacar. Compre agora e receba com estilo.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link to="/catalogo">
                <Button variant="primary" size="xl" icon={ArrowRight} iconPosition="right">
                  Ver catálogo
                </Button>
              </Link>
              <Link to="/catalogo?categoria=lancamentos">
                <Button variant="outline" size="xl">
                  Lançamentos
                </Button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.85, rotate: -4 }}
            animate={{ opacity: 1, scale: 1, rotate: -4 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative flex items-center justify-center"
          >
            <div className="bg-white border-4 border-black rounded-3xl shadow-cartoon-xl p-6 sm:p-10 rotate-0">
              <div className="bg-secondary/20 border-3 border-black rounded-2xl aspect-square w-full max-w-sm flex items-center justify-center">
                <Watch size={120} strokeWidth={1.5} className="text-primary" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ATALHOS DE CATEGORIA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-3 gap-4">
          {CATEGORY_SHORTCUTS.map((cat) => (
            <Link
              key={cat.slug}
              to={`/catalogo?categoria=${cat.slug}`}
              className={`
                group flex flex-col items-center justify-center gap-2
                border-3 border-black rounded-2xl p-5 sm:p-8
                shadow-cartoon hover:shadow-cartoon-lg hover:-translate-y-1
                transition-all duration-150 ${cat.color}
              `}
            >
              <cat.icon size={32} strokeWidth={2} className="text-black group-hover:scale-110 transition-transform" />
              <span className="font-display font-semibold text-sm sm:text-base text-black">
                {cat.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* MAIS VENDIDOS */}
      <ProductSection
        title="Mais Vendidos"
        subtitle="Os queridinhos da galera"
        products={featured}
        isLoading={loadingFeatured}
        onAddToCart={addItem}
        accentColor="primary"
      />

      {/* LANÇAMENTOS */}
      <div className="bg-secondary/10 border-y-4 border-black">
        <ProductSection
          title="Lançamentos"
          subtitle="Recém-chegados"
          products={newArrivals}
          isLoading={loadingNew}
          onAddToCart={addItem}
          accentColor="secondary"
        />
      </div>

      {/* INSTAGRAM */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-14">
        <InstagramCTA />
      </section>

      {/* SUGESTÃO DE PRODUTO */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-16">
        <div className="bg-accent-yellow/20 border-3 border-black rounded-3xl shadow-cartoon p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <div className="bg-white border-3 border-black rounded-full p-4 shadow-cartoon-sm shrink-0">
            <MessageSquareHeart size={28} className="text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-display font-bold text-xl">O que você gostaria que a gente vendesse?</h3>
            <p className="text-black/60 text-sm mt-1">
              Sua ideia pode virar o próximo produto da loja. Conta pra gente!
            </p>
          </div>
          <Button variant="primary" onClick={() => setSuggestionOpen(true)}>
            Enviar sugestão
          </Button>
        </div>
      </section>

      <SuggestionModal isOpen={suggestionOpen} onClose={() => setSuggestionOpen(false)} />
    </div>
  );
}
