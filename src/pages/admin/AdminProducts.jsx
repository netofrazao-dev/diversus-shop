import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, Trash2, Edit2, Upload, X, Star, EyeOff, Eye, Tag, Sparkles, Layers,
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { PLACEHOLDER_IMAGE } from '../../lib/constants';
import { compressImage } from '../../lib/imageCompression';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const emptyForm = {
  id: null,
  name: '',
  description: '',
  price: '',
  compare_at_price: '',
  stock: '',
  category_id: '',
  is_featured: false,
  is_new: false,
  is_sold_out: false,
  is_active: true,
  promo_price: '',
  promo_starts_at: '',
  promo_ends_at: '',
};

const formatPrice = (value) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [photos, setPhotos] = useState([]);
  const [recommendedIds, setRecommendedIds] = useState([]);
  const [combos, setCombos] = useState([]); // { key, comboProductId, discountType, discountValue }
  const [optionGroups, setOptionGroups] = useState([]); // { key, name, values: [{key, value, price_adjustment, is_sold_out}] }
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingRelations, setLoadingRelations] = useState(false);

  const loadData = async () => {
    const [{ data: prods }, { data: cats }] = await Promise.all([
      supabase.from('products').select('*, categories(name)').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('name'),
    ]);
    setProducts(prods || []);
    setCategories(cats || []);
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetRelations = () => {
    setRecommendedIds([]);
    setCombos([]);
    setOptionGroups([]);
  };

  const openNewForm = () => {
    setForm(emptyForm);
    setPhotos([]);
    resetRelations();
    setShowForm(true);
  };

  const openEditForm = async (product) => {
    setForm({
      id: product.id,
      name: product.name,
      description: product.description || '',
      price: product.price,
      compare_at_price: product.compare_at_price || '',
      stock: product.stock,
      category_id: product.category_id || '',
      is_featured: product.is_featured,
      is_new: product.is_new,
      is_sold_out: product.is_sold_out,
      is_active: product.is_active,
      promo_price: product.promo_price || '',
      promo_starts_at: product.promo_starts_at ? product.promo_starts_at.slice(0, 10) : '',
      promo_ends_at: product.promo_ends_at ? product.promo_ends_at.slice(0, 10) : '',
    });

    const existingUrls = product.images?.length
      ? product.images
      : product.image_url
      ? [product.image_url]
      : [];
    setPhotos(existingUrls.map((url, i) => ({ key: `existing-${i}-${url}`, url, file: null })));

    setShowForm(true);
    setLoadingRelations(true);

    const [{ data: recs }, { data: combosData }, { data: groupsData }] = await Promise.all([
      supabase.from('product_recommendations').select('recommended_product_id').eq('product_id', product.id),
      supabase.from('product_combos').select('*').eq('product_id', product.id),
      supabase
        .from('product_option_groups')
        .select('*, product_option_values(*)')
        .eq('product_id', product.id)
        .order('display_order'),
    ]);

    setRecommendedIds((recs || []).map((r) => r.recommended_product_id));

    setCombos(
      (combosData || []).map((c) => ({
        key: c.id,
        comboProductId: c.combo_product_id,
        discountType: c.discount_percent ? 'percent' : 'amount',
        discountValue: c.discount_percent || c.discount_amount || '',
      }))
    );

    setOptionGroups(
      (groupsData || []).map((g) => ({
        key: g.id,
        name: g.name,
        values: (g.product_option_values || [])
          .sort((a, b) => a.display_order - b.display_order)
          .map((v) => ({
            key: v.id,
            value: v.value,
            price_adjustment: v.price_adjustment,
            is_sold_out: v.is_sold_out,
          })),
      }))
    );

    setLoadingRelations(false);
  };

  // ---- Fotos ----
  const handleAddPhotos = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const newPhotos = files.map((file) => ({
      key: crypto.randomUUID(),
      url: URL.createObjectURL(file),
      file,
    }));
    setPhotos((prev) => [...prev, ...newPhotos]);
    e.target.value = '';
  };

  const handleRemovePhoto = (key) => setPhotos((prev) => prev.filter((p) => p.key !== key));

  const handleMakeMain = (key) => {
    setPhotos((prev) => {
      const target = prev.find((p) => p.key === key);
      if (!target) return prev;
      return [target, ...prev.filter((p) => p.key !== key)];
    });
  };

  const resolvePhotoUrls = async () => {
    const urls = [];
    for (const photo of photos) {
      if (photo.file) {
        const compressed = await compressImage(photo.file);
        const wasCompressed = compressed !== photo.file;
        const fileName = wasCompressed
          ? `${crypto.randomUUID()}.jpg`
          : `${crypto.randomUUID()}.${photo.file.name.split('.').pop()}`;
        const { error } = await supabase.storage
          .from('product-images')
          .upload(fileName, compressed, {
            contentType: wasCompressed ? 'image/jpeg' : photo.file.type,
          });
        if (error) throw error;
        const { data } = supabase.storage.from('product-images').getPublicUrl(fileName);
        urls.push(data.publicUrl);
      } else {
        urls.push(photo.url);
      }
    }
    return urls;
  };

  // ---- Recomendações ----
  const toggleRecommended = (productId) => {
    setRecommendedIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  // ---- Combos ----
  const addCombo = () => {
    setCombos((prev) => [
      ...prev,
      { key: crypto.randomUUID(), comboProductId: '', discountType: 'percent', discountValue: '' },
    ]);
  };
  const updateCombo = (key, patch) => {
    setCombos((prev) => prev.map((c) => (c.key === key ? { ...c, ...patch } : c)));
  };
  const removeCombo = (key) => setCombos((prev) => prev.filter((c) => c.key !== key));

  // ---- Variações ----
  const addOptionGroup = () => {
    setOptionGroups((prev) => [...prev, { key: crypto.randomUUID(), name: '', values: [] }]);
  };
  const updateOptionGroupName = (key, name) => {
    setOptionGroups((prev) => prev.map((g) => (g.key === key ? { ...g, name } : g)));
  };
  const removeOptionGroup = (key) => setOptionGroups((prev) => prev.filter((g) => g.key !== key));
  const addOptionValue = (groupKey) => {
    setOptionGroups((prev) =>
      prev.map((g) =>
        g.key === groupKey
          ? {
              ...g,
              values: [
                ...g.values,
                { key: crypto.randomUUID(), value: '', price_adjustment: 0, is_sold_out: false },
              ],
            }
          : g
      )
    );
  };
  const updateOptionValue = (groupKey, valueKey, patch) => {
    setOptionGroups((prev) =>
      prev.map((g) =>
        g.key === groupKey
          ? { ...g, values: g.values.map((v) => (v.key === valueKey ? { ...v, ...patch } : v)) }
          : g
      )
    );
  };
  const removeOptionValue = (groupKey, valueKey) => {
    setOptionGroups((prev) =>
      prev.map((g) =>
        g.key === groupKey ? { ...g, values: g.values.filter((v) => v.key !== valueKey) } : g
      )
    );
  };

  // ---- Salvar tudo ----
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const imageUrls = await resolvePhotoUrls();

      const payload = {
        name: form.name,
        description: form.description || null,
        price: parseFloat(form.price),
        compare_at_price: form.compare_at_price ? parseFloat(form.compare_at_price) : null,
        stock: parseInt(form.stock, 10) || 0,
        category_id: form.category_id || null,
        is_featured: form.is_featured,
        is_new: form.is_new,
        is_sold_out: form.is_sold_out,
        is_active: form.is_active,
        promo_price: form.promo_price ? parseFloat(form.promo_price) : null,
        promo_starts_at: form.promo_starts_at || null,
        promo_ends_at: form.promo_ends_at || null,
        image_url: imageUrls[0] || null,
        images: imageUrls,
      };

      let productId = form.id;

      if (productId) {
        const { error } = await supabase.from('products').update(payload).eq('id', productId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('products').insert(payload).select().single();
        if (error) throw error;
        productId = data.id;
      }

      // Sincroniza recomendações (apaga tudo e recria)
      await supabase.from('product_recommendations').delete().eq('product_id', productId);
      if (recommendedIds.length > 0) {
        await supabase.from('product_recommendations').insert(
          recommendedIds.map((recId) => ({ product_id: productId, recommended_product_id: recId }))
        );
      }

      // Sincroniza combos
      await supabase.from('product_combos').delete().eq('product_id', productId);
      const validCombos = combos.filter((c) => c.comboProductId && c.discountValue);
      if (validCombos.length > 0) {
        await supabase.from('product_combos').insert(
          validCombos.map((c) => ({
            product_id: productId,
            combo_product_id: c.comboProductId,
            discount_percent: c.discountType === 'percent' ? parseFloat(c.discountValue) : null,
            discount_amount: c.discountType === 'amount' ? parseFloat(c.discountValue) : null,
          }))
        );
      }

      // Sincroniza variações (grupos + valores)
      await supabase.from('product_option_groups').delete().eq('product_id', productId);
      const validGroups = optionGroups.filter((g) => g.name.trim() && g.values.length > 0);
      for (let i = 0; i < validGroups.length; i++) {
        const group = validGroups[i];
        const { data: groupRow, error: groupError } = await supabase
          .from('product_option_groups')
          .insert({ product_id: productId, name: group.name, display_order: i })
          .select()
          .single();
        if (groupError) throw groupError;

        const validValues = group.values.filter((v) => v.value.trim());
        if (validValues.length > 0) {
          await supabase.from('product_option_values').insert(
            validValues.map((v, vi) => ({
              group_id: groupRow.id,
              value: v.value,
              price_adjustment: parseFloat(v.price_adjustment) || 0,
              is_sold_out: v.is_sold_out,
              display_order: vi,
            }))
          );
        }
      }

      setShowForm(false);
      loadData();
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar produto. Verifique os campos e tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;
    await supabase.from('products').delete().eq('id', productId);
    loadData();
  };

  const otherProducts = products.filter((p) => p.id !== form.id);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-display font-bold text-2xl sm:text-3xl">Produtos</h1>
        <Button variant="primary" icon={Plus} onClick={openNewForm}>
          Novo produto
        </Button>
      </div>

      {showForm && (
        <motion.form
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="bg-white border-3 border-black rounded-2xl shadow-cartoon p-5 sm:p-6 flex flex-col gap-5"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-lg">
              {form.id ? 'Editar produto' : 'Novo produto'}
            </h2>
            <button type="button" onClick={() => setShowForm(false)} aria-label="Fechar">
              <X size={20} />
            </button>
          </div>

          {/* Dados básicos */}
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Nome"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <div className="flex flex-col gap-1.5">
              <label className="font-display font-semibold text-sm ml-1">Categoria</label>
              <select
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                className="border-3 border-black rounded-2xl px-4 py-3 shadow-cartoon-sm font-body"
              >
                <option value="">Selecione...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-display font-semibold text-sm ml-1">Descrição</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="border-3 border-black rounded-2xl px-4 py-3 shadow-cartoon-sm font-body resize-none"
            />
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <Input
              label="Preço (R$)"
              type="number"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
            />
            <Input
              label="Preço 'de' (opcional)"
              type="number"
              step="0.01"
              value={form.compare_at_price}
              onChange={(e) => setForm({ ...form, compare_at_price: e.target.value })}
            />
            <Input
              label="Estoque"
              type="number"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
            />
          </div>

          <div className="flex gap-6 flex-wrap">
            <label className="flex items-center gap-2 font-display font-semibold text-sm">
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                className="w-5 h-5 accent-primary"
              />
              Mais vendido
            </label>
            <label className="flex items-center gap-2 font-display font-semibold text-sm">
              <input
                type="checkbox"
                checked={form.is_new}
                onChange={(e) => setForm({ ...form, is_new: e.target.checked })}
                className="w-5 h-5 accent-primary"
              />
              Lançamento
            </label>
            <label className="flex items-center gap-2 font-display font-semibold text-sm">
              <input
                type="checkbox"
                checked={form.is_sold_out}
                onChange={(e) => setForm({ ...form, is_sold_out: e.target.checked })}
                className="w-5 h-5 accent-primary"
              />
              Esgotado
            </label>
          </div>

          {/* Visibilidade */}
          <label className="flex items-center gap-2 font-display font-semibold text-sm bg-primary-50 border-2 border-black rounded-xl px-4 py-3 w-fit">
            {form.is_active ? <Eye size={18} /> : <EyeOff size={18} />}
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              className="w-5 h-5 accent-primary"
            />
            Visível na loja {!form.is_active && '(oculto no momento)'}
          </label>

          {/* Galeria de imagens */}
          <div className="flex flex-col gap-2">
            <label className="font-display font-semibold text-sm">
              Fotos do produto (a primeira é a foto principal)
            </label>
            <p className="text-xs text-black/50 -mt-1">
              Clique em "Adicionar" quantas vezes quiser — cada foto se soma às anteriores.
            </p>
            <div className="flex flex-wrap gap-3">
              {photos.map((photo, index) => (
                <div key={photo.key} className="relative w-24 h-24 rounded-xl border-3 border-black overflow-hidden shrink-0">
                  <img src={photo.url} alt="" className="w-full h-full object-cover" />
                  {index === 0 && (
                    <span className="absolute bottom-0 left-0 right-0 bg-primary text-white text-[10px] font-display font-bold text-center py-0.5">
                      PRINCIPAL
                    </span>
                  )}
                  <div className="absolute top-1 right-1 flex gap-1">
                    {index !== 0 && (
                      <button type="button" onClick={() => handleMakeMain(photo.key)} className="bg-white border-2 border-black rounded-full p-1 shadow-cartoon-sm" title="Tornar principal">
                        <Star size={11} />
                      </button>
                    )}
                    <button type="button" onClick={() => handleRemovePhoto(photo.key)} className="bg-white border-2 border-black rounded-full p-1 shadow-cartoon-sm text-red-600" title="Remover">
                      <X size={11} />
                    </button>
                  </div>
                </div>
              ))}
              <label className="w-24 h-24 flex flex-col items-center justify-center gap-1 bg-white border-3 border-dashed border-black rounded-xl shadow-cartoon-sm cursor-pointer font-display font-semibold text-xs text-center px-2 shrink-0">
                <Upload size={18} />
                Adicionar
                <input key={photos.length} type="file" accept="image/*" multiple onChange={handleAddPhotos} className="hidden" />
              </label>
            </div>
          </div>

          {/* Promoção */}
          <div className="border-2 border-black rounded-2xl p-4 flex flex-col gap-3 bg-accent-green/10">
            <p className="font-display font-bold flex items-center gap-2">
              <Tag size={18} /> Promoção (opcional)
            </p>
            <div className="grid sm:grid-cols-3 gap-4">
              <Input
                label="Preço promocional (R$)"
                type="number"
                step="0.01"
                value={form.promo_price}
                onChange={(e) => setForm({ ...form, promo_price: e.target.value })}
                placeholder="Deixe em branco se não houver"
              />
              <Input
                label="Início (opcional)"
                type="date"
                value={form.promo_starts_at}
                onChange={(e) => setForm({ ...form, promo_starts_at: e.target.value })}
              />
              <Input
                label="Fim (opcional)"
                type="date"
                value={form.promo_ends_at}
                onChange={(e) => setForm({ ...form, promo_ends_at: e.target.value })}
              />
            </div>
            <p className="text-xs text-black/50">
              Se não preencher início/fim, a promoção fica ativa enquanto o preço promocional estiver preenchido.
            </p>
          </div>

          {/* Variações (cor, tamanho, sabor...) */}
          <div className="border-2 border-black rounded-2xl p-4 flex flex-col gap-4 bg-primary-50/40">
            <div className="flex items-center justify-between">
              <p className="font-display font-bold flex items-center gap-2">
                <Layers size={18} /> Variações (cor, tamanho, sabor...)
              </p>
              <Button type="button" variant="outline" size="sm" icon={Plus} onClick={addOptionGroup}>
                Novo grupo
              </Button>
            </div>

            {optionGroups.length === 0 && (
              <p className="text-sm text-black/50">
                Nenhuma variação. Adicione um grupo (ex: "Tamanho") se este produto tiver opções.
              </p>
            )}

            {optionGroups.map((group) => (
              <div key={group.key} className="bg-white border-2 border-black rounded-xl p-3 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <input
                    value={group.name}
                    onChange={(e) => updateOptionGroupName(group.key, e.target.value)}
                    placeholder='Nome do grupo (ex: "Tamanho")'
                    className="flex-1 border-2 border-black rounded-lg px-3 py-2 font-display font-semibold text-sm"
                  />
                  <button type="button" onClick={() => removeOptionGroup(group.key)} className="text-red-600" aria-label="Remover grupo">
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="flex flex-col gap-2">
                  {group.values.map((val) => (
                    <div key={val.key} className="flex items-center gap-2 flex-wrap">
                      <input
                        value={val.value}
                        onChange={(e) => updateOptionValue(group.key, val.key, { value: e.target.value })}
                        placeholder="Valor (ex: M, Azul)"
                        className="border-2 border-black rounded-lg px-3 py-1.5 text-sm w-32"
                      />
                      <input
                        type="number"
                        step="0.01"
                        value={val.price_adjustment}
                        onChange={(e) => updateOptionValue(group.key, val.key, { price_adjustment: e.target.value })}
                        placeholder="+R$"
                        className="border-2 border-black rounded-lg px-3 py-1.5 text-sm w-24"
                        title="Ajuste de preço (pode ser negativo)"
                      />
                      <label className="flex items-center gap-1 text-xs font-semibold">
                        <input
                          type="checkbox"
                          checked={val.is_sold_out}
                          onChange={(e) => updateOptionValue(group.key, val.key, { is_sold_out: e.target.checked })}
                          className="accent-primary"
                        />
                        Esgotado
                      </label>
                      <button type="button" onClick={() => removeOptionValue(group.key, val.key)} className="text-red-600 ml-auto">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addOptionValue(group.key)}
                    className="text-xs font-display font-semibold text-primary hover:underline text-left"
                  >
                    + adicionar valor
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Recomendações */}
          <div className="border-2 border-black rounded-2xl p-4 flex flex-col gap-3 bg-secondary/10">
            <p className="font-display font-bold flex items-center gap-2">
              <Sparkles size={18} /> Recomendações ("Você também pode gostar")
            </p>
            <div className="max-h-48 overflow-y-auto flex flex-col gap-1.5 bg-white border-2 border-black rounded-xl p-3">
              {otherProducts.length === 0 && (
                <p className="text-sm text-black/50">Cadastre outros produtos primeiro.</p>
              )}
              {otherProducts.map((p) => (
                <label key={p.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={recommendedIds.includes(p.id)}
                    onChange={() => toggleRecommended(p.id)}
                    className="accent-primary"
                  />
                  {p.name}
                </label>
              ))}
            </div>
          </div>

          {/* Combos */}
          <div className="border-2 border-black rounded-2xl p-4 flex flex-col gap-3 bg-accent-yellow/10">
            <div className="flex items-center justify-between">
              <p className="font-display font-bold flex items-center gap-2">
                <Tag size={18} /> Combo — compre junto e ganhe desconto
              </p>
              <Button type="button" variant="outline" size="sm" icon={Plus} onClick={addCombo}>
                Novo combo
              </Button>
            </div>

            {combos.length === 0 && (
              <p className="text-sm text-black/50">Nenhum combo cadastrado para este produto.</p>
            )}

            {combos.map((combo) => (
              <div key={combo.key} className="flex items-center gap-2 flex-wrap bg-white border-2 border-black rounded-xl p-3">
                <select
                  value={combo.comboProductId}
                  onChange={(e) => updateCombo(combo.key, { comboProductId: e.target.value })}
                  className="border-2 border-black rounded-lg px-3 py-2 text-sm flex-1 min-w-[140px]"
                >
                  <option value="">Produto do combo...</option>
                  {otherProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <select
                  value={combo.discountType}
                  onChange={(e) => updateCombo(combo.key, { discountType: e.target.value })}
                  className="border-2 border-black rounded-lg px-2 py-2 text-sm"
                >
                  <option value="percent">% off</option>
                  <option value="amount">R$ off</option>
                </select>
                <input
                  type="number"
                  step="0.01"
                  value={combo.discountValue}
                  onChange={(e) => updateCombo(combo.key, { discountValue: e.target.value })}
                  placeholder={combo.discountType === 'percent' ? 'Ex: 10' : 'Ex: 15.00'}
                  className="border-2 border-black rounded-lg px-3 py-2 text-sm w-28"
                />
                <button type="button" onClick={() => removeCombo(combo.key)} className="text-red-600">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          <Button type="submit" variant="primary" isLoading={saving || loadingRelations} isFullWidth>
            Salvar produto
          </Button>
        </motion.form>
      )}

      {/* Lista de produtos */}
      <div className="grid gap-3">
        {products.map((product) => (
          <div
            key={product.id}
            className={`bg-white border-3 border-black rounded-2xl shadow-cartoon-sm p-4 flex items-center gap-4 ${
              !product.is_active ? 'opacity-50' : ''
            }`}
          >
            <img
              src={product.image_url || PLACEHOLDER_IMAGE}
              alt={product.name}
              className="w-16 h-16 rounded-xl border-2 border-black object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-display font-semibold truncate">{product.name}</p>
                {product.is_sold_out && (
                  <span className="text-xs font-display font-bold border-2 border-black rounded-full px-2.5 py-0.5 bg-accent-pink">
                    ESGOTADO
                  </span>
                )}
                {!product.is_active && (
                  <span className="text-xs font-display font-bold border-2 border-black rounded-full px-2.5 py-0.5 bg-black text-white">
                    OCULTO
                  </span>
                )}
                {product.promo_price && (
                  <span className="text-xs font-display font-bold border-2 border-black rounded-full px-2.5 py-0.5 bg-accent-green">
                    PROMOÇÃO
                  </span>
                )}
                {product.images?.length > 1 && (
                  <span className="text-xs font-display font-semibold text-black/50">
                    +{product.images.length - 1} foto(s)
                  </span>
                )}
              </div>
              <p className="text-sm text-black/60">
                {product.categories?.name || 'Sem categoria'} — Estoque: {product.stock}
              </p>
              <p className="font-display font-bold text-primary">{formatPrice(product.price)}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => openEditForm(product)}
                className="bg-white border-2 border-black rounded-xl p-2 shadow-cartoon-sm active:translate-y-0.5 active:shadow-none"
                aria-label="Editar"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => handleDelete(product.id)}
                className="bg-white border-2 border-black rounded-xl p-2 shadow-cartoon-sm text-red-600 active:translate-y-0.5 active:shadow-none"
                aria-label="Excluir"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
