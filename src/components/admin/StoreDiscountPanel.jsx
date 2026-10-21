import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Percent, X } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { logActivity } from '../../lib/activityLog';
import { useGlobalDiscount } from '../../lib/pricing';
import Button from '../ui/Button';

/**
 * StoreDiscountPanel — botão "Desconto na loja toda" + janelinha pra
 * ligar/desligar. O desconto vale pra todos os produtos (quando o produto
 * já tem promoção própria, vale o menor preço) e some sozinho na data final.
 */
export default function StoreDiscountPanel({ onMessage }) {
  const queryClient = useQueryClient();
  const { percent: activePercent, endsAt: activeEndsAt } = useGlobalDiscount();
  const [open, setOpen] = useState(false);
  const [percent, setPercent] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setPercent(activePercent > 0 ? String(activePercent) : '');
    setEndsAt(activeEndsAt ? activeEndsAt.slice(0, 10) : '');
  }, [open, activePercent, activeEndsAt]);

  const save = async (nextPercent, nextEndsAt) => {
    setSaving(true);
    // Data final = fim do dia escolhido (horário local)
    const endsIso = nextEndsAt ? new Date(`${nextEndsAt}T23:59:59`).toISOString() : null;
    const { error } = await supabase
      .from('store_settings')
      .upsert({
        id: 1,
        global_discount_percent: nextPercent,
        global_discount_ends_at: nextPercent > 0 ? endsIso : null,
        updated_at: new Date().toISOString(),
      });
    setSaving(false);

    if (error) {
      onMessage?.({
        type: 'error',
        message: 'Não foi possível salvar. Você já rodou o SQL migration_store_discount.sql no Supabase?',
      });
      return;
    }

    logActivity(nextPercent > 0 ? 'Desconto na loja toda ativado' : 'Desconto na loja toda desativado', {
      percent: nextPercent,
      até: nextEndsAt || 'sem data final',
    });
    await queryClient.invalidateQueries({ queryKey: ['store-settings'] });
    onMessage?.({
      type: 'success',
      message: nextPercent > 0 ? `${nextPercent}% de desconto ligado na loja toda!` : 'Desconto da loja toda desligado.',
    });
    setOpen(false);
  };

  const handleActivate = (e) => {
    e.preventDefault();
    const value = parseFloat(String(percent).replace(',', '.'));
    if (!(value > 0 && value <= 90)) {
      onMessage?.({ type: 'error', message: 'Digite um desconto entre 1 e 90%.' });
      return;
    }
    save(Math.round(value * 100) / 100, endsAt);
  };

  return (
    <>
      <Button variant={activePercent > 0 ? 'secondary' : 'outline'} icon={Percent} onClick={() => setOpen(true)}>
        {activePercent > 0 ? `Desconto ligado: ${activePercent}%` : 'Desconto na loja toda'}
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <form
            onSubmit={handleActivate}
            onClick={(e) => e.stopPropagation()}
            className="bg-white border-4 border-black rounded-3xl shadow-cartoon-lg p-5 sm:p-6 w-full max-w-sm flex flex-col gap-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-lg">Desconto na loja toda</h2>
              <button type="button" onClick={() => setOpen(false)} aria-label="Fechar">
                <X size={20} />
              </button>
            </div>

            <label className="flex flex-col gap-1 text-sm font-display font-semibold">
              Quantos % de desconto?
              <input
                type="number"
                inputMode="decimal"
                min="1"
                max="90"
                step="0.5"
                value={percent}
                onChange={(e) => setPercent(e.target.value)}
                placeholder="Ex: 10"
                className="border-3 border-black rounded-2xl px-3 py-2.5 text-base font-body"
                autoFocus
              />
            </label>

            <label className="flex flex-col gap-1 text-sm font-display font-semibold">
              Até quando? (opcional)
              <input
                type="date"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                className="border-3 border-black rounded-2xl px-3 py-2.5 text-base font-body"
              />
              <span className="text-xs font-body font-normal text-black/50">
                Em branco = fica ligado até você desligar. Termina no fim do dia escolhido.
              </span>
            </label>

            <p className="text-xs text-black/50">
              Vale pra todos os produtos. Se um produto já tem promoção própria melhor, vale a melhor
              (não soma). Itens que o cliente já colocou no carrinho mantêm o preço de quando foram adicionados.
            </p>

            <div className="flex flex-col gap-2">
              <Button type="submit" variant="primary" isLoading={saving}>
                {activePercent > 0 ? 'Atualizar desconto' : 'Ligar desconto'}
              </Button>
              {activePercent > 0 && (
                <Button type="button" variant="outline" isLoading={saving} onClick={() => save(0, '')}>
                  Desligar desconto
                </Button>
              )}
            </div>
          </form>
        </div>
      )}
    </>
  );
}
