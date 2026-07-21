import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Edit2, X, Ticket, Power } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { logActivity } from '../../lib/activityLog';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const emptyForm = {
  id: null,
  code: '',
  discount_type: 'percent',
  discount_value: '',
  min_order_value: '',
  usage_limit: '',
  expires_at: '',
  is_active: true,
};

const formatPrice = (value) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadCoupons = async () => {
    const { data } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
    setCoupons(data || []);
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const openNewForm = () => {
    setForm(emptyForm);
    setError('');
    setShowForm(true);
  };

  const openEditForm = (coupon) => {
    setForm({
      id: coupon.id,
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      min_order_value: coupon.min_order_value || '',
      usage_limit: coupon.usage_limit || '',
      expires_at: coupon.expires_at ? coupon.expires_at.slice(0, 10) : '',
      is_active: coupon.is_active,
    });
    setError('');
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const payload = {
      code: form.code.trim().toUpperCase(),
      discount_type: form.discount_type,
      discount_value: parseFloat(form.discount_value),
      min_order_value: form.min_order_value ? parseFloat(form.min_order_value) : null,
      usage_limit: form.usage_limit ? parseInt(form.usage_limit, 10) : null,
      expires_at: form.expires_at || null,
      is_active: form.is_active,
    };

    try {
      if (form.id) {
        const { error: err } = await supabase.from('coupons').update(payload).eq('id', form.id);
        if (err) throw err;
      } else {
        const { error: err } = await supabase.from('coupons').insert(payload);
        if (err) throw err;
      }
      setShowForm(false);
      logActivity(form.id ? 'Cupom editado' : 'Cupom criado', { código: payload.code });
      loadCoupons();
    } catch (err) {
      setError(
        err.message?.includes('duplicate')
          ? 'Já existe um cupom com esse código.'
          : 'Erro ao salvar o cupom.'
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (coupon) => {
    await supabase.from('coupons').update({ is_active: !coupon.is_active }).eq('id', coupon.id);
    logActivity(coupon.is_active ? 'Cupom desativado' : 'Cupom ativado', { código: coupon.code });
    loadCoupons();
  };

  const handleDelete = async (id) => {
    if (!confirm('Excluir este cupom?')) return;
    const coupon = coupons.find((c) => c.id === id);
    await supabase.from('coupons').delete().eq('id', id);
    logActivity('Cupom excluído', { código: coupon?.code });
    loadCoupons();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-display font-bold text-2xl sm:text-3xl flex items-center gap-2">
          <Ticket size={26} /> Cupons de desconto
        </h1>
        <Button variant="primary" icon={Plus} onClick={openNewForm}>
          Novo cupom
        </Button>
      </div>

      {showForm && (
        <motion.form
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="bg-white border-3 border-black rounded-2xl shadow-cartoon p-5 sm:p-6 flex flex-col gap-4 max-w-2xl"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-lg">
              {form.id ? 'Editar cupom' : 'Novo cupom'}
            </h2>
            <button type="button" onClick={() => setShowForm(false)} aria-label="Fechar">
              <X size={20} />
            </button>
          </div>

          <Input
            label="Código"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
            placeholder="Ex: GABI10"
            required
          />

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-display font-semibold text-sm ml-1">Tipo de desconto</label>
              <select
                value={form.discount_type}
                onChange={(e) => setForm({ ...form, discount_type: e.target.value })}
                className="border-3 border-black rounded-2xl px-4 py-3 shadow-cartoon-sm font-body"
              >
                <option value="percent">Porcentagem (%)</option>
                <option value="amount">Valor fixo (R$)</option>
              </select>
            </div>
            <Input
              label={form.discount_type === 'percent' ? 'Desconto (%)' : 'Desconto (R$)'}
              type="number"
              step="0.01"
              value={form.discount_value}
              onChange={(e) => setForm({ ...form, discount_value: e.target.value })}
              placeholder={form.discount_type === 'percent' ? 'Ex: 10' : 'Ex: 15.00'}
              required
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Pedido mínimo (opcional)"
              type="number"
              step="0.01"
              value={form.min_order_value}
              onChange={(e) => setForm({ ...form, min_order_value: e.target.value })}
              placeholder="Ex: 50.00"
            />
            <Input
              label="Limite de usos (opcional)"
              type="number"
              value={form.usage_limit}
              onChange={(e) => setForm({ ...form, usage_limit: e.target.value })}
              placeholder="Deixe em branco para ilimitado"
            />
          </div>

          <Input
            label="Validade (opcional)"
            type="date"
            value={form.expires_at}
            onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
          />

          <label className="flex items-center gap-2 font-display font-semibold text-sm">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              className="w-5 h-5 accent-primary"
            />
            Ativo
          </label>

          {error && <p className="text-red-600 font-semibold text-sm">{error}</p>}

          <Button type="submit" variant="primary" isLoading={saving} isFullWidth>
            Salvar cupom
          </Button>
        </motion.form>
      )}

      <div className="grid gap-3">
        {coupons.map((coupon) => (
          <div
            key={coupon.id}
            className={`bg-white border-3 border-black rounded-2xl shadow-cartoon-sm p-4 flex items-center gap-4 ${
              !coupon.is_active ? 'opacity-50' : ''
            }`}
          >
            <div className="bg-accent-yellow border-2 border-black rounded-xl px-3 py-2 shrink-0">
              <span className="font-display font-bold text-sm">{coupon.code}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display font-semibold text-primary">
                {coupon.discount_type === 'percent'
                  ? `${coupon.discount_value}% de desconto`
                  : `${formatPrice(coupon.discount_value)} de desconto`}
              </p>
              <p className="text-xs text-black/50">
                {coupon.min_order_value && `Pedido mín. ${formatPrice(coupon.min_order_value)} · `}
                Usado {coupon.times_used}x{coupon.usage_limit ? ` de ${coupon.usage_limit}` : ''}
                {coupon.expires_at && ` · válido até ${new Date(coupon.expires_at).toLocaleDateString('pt-BR')}`}
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => toggleActive(coupon)}
                className={`border-2 border-black rounded-xl p-2 shadow-cartoon-sm active:translate-y-0.5 active:shadow-none ${
                  coupon.is_active ? 'bg-accent-green' : 'bg-white'
                }`}
                aria-label="Ativar/desativar"
                title={coupon.is_active ? 'Desativar' : 'Ativar'}
              >
                <Power size={16} />
              </button>
              <button
                onClick={() => openEditForm(coupon)}
                className="bg-white border-2 border-black rounded-xl p-2 shadow-cartoon-sm active:translate-y-0.5 active:shadow-none"
                aria-label="Editar"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => handleDelete(coupon.id)}
                className="bg-white border-2 border-black rounded-xl p-2 shadow-cartoon-sm text-red-600 active:translate-y-0.5 active:shadow-none"
                aria-label="Excluir"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        {coupons.length === 0 && (
          <p className="text-black/50 font-display">Nenhum cupom cadastrado ainda.</p>
        )}
      </div>
    </div>
  );
}
