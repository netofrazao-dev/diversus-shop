import { useEffect, useState } from 'react';
import { Plus, Trash2, Edit2, X, Tags } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const slugify = (text) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('name');
    setCategories(data || []);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError('');

    const slug = slugify(name);

    try {
      if (editingId) {
        const { error: err } = await supabase
          .from('categories')
          .update({ name, slug })
          .eq('id', editingId);
        if (err) throw err;
      } else {
        const { error: err } = await supabase.from('categories').insert({ name, slug });
        if (err) throw err;
      }
      setName('');
      setEditingId(null);
      loadCategories();
    } catch (err) {
      setError('Erro ao salvar. Talvez já exista uma categoria com esse nome.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (cat) => {
    setEditingId(cat.id);
    setName(cat.name);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName('');
  };

  const handleDelete = async (id) => {
    if (
      !confirm(
        'Excluir esta categoria? Produtos que estavam nela ficarão sem categoria (não serão excluídos).'
      )
    )
      return;
    await supabase.from('categories').delete().eq('id', id);
    loadCategories();
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <h1 className="font-display font-bold text-2xl sm:text-3xl flex items-center gap-2">
        <Tags size={26} /> Categorias
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white border-3 border-black rounded-2xl shadow-cartoon p-5 flex flex-col sm:flex-row gap-3 sm:items-end"
      >
        <Input
          label={editingId ? 'Editando categoria' : 'Nova categoria'}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Relógios"
          containerClassName="flex-1"
        />
        <div className="flex gap-2">
          <Button type="submit" variant="primary" icon={Plus} isLoading={saving}>
            {editingId ? 'Salvar' : 'Adicionar'}
          </Button>
          {editingId && (
            <Button type="button" variant="outline" onClick={handleCancelEdit}>
              <X size={18} />
            </Button>
          )}
        </div>
      </form>

      {error && <p className="text-red-600 font-semibold text-sm">{error}</p>}

      <div className="grid gap-2">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white border-3 border-black rounded-2xl shadow-cartoon-sm p-4 flex items-center justify-between"
          >
            <div>
              <p className="font-display font-semibold">{cat.name}</p>
              <p className="text-xs text-black/40">/{cat.slug}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(cat)}
                className="bg-white border-2 border-black rounded-xl p-2 shadow-cartoon-sm active:translate-y-0.5 active:shadow-none"
                aria-label="Editar"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => handleDelete(cat.id)}
                className="bg-white border-2 border-black rounded-xl p-2 shadow-cartoon-sm text-red-600 active:translate-y-0.5 active:shadow-none"
                aria-label="Excluir"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        {categories.length === 0 && (
          <p className="text-black/50 font-display">Nenhuma categoria cadastrada ainda.</p>
        )}
      </div>
    </div>
  );
}
