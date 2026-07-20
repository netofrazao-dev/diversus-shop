import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, User, Phone, Mail, Home, Hash, CheckCircle2, Truck, Tag, X, Check, Loader2, ShieldCheck } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { openWhatsAppOrder } from '../lib/whatsapp';
import { supabase } from '../lib/supabaseClient';
import { isPixConfigured } from '../lib/pix';
import { validateCoupon } from '../lib/coupons';
import { getPendingCoupon, clearPendingCoupon } from '../hooks/useCouponCapture';
import { DELIVERY_FEE, DELIVERY_TIME_NOTE } from '../lib/constants';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { lazy, Suspense } from 'react';
// PixPayment usa a biblioteca "qrcode" (relativamente pesada) e só aparece
// DEPOIS que o pedido é confirmado — não faz sentido baixar isso no
// carregamento inicial do checkout, então vira um chunk separado.
const PixPayment = lazy(() => import('../components/product/PixPayment'));
import HoneypotField from '../components/ui/HoneypotField';

const STORE_WHATSAPP = import.meta.env.VITE_STORE_WHATSAPP || '5500000000000';

const initialForm = {
  name: '',
  phone: '',
  email: '',
  street: '',
  number: '',
  complement: '',
  neighborhood: '',
};

const formatPrice = (value) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export default function Checkout() {
  const navigate = useNavigate();
  const { items, getTotalPrice, getSubtotal, getComboDiscount, clearCart } = useCartStore();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [honeypot, setHoneypot] = useState('');

  // Cupom de desconto
  const [couponInput, setCouponInput] = useState('');
  const [couponApplied, setCouponApplied] = useState(null); // { code, discount }
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  // Depois que o pedido é criado, se a loja tiver Pix configurado,
  // mostramos a tela de pagamento antes de voltar pra loja.
  const [completedOrder, setCompletedOrder] = useState(null); // { amount, shortId }

  const subtotal = getSubtotal();
  const comboDiscount = getComboDiscount();
  const afterCombo = getTotalPrice(); // subtotal já com desconto de combo aplicado
  const couponDiscount = couponApplied?.discount || 0;
  const total = Math.max(0, afterCombo - couponDiscount) + DELIVERY_FEE;

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((err) => ({ ...err, [field]: null }));
  };

  const applyCoupon = async (codeToApply) => {
    setCouponError('');
    setCouponLoading(true);
    const result = await validateCoupon(codeToApply, afterCombo);
    setCouponLoading(false);

    if (result.error) {
      setCouponError(result.error);
      setCouponApplied(null);
      return;
    }

    setCouponApplied({ code: result.coupon.code, discount: result.discount });
  };

  const handleApplyCoupon = () => applyCoupon(couponInput);

  // Se o cliente chegou por um link com ?cupom=CODIGO, aplica sozinho
  useEffect(() => {
    const pending = getPendingCoupon();
    if (pending) {
      setCouponInput(pending);
      applyCoupon(pending);
      clearPendingCoupon();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRemoveCoupon = () => {
    setCouponApplied(null);
    setCouponInput('');
    setCouponError('');
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Informe seu nome completo';
    if (!form.phone.trim()) newErrors.phone = 'Informe seu telefone';
    if (!form.street.trim()) newErrors.street = 'Informe a rua';
    if (!form.number.trim()) newErrors.number = 'Informe o número';
    if (!form.neighborhood.trim()) newErrors.neighborhood = 'Informe o bairro';
    if (!consentAccepted) newErrors.consent = 'É preciso aceitar a Política de Privacidade para continuar';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (honeypot) return; // preenchido = bot, aborta silenciosamente
    if (items.length === 0) return;
    if (!validate()) return;

    setSubmitting(true);
    try {
      // 1. Cria o pedido no Supabase
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_name: form.name,
          customer_phone: form.phone,
          customer_email: form.email || null,
          street: form.street,
          number: form.number,
          complement: form.complement || null,
          neighborhood: form.neighborhood,
          total,
          coupon_code: couponApplied?.code || null,
          coupon_discount: couponApplied?.discount || null,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Cria os itens do pedido
      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.productId,
        product_name: item.variantLabel ? `${item.name} (${item.variantLabel})` : item.name,
        unit_price: item.price,
        quantity: item.quantity,
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;

      // 3. Abre o WhatsApp com o pedido formatado
      openWhatsAppOrder(STORE_WHATSAPP, form, items, total, {
        deliveryFee: DELIVERY_FEE,
        coupon: couponApplied,
      });

      // 4. Limpa o carrinho
      clearCart();

      // 5. Se a loja tiver Pix configurado, mostra a tela de pagamento.
      //    Senão, volta direto pra loja como antes.
      if (isPixConfigured()) {
        setCompletedOrder({ amount: total, shortId: order.id.slice(0, 8) });
      } else {
        navigate('/', { state: { orderSuccess: true } });
      }
    } catch (err) {
      console.error(err);
      setErrors((e2) => ({ ...e2, general: 'Não foi possível finalizar o pedido. Tente novamente.' }));
    } finally {
      setSubmitting(false);
    }
  };

  // ---- Tela de pagamento Pix (depois do pedido criado) ----
  if (completedOrder) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin text-primary" size={40} />
            </div>
          }
        >
          <PixPayment
            amount={completedOrder.amount}
            orderShortId={completedOrder.shortId}
            onContinue={() => navigate('/', { state: { orderSuccess: true } })}
          />
        </Suspense>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center flex flex-col items-center gap-4">
        <h1 className="font-display font-bold text-2xl">Seu carrinho está vazio</h1>
        <p className="text-black/60">Adicione produtos ao carrinho antes de finalizar o pedido.</p>
        <Button variant="primary" onClick={() => navigate('/catalogo')}>
          Ir para o catálogo
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <h1 className="font-display font-bold text-3xl sm:text-4xl text-black mb-2">
        Finalizar pedido
      </h1>
      <p className="text-black/60 mb-8">
        Preencha seus dados de entrega. Ao confirmar, vamos abrir o WhatsApp com o resumo do seu pedido.
      </p>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
        <HoneypotField value={honeypot} onChange={setHoneypot} />
        {/* Formulário */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white border-3 border-black rounded-2xl shadow-cartoon p-5 sm:p-6 flex flex-col gap-4">
            <h2 className="font-display font-bold text-lg flex items-center gap-2">
              <User size={20} /> Seus dados
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Nome completo"
                icon={User}
                value={form.name}
                onChange={handleChange('name')}
                error={errors.name}
                placeholder="Seu nome"
              />
              <Input
                label="Telefone / WhatsApp"
                icon={Phone}
                value={form.phone}
                onChange={handleChange('phone')}
                error={errors.phone}
                placeholder="(00) 00000-0000"
              />
            </div>
            <Input
              label="E-mail (opcional)"
              icon={Mail}
              type="email"
              value={form.email}
              onChange={handleChange('email')}
              placeholder="voce@email.com"
            />
          </div>

          <div className="bg-white border-3 border-black rounded-2xl shadow-cartoon p-5 sm:p-6 flex flex-col gap-4">
            <h2 className="font-display font-bold text-lg flex items-center gap-2">
              <MapPin size={20} /> Endereço de entrega
            </h2>

            <div className="grid sm:grid-cols-3 gap-4">
              <Input
                label="Rua"
                icon={Home}
                containerClassName="sm:col-span-2"
                value={form.street}
                onChange={handleChange('street')}
                error={errors.street}
              />
              <Input
                label="Número"
                icon={Hash}
                value={form.number}
                onChange={handleChange('number')}
                error={errors.number}
              />
            </div>

            <Input
              label="Complemento (opcional)"
              value={form.complement}
              onChange={handleChange('complement')}
              placeholder="Apto, bloco, referência..."
            />

            <Input
              label="Bairro"
              value={form.neighborhood}
              onChange={handleChange('neighborhood')}
              error={errors.neighborhood}
            />
          </div>

          {/* Cupom de desconto */}
          <div className="bg-white border-3 border-black rounded-2xl shadow-cartoon p-5 sm:p-6 flex flex-col gap-3">
            <h2 className="font-display font-bold text-lg flex items-center gap-2">
              <Tag size={20} /> Cupom de desconto
            </h2>

            {couponApplied ? (
              <div className="flex items-center justify-between bg-accent-green/20 border-2 border-black rounded-xl px-4 py-3">
                <span className="flex items-center gap-2 font-display font-semibold text-sm">
                  <Check size={16} className="text-green-700" />
                  {couponApplied.code} aplicado (-{formatPrice(couponApplied.discount)})
                </span>
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="text-red-600"
                  aria-label="Remover cupom"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  value={couponInput}
                  onChange={(e) => {
                    setCouponInput(e.target.value);
                    setCouponError('');
                  }}
                  placeholder="Digite o código"
                  className="flex-1 border-3 border-black rounded-2xl px-4 py-2.5 font-body uppercase shadow-cartoon-sm focus:outline-none"
                />
                <Button
                  type="button"
                  variant="outline"
                  isLoading={couponLoading}
                  onClick={handleApplyCoupon}
                  disabled={!couponInput.trim()}
                >
                  Aplicar
                </Button>
              </div>
            )}
            {couponError && <p className="text-red-600 font-semibold text-sm">{couponError}</p>}
          </div>

          {errors.general && (
            <p className="text-red-600 font-semibold text-sm">{errors.general}</p>
          )}
        </div>

        {/* Resumo do pedido */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border-3 border-black rounded-2xl shadow-cartoon-lg p-5 sm:p-6 h-fit flex flex-col gap-4"
        >
          <h2 className="font-display font-bold text-lg">Resumo do pedido</h2>
          <div className="flex flex-col gap-3 max-h-64 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm gap-2">
                <span className="text-black/70">
                  {item.quantity}x {item.name}
                  {item.variantLabel && (
                    <span className="text-black/40"> ({item.variantLabel})</span>
                  )}
                </span>
                <span className="font-semibold shrink-0">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="border-t-2 border-black pt-3 flex flex-col gap-1.5">
            {comboDiscount > 0 && (
              <>
                <div className="flex justify-between text-sm text-black/60">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold text-green-700">
                  <span>Desconto combo</span>
                  <span>-{formatPrice(comboDiscount)}</span>
                </div>
              </>
            )}
            {couponDiscount > 0 && (
              <div className="flex justify-between text-sm font-semibold text-green-700">
                <span>Cupom {couponApplied.code}</span>
                <span>-{formatPrice(couponDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm text-black/60">
              <span>Taxa de entrega</span>
              <span>{formatPrice(DELIVERY_FEE)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-display font-semibold">Total</span>
              <span className="font-display font-bold text-2xl text-primary">
                {formatPrice(total)}
              </span>
            </div>
            <p className="flex items-center gap-1.5 text-xs text-black/50">
              <Truck size={13} /> {DELIVERY_TIME_NOTE}
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <label className="flex items-start gap-2 text-xs text-black/70">
              <input
                type="checkbox"
                checked={consentAccepted}
                onChange={(e) => {
                  setConsentAccepted(e.target.checked);
                  setErrors((err) => ({ ...err, consent: null }));
                }}
                className="w-4 h-4 mt-0.5 accent-primary shrink-0"
              />
              <span>
                Li e concordo com a{' '}
                <Link to="/privacidade" target="_blank" className="font-semibold underline">
                  Política de Privacidade
                </Link>{' '}
                e autorizo o uso dos meus dados para processar este pedido.
              </span>
            </label>
            {errors.consent && (
              <p className="text-red-600 font-semibold text-xs ml-6">{errors.consent}</p>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isFullWidth
            isLoading={submitting}
            icon={CheckCircle2}
          >
            Confirmar e enviar no WhatsApp
          </Button>

          <p className="flex items-center justify-center gap-1.5 text-xs text-black/50 -mt-1">
            <ShieldCheck size={14} /> Seus dados estão protegidos e não são compartilhados
          </p>
        </motion.div>
      </form>
    </div>
  );
}
