import { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Minus, Plus, ChevronLeft, BellRing, Tag, Sparkles } from 'lucide-react';
import {
  useProduct,
  useProductOptions,
  useProductRecommendations,
  useProductCombos,
  getEffectivePrice,
} from '../hooks/useProducts';
import { useCartStore } from '../store/cartStore';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import RestockRequestModal from '../components/product/RestockRequestModal';
import ProductCard from '../components/product/ProductCard';
import InstagramCTA from '../components/layout/InstagramCTA';

const formatPrice = (value) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export default function ProductDetail() {
  const { id } = useParams();
  const { data: product, isLoading } = useProduct(id);
  const { data: optionGroups } = useProductOptions(id);
  const { data: recommendations } = useProductRecommendations(id, product?.category_id);
  const { data: combos } = useProductCombos(id);

  const addItem = useCartStore((state) => state.addItem);
  const addCombo = useCartStore((state) => state.addCombo);

  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [restockModalOpen, setRestockModalOpen] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState({}); // { groupId: valueObj }

  const hasOptions = optionGroups && optionGroups.length > 0;
  const allOptionsSelected =
    !hasOptions || optionGroups.every((group) => selectedOptions[group.id]);

  const variant = useMemo(() => {
    if (!hasOptions) return null;
    const chosen = optionGroups
      .filter((g) => selectedOptions[g.id])
      .map((g) => ({ groupName: g.name, value: selectedOptions[g.id].value, adjustment: selectedOptions[g.id].price_adjustment }));

    if (chosen.length === 0) return null;

    return {
      label: chosen.map((c) => `${c.groupName}: ${c.value}`).join(' / '),
      signature: chosen.map((c) => `${c.groupName}:${c.value}`).join('|'),
      priceAdjustment: chosen.reduce((sum, c) => sum + Number(c.adjustment || 0), 0),
    };
  }, [hasOptions, optionGroups, selectedOptions]);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 grid md:grid-cols-2 gap-10">
        <div className="bg-primary-50 border-3 border-black rounded-2xl aspect-square animate-pulse" />
        <div className="flex flex-col gap-4">
          <div className="h-8 bg-primary-50 rounded-xl w-3/4 animate-pulse" />
          <div className="h-10 bg-primary-50 rounded-xl w-1/2 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <h1 className="font-display font-bold text-2xl mb-4">Produto não encontrado</h1>
        <Link to="/catalogo">
          <Button variant="primary">Voltar ao catálogo</Button>
        </Link>
      </div>
    );
  }

  const { isPromo, price: effectivePrice, originalPrice } = getEffectivePrice(product);
  const hasDiscount = isPromo || (product.compare_at_price && product.compare_at_price > product.price);
  const strikethroughPrice = isPromo ? originalPrice : product.compare_at_price;

  const gallery = product.images?.length
    ? product.images
    : product.image_url
    ? [product.image_url]
    : [];

  const handleAddToCart = () => {
    if (hasOptions && !allOptionsSelected) return;
    addItem(product, quantity, variant);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleSelectOption = (group, value) => {
    if (value.is_sold_out) return;
    setSelectedOptions((prev) => ({ ...prev, [group.id]: value }));
  };

  const finalUnitPrice = effectivePrice + (variant?.priceAdjustment || 0);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <Link
        to="/catalogo"
        className="inline-flex items-center gap-1 font-display font-semibold text-sm mb-6 hover:underline"
      >
        <ChevronLeft size={18} /> Voltar ao catálogo
      </Link>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Imagem */}
        <div className="flex flex-col gap-3">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-primary-50 border-4 border-black rounded-3xl shadow-cartoon-lg overflow-hidden aspect-square"
          >
            {(product.is_new || product.is_featured || product.is_sold_out || isPromo) && (
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                {product.is_sold_out && <Badge color="pink">ESGOTADO</Badge>}
                {!product.is_sold_out && isPromo && <Badge color="green">PROMOÇÃO</Badge>}
                {!product.is_sold_out && product.is_new && <Badge color="secondary">NOVIDADE</Badge>}
                {!product.is_sold_out && product.is_featured && <Badge color="yellow">MAIS VENDIDO</Badge>}
              </div>
            )}
            <img
              src={gallery[activeImage] || '/placeholder-product.png'}
              alt={product.name}
              className={`w-full h-full object-cover ${product.is_sold_out ? 'grayscale opacity-70' : ''}`}
            />
          </motion.div>

          {gallery.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {gallery.map((imgUrl, index) => (
                <button
                  key={imgUrl + index}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  className={`
                    shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden
                    border-3 transition-all
                    ${activeImage === index ? 'border-primary shadow-cartoon-sm' : 'border-black/20 hover:border-black'}
                  `}
                >
                  <img src={imgUrl} alt={`${product.name} — foto ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Informações */}
        <div className="flex flex-col gap-5">
          {product.categories?.name && (
            <span className="font-display font-semibold text-xs uppercase tracking-wide text-primary">
              {product.categories.name}
            </span>
          )}

          <h1 className="font-display font-bold text-3xl sm:text-4xl text-black">
            {product.name}
          </h1>

          {product.description && (
            <p className="font-body text-black/70 leading-relaxed">{product.description}</p>
          )}

          <div className="flex items-baseline gap-3">
            {hasDiscount && (
              <span className="text-lg text-black/40 line-through font-body">
                {formatPrice(strikethroughPrice)}
              </span>
            )}
            <span className="font-display font-bold text-4xl text-primary">
              {formatPrice(finalUnitPrice)}
            </span>
          </div>

          {/* Seletores de variação (cor, tamanho, sabor...) */}
          {hasOptions &&
            optionGroups.map((group) => (
              <div key={group.id} className="flex flex-col gap-2">
                <span className="font-display font-semibold text-sm">{group.name}</span>
                <div className="flex flex-wrap gap-2">
                  {group.product_option_values.map((value) => {
                    const isSelected = selectedOptions[group.id]?.id === value.id;
                    return (
                      <button
                        key={value.id}
                        type="button"
                        disabled={value.is_sold_out}
                        onClick={() => handleSelectOption(group, value)}
                        className={`
                          px-4 py-2 rounded-xl border-3 border-black font-display font-semibold text-sm
                          transition-all shadow-cartoon-sm
                          ${isSelected ? 'bg-primary text-white' : 'bg-white text-black hover:bg-secondary/30'}
                          ${value.is_sold_out ? 'opacity-40 cursor-not-allowed line-through' : ''}
                        `}
                      >
                        {value.value}
                        {value.price_adjustment > 0 && ` (+${formatPrice(value.price_adjustment)})`}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

          {product.is_sold_out ? (
            <>
              <p className="font-display font-semibold text-black/70 bg-accent-pink/20 border-2 border-black rounded-2xl px-4 py-3 mt-2">
                Este produto está esgotado no momento.
              </p>
              <Button
                variant="primary"
                size="xl"
                icon={BellRing}
                isFullWidth
                onClick={() => setRestockModalOpen(true)}
              >
                Avise-me quando chegar
              </Button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-4">
                <span className="font-display font-semibold text-sm">Quantidade</span>
                <div className="flex items-center gap-3 bg-white border-3 border-black rounded-2xl shadow-cartoon-sm px-2 py-1">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-2 hover:bg-secondary/30 rounded-xl transition-colors"
                    aria-label="Diminuir quantidade"
                  >
                    <Minus size={16} strokeWidth={3} />
                  </button>
                  <span className="font-display font-bold w-6 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="p-2 hover:bg-secondary/30 rounded-xl transition-colors"
                    aria-label="Aumentar quantidade"
                  >
                    <Plus size={16} strokeWidth={3} />
                  </button>
                </div>
              </div>

              <Button
                variant="primary"
                size="xl"
                icon={ShoppingCart}
                isFullWidth
                disabled={hasOptions && !allOptionsSelected}
                onClick={handleAddToCart}
                className="mt-2"
              >
                {added
                  ? 'Adicionado! ✓'
                  : hasOptions && !allOptionsSelected
                  ? 'Escolha as opções acima'
                  : 'Adicionar ao carrinho'}
              </Button>

              {product.stock > 0 && product.stock <= 5 && (
                <p className="text-sm font-semibold text-accent-orange">
                  Últimas {product.stock} unidades em estoque!
                </p>
              )}
            </>
          )}

          <RestockRequestModal
            product={product}
            isOpen={restockModalOpen}
            onClose={() => setRestockModalOpen(false)}
          />
        </div>
      </div>

      {/* Compre junto e ganhe desconto */}
      {combos?.length > 0 && (
        <section className="mt-14">
          <h2 className="font-display font-bold text-2xl mb-4 flex items-center gap-2">
            <Tag size={22} /> Compre junto e ganhe desconto
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {combos.map((combo) => {
              const comboProduct = combo.combo_product;
              const comboEffective = getEffectivePrice(comboProduct);
              const pairTotal = finalUnitPrice + comboEffective.price;
              const discount = combo.discount_percent
                ? (pairTotal * combo.discount_percent) / 100
                : combo.discount_amount || 0;
              const finalPairPrice = pairTotal - discount;

              return (
                <div
                  key={combo.id}
                  className="bg-white border-3 border-black rounded-2xl shadow-cartoon p-4 flex flex-col gap-3"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={product.image_url || '/placeholder-product.png'}
                      alt={product.name}
                      className="w-14 h-14 rounded-xl border-2 border-black object-cover"
                    />
                    <span className="font-display font-bold text-xl text-black/30">+</span>
                    <img
                      src={comboProduct.image_url || '/placeholder-product.png'}
                      alt={comboProduct.name}
                      className="w-14 h-14 rounded-xl border-2 border-black object-cover"
                    />
                    <div className="min-w-0">
                      <p className="font-display font-semibold text-sm truncate">{comboProduct.name}</p>
                      <span className="text-xs font-display font-bold text-white bg-primary rounded-full px-2 py-0.5 inline-block mt-1">
                        {combo.discount_percent
                          ? `${combo.discount_percent}% OFF no par`
                          : `${formatPrice(combo.discount_amount)} OFF no par`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-sm text-black/40 line-through">{formatPrice(pairTotal)}</span>
                    <span className="font-display font-bold text-xl text-primary">
                      {formatPrice(finalPairPrice)}
                    </span>
                  </div>

                  <Button
                    variant="secondary"
                    size="md"
                    isFullWidth
                    onClick={() => addCombo(combo, product, comboProduct)}
                  >
                    Adicionar os dois com desconto
                  </Button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Você também pode gostar */}
      {recommendations?.length > 0 && (
        <section className="mt-14">
          <h2 className="font-display font-bold text-2xl mb-4 flex items-center gap-2">
            <Sparkles size={22} /> Você também pode gostar
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {recommendations.map((rec) => (
              <ProductCard key={rec.id} product={rec} onAddToCart={(p) => addItem(p)} />
            ))}
          </div>
        </section>
      )}

      <div className="mt-14 max-w-md mx-auto">
        <InstagramCTA variant="compact" />
      </div>
    </div>
  );
}
