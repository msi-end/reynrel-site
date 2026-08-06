import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { adminApi } from '../../lib/apiClient';

const emptyForm = { name: '', email: '', mobile: '', password: '' };

const ClientsAdmin = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    adminApi.get('/admin/clients').then((res) => setClients(res.data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await adminApi.post('/admin/clients', form);
      setForm(emptyForm);
      setShowForm(false);
      load();
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to create client');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this client and all their subscriptions? This cannot be undone.')) return;
    await adminApi.delete(`/admin/clients/${id}`);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-foreground)]">Clients</h1>
        <Button variant="default" iconName="Plus" iconPosition="left" onClick={() => setShowForm(!showForm)}>
          Add Client
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-6 mb-6 space-y-4 max-w-xl"
        >
          <h2 className="text-lg font-semibold text-[var(--color-foreground)]">New Client</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
            <Input
              label="Mobile"
              value={form.mobile}
              onChange={(e) => setForm({ ...form, mobile: e.target.value })}
              description="Include country code, e.g. 91XXXXXXXXXX (used for WhatsApp reminders)"
              required
            />
            <Input
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-3">
            <Button type="submit" variant="default" loading={saving}>
              Create Client
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-[var(--color-muted-foreground)]">Loading...</p>
      ) : clients.length === 0 ? (
        <p className="text-[var(--color-muted-foreground)]">No clients yet.</p>
      ) : (
        <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl overflow-hidden">
          {clients.map((client) => (
            <div
              key={client.id}
              className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)] last:border-b-0"
            >
              <div>
                <div className="font-medium text-[var(--color-foreground)]">{client.name}</div>
                <div className="text-xs text-[var(--color-muted-foreground)]">
                  {client.email} · {client.mobile}
                </div>
              </div>
              <div className="flex gap-2">
                <Link to={`/admin/clients/${client.id}`}>
                  <Button size="xs" variant="outline" iconName="Eye">
                    View
                  </Button>
                </Link>
                <Button size="xs" variant="outline" iconName="Trash2" onClick={() => handleDelete(client.id)}>
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientsAdmin;
