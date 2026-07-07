import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Edit2, Upload, X, Star } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
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
};

const formatPrice = (value) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  // photos: [{ key, url (preview ou já publicada), file (File novo ou null se já existente) }]
  const [photos, setPhotos] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

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

  const openNewForm = () => {
    setForm(emptyForm);
    setPhotos([]);
    setShowForm(true);
  };

  const openEditForm = (product) => {
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
    });

    // Monta a galeria a partir de "images" (se existir) ou do image_url antigo
    const existingUrls = product.images?.length
      ? product.images
      : product.image_url
      ? [product.image_url]
      : [];

    setPhotos(existingUrls.map((url, i) => ({ key: `existing-${i}-${url}`, url, file: null })));
    setShowForm(true);
  };

  const handleAddPhotos = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newPhotos = files.map((file) => ({
      key: crypto.randomUUID(),
      url: URL.createObjectURL(file),
      file,
    }));

    setPhotos((prev) => [...prev, ...newPhotos]);
    e.target.value = ''; // permite escolher o mesmo arquivo de novo se precisar
  };

  const handleRemovePhoto = (key) => {
    setPhotos((prev) => prev.filter((p) => p.key !== key));
  };

  const handleMakeMain = (key) => {
    setPhotos((prev) => {
      const target = prev.find((p) => p.key === key);
      if (!target) return prev;
      return [target, ...prev.filter((p) => p.key !== key)];
    });
  };

  // Faz upload de quem for novo e devolve a lista final de URLs, na ordem exibida
  const resolvePhotoUrls = async () => {
    const urls = [];
    for (const photo of photos) {
      if (photo.file) {
        const fileExt = photo.file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const { error } = await supabase.storage.from('product-images').upload(fileName, photo.file);
        if (error) throw error;
        const { data } = supabase.storage.from('product-images').getPublicUrl(fileName);
        urls.push(data.publicUrl);
      } else {
        urls.push(photo.url);
      }
    }
    return urls;
  };

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
        image_url: imageUrls[0] || null,
        images: imageUrls,
      };

      if (form.id) {
        await supabase.from('products').update(payload).eq('id', form.id);
      } else {
        await supabase.from('products').insert(payload);
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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-display font-bold text-2xl sm:text-3xl">Produtos</h1>
        <Button variant="primary" icon={Plus} onClick={openNewForm}>
          Novo produto
        </Button>
      </div>

      {/* Formulário */}
      {showForm && (
        <motion.form
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="bg-white border-3 border-black rounded-2xl shadow-cartoon p-5 sm:p-6 flex flex-col gap-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-lg">
              {form.id ? 'Editar produto' : 'Novo produto'}
            </h2>
            <button type="button" onClick={() => setShowForm(false)} aria-label="Fechar">
              <X size={20} />
            </button>
          </div>

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

          {/* Galeria de imagens */}
          <div className="flex flex-col gap-2">
            <label className="font-display font-semibold text-sm">
              Fotos do produto (a primeira é a foto principal)
            </label>

            <div className="flex flex-wrap gap-3">
              {photos.map((photo, index) => (
                <div
                  key={photo.key}
                  className="relative w-24 h-24 rounded-xl border-3 border-black overflow-hidden shrink-0"
                >
                  <img src={photo.url} alt="" className="w-full h-full object-cover" />

                  {index === 0 && (
                    <span className="absolute bottom-0 left-0 right-0 bg-primary text-white text-[10px] font-display font-bold text-center py-0.5">
                      PRINCIPAL
                    </span>
                  )}

                  <div className="absolute top-1 right-1 flex gap-1">
                    {index !== 0 && (
                      <button
                        type="button"
                        onClick={() => handleMakeMain(photo.key)}
                        className="bg-white border-2 border-black rounded-full p-1 shadow-cartoon-sm"
                        title="Tornar principal"
                      >
                        <Star size={11} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(photo.key)}
                      className="bg-white border-2 border-black rounded-full p-1 shadow-cartoon-sm text-red-600"
                      title="Remover"
                    >
                      <X size={11} />
                    </button>
                  </div>
                </div>
              ))}

              <label className="w-24 h-24 flex flex-col items-center justify-center gap-1 bg-white border-3 border-dashed border-black rounded-xl shadow-cartoon-sm cursor-pointer font-display font-semibold text-xs text-center px-2 shrink-0">
                <Upload size={18} />
                Adicionar
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleAddPhotos}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <Button type="submit" variant="primary" isLoading={saving} isFullWidth>
            Salvar produto
          </Button>
        </motion.form>
      )}

      {/* Lista de produtos */}
      <div className="grid gap-3">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white border-3 border-black rounded-2xl shadow-cartoon-sm p-4 flex items-center gap-4"
          >
            <img
              src={product.image_url || '/placeholder-product.png'}
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
