import React, { useEffect, useRef, useState } from 'react';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { adminApi, BASE_URL } from '../../lib/apiClient';
import { linesToArray, arrayToLines } from './adminFormUtils';

const UPLOADS_ORIGIN = BASE_URL.replace(/\/api\/?$/, '');

const emptyForm = {
  name: '',
  category: '',
  icon: 'Smartphone',
  badge: '',
  description: '',
  features: '',
  rating: '',
  downloads: '',
  size: '',
  version: '',
  playStoreUrl: '',
  apkUrl: ''
};

const toFormState = (app) => ({
  name: app.name || '',
  category: app.category || '',
  icon: app.icon || 'Smartphone',
  badge: app.badge || '',
  description: app.description || '',
  features: arrayToLines(app.features),
  rating: app.rating || '',
  downloads: app.downloads || '',
  size: app.size || '',
  version: app.version || '',
  playStoreUrl: app.playStoreUrl || '',
  apkUrl: app.apkUrl || ''
});

const toPayload = (form) => ({
  name: form.name,
  category: form.category,
  icon: form.icon,
  badge: form.badge,
  description: form.description,
  features: linesToArray(form.features),
  rating: form.rating,
  downloads: form.downloads,
  size: form.size,
  version: form.version,
  playStoreUrl: form.playStoreUrl || null,
  apkUrl: form.apkUrl || null
});

const ScreenshotManager = ({ app, onChanged }) => {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('screenshot', file);
      await adminApi.post(`/android-apps/${app.id}/screenshots`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      onChanged();
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (index) => {
    await adminApi.delete(`/android-apps/${app.id}/screenshots/${index}`);
    onChanged();
  };

  return (
    <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
      <label className="text-sm font-medium text-[var(--color-foreground)] mb-2 block">Screenshots</label>
      <div className="flex gap-2 flex-wrap mb-3">
        {(app.screenshots || []).map((src, index) => (
          <div key={index} className="relative">
            <img
              src={`${UPLOADS_ORIGIN}${src}`}
              alt={`Screenshot ${index + 1}`}
              className="w-16 h-28 object-cover rounded-lg border border-[var(--color-border)]"
            />
            <button
              type="button"
              onClick={() => handleDelete(index)}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-destructive text-white flex items-center justify-center"
              aria-label="Remove screenshot"
            >
              <Icon name="X" size={12} />
            </button>
          </div>
        ))}
      </div>
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUpload} disabled={uploading} />
      {uploading && <p className="text-xs text-[var(--color-muted-foreground)] mt-1">Uploading...</p>}
    </div>
  );
};

const AndroidAppsAdmin = () => {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    return adminApi.get('/android-apps').then((res) => setApps(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const startCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
    setError('');
  };

  const startEdit = (app) => {
    setEditingId(app.id);
    setForm(toFormState(app));
    setShowForm(true);
    setError('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this app? This cannot be undone.')) return;
    await adminApi.delete(`/android-apps/${id}`);
    load();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = toPayload(form);
      if (editingId) {
        await adminApi.put(`/android-apps/${editingId}`, payload);
      } else {
        const res = await adminApi.post('/android-apps', payload);
        setEditingId(res.data.id);
      }
      await load();
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to save app');
    } finally {
      setSaving(false);
    }
  };

  const editingApp = apps.find((a) => a.id === editingId);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-foreground)]">Android Apps</h1>
        <Button variant="default" iconName="Plus" iconPosition="left" onClick={startCreate}>
          Add App
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-6 mb-6 space-y-4"
        >
          <h2 className="text-lg font-semibold text-[var(--color-foreground)]">
            {editingId ? 'Edit App' : 'New App'}
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
            />
            <Input label="Badge" value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} />
            <Input label="Rating" value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} />
            <Input
              label="Downloads"
              value={form.downloads}
              onChange={(e) => setForm({ ...form, downloads: e.target.value })}
            />
            <Input label="Size" value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} />
            <Input label="Version" value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} />
            <Input
              label="Play Store URL"
              value={form.playStoreUrl}
              onChange={(e) => setForm({ ...form, playStoreUrl: e.target.value })}
            />
            <Input label="APK URL" value={form.apkUrl} onChange={(e) => setForm({ ...form, apkUrl: e.target.value })} />
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
              Features (one per line)
            </label>
            <textarea
              rows={4}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              value={form.features}
              onChange={(e) => setForm({ ...form, features: e.target.value })}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-3">
            <Button type="submit" variant="default" loading={saving}>
              {editingId ? 'Save Changes' : 'Create App'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
              Close
            </Button>
          </div>

          {editingApp && <ScreenshotManager app={editingApp} onChanged={load} />}
          {!editingApp && editingId && (
            <p className="text-xs text-[var(--color-muted-foreground)]">
              Screenshot upload will appear here once the app is saved.
            </p>
          )}
        </form>
      )}

      {loading ? (
        <p className="text-[var(--color-muted-foreground)]">Loading...</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {apps.map((app) => (
            <div
              key={app.id}
              className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-5 flex items-start gap-4"
            >
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center flex-shrink-0">
                <Icon name={app.icon} size={22} color="white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-[var(--color-foreground)]">{app.name}</h3>
                <p className="text-xs text-[var(--color-muted-foreground)] mb-1">
                  {app.category} · {(app.screenshots || []).length} screenshot(s)
                </p>
                <p className="text-sm text-[var(--color-foreground)]/70 line-clamp-2">{app.description}</p>
                <div className="flex gap-2 mt-3">
                  <Button size="xs" variant="outline" iconName="Pencil" onClick={() => startEdit(app)}>
                    Edit
                  </Button>
                  <Button size="xs" variant="outline" iconName="Trash2" onClick={() => handleDelete(app.id)}>
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

export default AndroidAppsAdmin;
