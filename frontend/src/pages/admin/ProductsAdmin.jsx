import React, { useEffect, useState } from 'react';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { adminApi } from '../../lib/apiClient';
import PRODUCT_INTRO_PAGES from '../../data/productIntroPages';
import {
  linesToArray,
  arrayToLines,
  csvToArray,
  arrayToCsv,
  linesToMetrics,
  metricsToLines,
  linesToHighlights,
  highlightsToLines
} from './adminFormUtils';

const emptyForm = {
  name: '',
  category: '',
  icon: 'Package',
  image: '',
  imageAlt: '',
  description: '',
  features: '',
  badges: '',
  metrics: '',
  pricingAnnual: '',
  demoHighlights: '',
  introPage: ''
};

const toFormState = (product) => ({
  name: product.name || '',
  category: product.category || '',
  icon: product.icon || 'Package',
  image: product.image || '',
  imageAlt: product.imageAlt || '',
  description: product.description || '',
  features: arrayToLines(product.features),
  badges: arrayToCsv(product.badges),
  metrics: metricsToLines(product.metrics),
  pricingAnnual: product.pricingAnnual ?? '',
  demoHighlights: highlightsToLines(product.demoHighlights),
  introPage: product.introPage || ''
});

const toPayload = (form) => ({
  name: form.name,
  category: form.category,
  icon: form.icon,
  image: form.image,
  imageAlt: form.imageAlt,
  description: form.description,
  features: linesToArray(form.features),
  badges: csvToArray(form.badges),
  metrics: linesToMetrics(form.metrics),
  pricingAnnual: Number(form.pricingAnnual) || 0,
  demoHighlights: linesToHighlights(form.demoHighlights),
  introPage: form.introPage || ''
});

const ProductsAdmin = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    adminApi.get('/products').then((res) => setProducts(res.data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const startCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
    setError('');
  };

  const startEdit = (product) => {
    setEditingId(product.id);
    setForm(toFormState(product));
    setShowForm(true);
    setError('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product? This cannot be undone.')) return;
    await adminApi.delete(`/products/${id}`);
    load();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = toPayload(form);
      if (editingId) {
        await adminApi.put(`/products/${editingId}`, payload);
      } else {
        await adminApi.post('/products', payload);
      }
      setShowForm(false);
      load();
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-foreground)]">Products</h1>
        <Button variant="default" iconName="Plus" iconPosition="left" onClick={startCreate}>
          Add Product
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-6 mb-6 space-y-4"
        >
          <h2 className="text-lg font-semibold text-[var(--color-foreground)]">
            {editingId ? 'Edit Product' : 'New Product'}
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <Input
              label="Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              required
            />
            <Input
              label="Icon (lucide-react name)"
              value={form.icon}
              onChange={(e) => setForm({ ...form, icon: e.target.value })}
              description="e.g. Activity, Users, Receipt"
            />
            <Input
              label="Annual Price (₹)"
              type="number"
              value={form.pricingAnnual}
              onChange={(e) => setForm({ ...form, pricingAnnual: e.target.value })}
            />
            <Input
              label="Image URL"
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              className="md:col-span-2"
            />
            <Input
              label="Image Alt Text"
              value={form.imageAlt}
              onChange={(e) => setForm({ ...form, imageAlt: e.target.value })}
              className="md:col-span-2"
            />
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-medium text-[var(--color-foreground)] block">Product Intro Page</label>
              <select
                value={form.introPage}
                onChange={(e) => setForm({ ...form, introPage: e.target.value })}
                className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              >
                {PRODUCT_INTRO_PAGES.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <p className="text-sm text-[var(--color-muted-foreground)]">
                Which page opens when a visitor clicks "Product Intro" for this product. "Auto" uses a page built
                from the fields above.
              </p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-[var(--color-foreground)] mb-2 block">Description</label>
            <textarea
              rows={3}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-[var(--color-foreground)] mb-2 block">
                Features (one per line)
              </label>
              <textarea
                rows={5}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                value={form.features}
                onChange={(e) => setForm({ ...form, features: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[var(--color-foreground)] mb-2 block">
                Demo Highlights (title|description, one per line)
              </label>
              <textarea
                rows={5}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                value={form.demoHighlights}
                onChange={(e) => setForm({ ...form, demoHighlights: e.target.value })}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Badges (comma separated)"
              value={form.badges}
              onChange={(e) => setForm({ ...form, badges: e.target.value })}
            />
            <div>
              <label className="text-sm font-medium text-[var(--color-foreground)] mb-2 block">
                Metrics (label:value, one per line)
              </label>
              <textarea
                rows={3}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                value={form.metrics}
                onChange={(e) => setForm({ ...form, metrics: e.target.value })}
              />
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-3">
            <Button type="submit" variant="default" loading={saving}>
              {editingId ? 'Save Changes' : 'Create Product'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-[var(--color-muted-foreground)]">Loading...</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-5 flex items-start gap-4"
            >
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center flex-shrink-0">
                <Icon name={product.icon} size={22} color="white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-[var(--color-foreground)]">{product.name}</h3>
                <p className="text-xs text-[var(--color-muted-foreground)] mb-1">{product.category}</p>
                <p className="text-sm text-[var(--color-foreground)]/70 line-clamp-2">{product.description}</p>
                <p className="text-xs text-[var(--color-muted-foreground)] mt-1">
                  Intro page:{' '}
                  <span className="font-medium text-[var(--color-foreground)]">
                    {product.introPage || 'Auto'}
                  </span>
                </p>
                <div className="flex gap-2 mt-3">
                  <Button size="xs" variant="outline" iconName="Pencil" onClick={() => startEdit(product)}>
                    Edit
                  </Button>
                  <Button size="xs" variant="outline" iconName="Trash2" onClick={() => handleDelete(product.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductsAdmin;
