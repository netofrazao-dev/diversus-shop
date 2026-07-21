import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, X, Video, Image as ImageIcon, EyeOff, Eye, Clapperboard } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { compressImage } from '../../lib/imageCompression';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const MAX_VIDEO_SIZE_MB = 50; // limite comum do plano gratuito do Supabase Storage

export default function AdminStories() {
  const [stories, setStories] = useState([]);
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [caption, setCaption] = useState('');
  const [productId, setProductId] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [mediaType, setMediaType] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadData = async () => {
    const [{ data: storiesData }, { data: productsData }] = await Promise.all([
      supabase.from('store_stories').select('*, products(name)').order('created_at', { ascending: false }),
      supabase.from('products').select('id, name').order('name'),
    ]);
    setStories(storiesData || []);
    setProducts(productsData || []);
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setCaption('');
    setProductId('');
    setExpiresAt('');
    setFile(null);
    setPreview('');
    setMediaType(null);
    setError('');
  };

  const openNewForm = () => {
    resetForm();
    setShowForm(true);
  };

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const isVideo = selected.type.startsWith('video/');
    const isImage = selected.type.startsWith('image/');

    if (!isVideo && !isImage) {
      setError('Escolha uma foto ou um vídeo.');
      return;
    }

    if (isVideo && selected.size > MAX_VIDEO_SIZE_MB * 1024 * 1024) {
      setError(`Esse vídeo tem mais de ${MAX_VIDEO_SIZE_MB}MB — tente um arquivo menor.`);
      return;
    }

    setError('');
    setFile(selected);
    setMediaType(isVideo ? 'video' : 'image');
    setPreview(URL.createObjectURL(selected));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Escolha uma foto ou vídeo pra publicar.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      // Fotos são comprimidas automaticamente; vídeos sobem do jeito que estão
      const fileToUpload = mediaType === 'image' ? await compressImage(file) : file;
      const fileExt = fileToUpload.name?.split('.').pop() || (mediaType === 'video' ? 'mp4' : 'jpg');
      const fileName = `${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('store-stories')
        .upload(fileName, fileToUpload);
      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from('store-stories').getPublicUrl(fileName);

      const { error: insertError } = await supabase.from('store_stories').insert({
        caption: caption.trim() || null,
        media_url: publicUrlData.publicUrl,
        media_type: mediaType,
        product_id: productId || null,
        expires_at: expiresAt || null,
      });
      if (insertError) throw insertError;

      setShowForm(false);
      resetForm();
      loadData();
    } catch (err) {
      console.error(err);
      setError('Não foi possível publicar. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (story) => {
    setStories((prev) =>
      prev.map((s) => (s.id === story.id ? { ...s, is_active: !s.is_active } : s))
    );
    await supabase.from('store_stories').update({ is_active: !story.is_active }).eq('id', story.id);
  };

  const handleDelete = async (id) => {
    if (!confirm('Excluir este story?')) return;
    await supabase.from('store_stories').delete().eq('id', id);
    loadData();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl flex items-center gap-2">
            <Clapperboard size={26} /> Stories
          </h1>
          <p className="text-black/60 text-sm mt-1">
            Fotos e vídeos curtos pra conversar com o cliente — bastidores, novidades, estoque.
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={openNewForm}>
          Novo story
        </Button>
      </div>

      {showForm && (
        <motion.form
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="bg-white border-3 border-black rounded-2xl shadow-cartoon p-5 sm:p-6 flex flex-col gap-4 max-w-xl"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-lg">Novo story</h2>
            <button type="button" onClick={() => setShowForm(false)} aria-label="Fechar">
              <X size={20} />
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-display font-semibold text-sm">Foto ou vídeo</label>
            {preview ? (
              <div className="relative w-40 h-64 rounded-2xl border-3 border-black overflow-hidden">
                {mediaType === 'video' ? (
                  <video src={preview} className="w-full h-full object-cover" muted autoPlay loop />
                ) : (
                  <img src={preview} alt="" className="w-full h-full object-cover" />
                )}
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setPreview('');
                    setMediaType(null);
                  }}
                  className="absolute top-2 right-2 bg-white border-2 border-black rounded-full p-1"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label className="w-40 h-64 flex flex-col items-center justify-center gap-2 bg-primary-50 border-3 border-dashed border-black rounded-2xl cursor-pointer">
                <div className="flex gap-2 text-primary">
                  <ImageIcon size={22} />
                  <Video size={22} />
                </div>
                <span className="font-display font-semibold text-xs text-center px-2">
                  Escolher foto ou vídeo
                </span>
                <input type="file" accept="image/*,video/*" onChange={handleFileChange} className="hidden" />
              </label>
            )}
            <p className="text-xs text-black/40">
              Vídeos até {MAX_VIDEO_SIZE_MB}MB. Fotos são otimizadas automaticamente.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-display font-semibold text-sm ml-1">Legenda (opcional)</label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={3}
              placeholder="Conte alguma coisa pro cliente..."
              className="border-3 border-black rounded-2xl px-4 py-3 shadow-cartoon-sm font-body resize-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-display font-semibold text-sm ml-1">Marcar um produto (opcional)</label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="border-3 border-black rounded-2xl px-4 py-3 shadow-cartoon-sm font-body"
            >
              <option value="">Nenhum</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Expira em (opcional)"
            type="date"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
          />
          <p className="text-xs text-black/40 -mt-3">
            Deixe em branco pra ficar sem prazo — você controla a visibilidade manualmente.
          </p>

          {error && <p className="text-red-600 font-semibold text-sm">{error}</p>}

          <Button type="submit" variant="primary" isLoading={saving} isFullWidth>
            Publicar
          </Button>
        </motion.form>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stories.map((story) => (
          <div
            key={story.id}
            className={`bg-white border-3 border-black rounded-2xl shadow-cartoon-sm overflow-hidden flex flex-col ${
              !story.is_active ? 'opacity-50' : ''
            }`}
          >
            <div className="aspect-[9/16] bg-primary-50 relative">
              {story.media_type === 'video' ? (
                <video src={story.media_url} className="w-full h-full object-cover" muted />
              ) : (
                <img src={story.media_url} alt="" className="w-full h-full object-cover" />
              )}
              {story.products?.name && (
                <span className="absolute bottom-2 left-2 right-2 bg-black/60 text-white text-xs font-display font-semibold rounded-lg px-2 py-1 truncate">
                  🔗 {story.products.name}
                </span>
              )}
            </div>
            <div className="p-3 flex flex-col gap-2 flex-1">
              {story.caption && <p className="text-sm text-black/70 line-clamp-2">{story.caption}</p>}
              <p className="text-xs text-black/40 mt-auto">
                {new Date(story.created_at).toLocaleDateString('pt-BR')}
                {story.expires_at && ` · expira ${new Date(story.expires_at).toLocaleDateString('pt-BR')}`}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => toggleActive(story)}
                  className="flex-1 bg-white border-2 border-black rounded-xl p-2 shadow-cartoon-sm flex items-center justify-center gap-1.5 text-xs font-display font-semibold active:translate-y-0.5 active:shadow-none"
                >
                  {story.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
                  {story.is_active ? 'Visível' : 'Oculto'}
                </button>
                <button
                  onClick={() => handleDelete(story.id)}
                  className="bg-white border-2 border-black rounded-xl p-2 shadow-cartoon-sm text-red-600 active:translate-y-0.5 active:shadow-none"
                  aria-label="Excluir"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {stories.length === 0 && (
          <p className="text-black/50 font-display col-span-full">Nenhum story publicado ainda.</p>
        )}
      </div>
    </div>
  );
}
