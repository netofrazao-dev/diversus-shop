import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, User, Phone, Mail, Home, Hash, CheckCircle2 } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { openWhatsAppOrder } from '../lib/whatsapp';
import { supabase } from '../lib/supabaseClient';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

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

export default function Checkout() {
  const navigate = useNavigate();
  const { items, getTotalPrice, getSubtotal, getComboDiscount, clearCart } = useCartStore();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const total = getTotalPrice();
  const subtotal = getSubtotal();
  const comboDiscount = getComboDiscount();

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((err) => ({ ...err, [field]: null }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Informe seu nome completo';
    if (!form.phone.trim()) newErrors.phone = 'Informe seu telefone';
    if (!form.street.trim()) newErrors.street = 'Informe a rua';
    if (!form.number.trim()) newErrors.number = 'Informe o número';
    if (!form.neighborhood.trim()) newErrors.neighborhood = 'Informe o bairro';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      openWhatsAppOrder(STORE_WHATSAPP, form, items, total);

      // 4. Limpa o carrinho e redireciona
      clearCart();
      navigate('/', { state: { orderSuccess: true } });
    } catch (err) {
      console.error(err);
      setErrors((e2) => ({ ...e2, general: 'Não foi possível finalizar o pedido. Tente novamente.' }));
    } finally {
      setSubmitting(false);
    }
  };

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
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-black/70">
                  {item.quantity}x {item.name}
                </span>
                <span className="font-semibold">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t-2 border-black pt-3 flex flex-col gap-1.5">
            {comboDiscount > 0 && (
              <>
                <div className="flex justify-between text-sm text-black/60">
                  <span>Subtotal</span>
                  <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold text-green-700">
                  <span>Desconto combo</span>
                  <span>-{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(comboDiscount)}</span>
                </div>
              </>
            )}
            <div className="flex justify-between items-center">
              <span className="font-display font-semibold">Total</span>
              <span className="font-display font-bold text-2xl text-primary">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
              </span>
            </div>
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
        </motion.div>
      </form>
    </div>
  );
}
