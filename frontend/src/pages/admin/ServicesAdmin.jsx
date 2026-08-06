import React, { useEffect, useState } from 'react';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { adminApi } from '../../lib/apiClient';
import { linesToArray, arrayToLines, csvToArray, arrayToCsv } from './adminFormUtils';

const emptyForm = {
  title: '',
  category: '',
  icon: 'Briefcase',
  description: '',
  keyFeatures: '',
  technologies: '',
  timeline: '',
  startingPrice: ''
};

const toFormState = (service) => ({
  title: service.title || '',
  category: service.category || '',
  icon: service.icon || 'Briefcase',
  description: service.description || '',
  keyFeatures: arrayToLines(service.keyFeatures),
  technologies: arrayToCsv(service.technologies),
  timeline: service.timeline || '',
  startingPrice: service.startingPrice || ''
});

const toPayload = (form) => ({
  title: form.title,
  category: form.category,
  icon: form.icon,
  description: form.description,
  keyFeatures: linesToArray(form.keyFeatures),
  technologies: csvToArray(form.technologies),
  timeline: form.timeline,
  startingPrice: form.startingPrice
});

const ServicesAdmin = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    adminApi.get('/services').then((res) => setServices(res.data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const startCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
    setError('');
  };

  const startEdit = (service) => {
    setEditingId(service.id);
    setForm(toFormState(service));
    setShowForm(true);
    setError('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this service? This cannot be undone.')) return;
    await adminApi.delete(`/services/${id}`);
    load();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = toPayload(form);
      if (editingId) {
        await adminApi.put(`/services/${editingId}`, payload);
      } else {
        await adminApi.post('/services', payload);
      }
      setShowForm(false);
      load();
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to save service');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-foreground)]">Services</h1>
        <Button variant="default" iconName="Plus" iconPosition="left" onClick={startCreate}>
          Add Service
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-6 mb-6 space-y-4"
        >
          <h2 className="text-lg font-semibold text-[var(--color-foreground)]">
            {editingId ? 'Edit Service' : 'New Service'}
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
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
            />
            <Input
              label="Timeline"
              value={form.timeline}
              onChange={(e) => setForm({ ...form, timeline: e.target.value })}
              placeholder="e.g. 6-12 weeks"
            />
            <Input
              label="Starting Price"
              value={form.startingPrice}
              onChange={(e) => setForm({ ...form, startingPrice: e.target.value })}
              placeholder="e.g. $15,000"
            />
            <Input
              label="Technologies (comma separated)"
              value={form.technologies}
              onChange={(e) => setForm({ ...form, technologies: e.target.value })}
            />
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

          <div>
            <label className="text-sm font-medium text-[var(--color-foreground)] mb-2 block">
              Key Features (one per line)
            </label>
            <textarea
              rows={5}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              value={form.keyFeatures}
              onChange={(e) => setForm({ ...form, keyFeatures: e.target.value })}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-3">
            <Button type="submit" variant="default" loading={saving}>
              {editingId ? 'Save Changes' : 'Create Service'}
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
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-5 flex items-start gap-4"
            >
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center flex-shrink-0">
                <Icon name={service.icon} size={22} color="white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-[var(--color-foreground)]">{service.title}</h3>
                <p className="text-xs text-[var(--color-muted-foreground)] mb-1">{service.category}</p>
                <p className="text-sm text-[var(--color-foreground)]/70 line-clamp-2">{service.description}</p>
                <div className="flex gap-2 mt-3">
                  <Button size="xs" variant="outline" iconName="Pencil" onClick={() => startEdit(service)}>
                    Edit
                  </Button>
                  <Button size="xs" variant="outline" iconName="Trash2" onClick={() => handleDelete(service.id)}>
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

export default ServicesAdmin;
