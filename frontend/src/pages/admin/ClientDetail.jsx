import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { differenceInCalendarDays } from 'date-fns';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { adminApi } from '../../lib/apiClient';
import { buildWhatsAppReminderUrl, subscriptionReminderMessage, generalReminderMessage } from './whatsapp';

const emptySubForm = {
  itemType: 'product',
  itemId: '',
  itemName: '',
  planAmount: '',
  planStartDate: '',
  planEndDate: ''
};

const ClientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [client, setClient] = useState(null);
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showSubForm, setShowSubForm] = useState(false);
  const [subForm, setSubForm] = useState(emptySubForm);
  const [subError, setSubError] = useState('');
  const [subSaving, setSubSaving] = useState(false);

  const [fieldForm, setFieldForm] = useState({ label: '', value: '' });
  const [fieldSaving, setFieldSaving] = useState(false);

  const load = () => {
    setLoading(true);
    return adminApi.get(`/admin/clients/${id}`).then((res) => setClient(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    adminApi.get('/products').then((res) => setProducts(res.data));
    adminApi.get('/services').then((res) => setServices(res.data));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const itemOptions = subForm.itemType === 'product' ? products : services;

  const handleItemSelect = (itemId) => {
    const item = itemOptions.find((i) => i.id === itemId);
    setSubForm({
      ...subForm,
      itemId,
      itemName: item ? item.name || item.title : ''
    });
  };

  const handleAddSubscription = async (e) => {
    e.preventDefault();
    setSubSaving(true);
    setSubError('');
    try {
      await adminApi.post(`/admin/clients/${id}/subscriptions`, {
        ...subForm,
        planAmount: Number(subForm.planAmount) || 0
      });
      setSubForm(emptySubForm);
      setShowSubForm(false);
      load();
    } catch (err) {
      setSubError(err?.response?.data?.error || 'Failed to assign subscription');
    } finally {
      setSubSaving(false);
    }
  };

  const handleDeleteSubscription = async (subId) => {
    if (!window.confirm('Remove this subscription from the client?')) return;
    await adminApi.delete(`/admin/clients/${id}/subscriptions/${subId}`);
    load();
  };

  const handleAddField = async (e) => {
    e.preventDefault();
    if (!fieldForm.label) return;
    setFieldSaving(true);
    try {
      await adminApi.post(`/admin/clients/${id}/custom-fields`, fieldForm);
      setFieldForm({ label: '', value: '' });
      load();
    } finally {
      setFieldSaving(false);
    }
  };

  const handleDeleteField = async (fieldId) => {
    await adminApi.delete(`/admin/clients/${id}/custom-fields/${fieldId}`);
    load();
  };

  const handleDeleteClient = async () => {
    if (!window.confirm('Delete this client and all their subscriptions? This cannot be undone.')) return;
    await adminApi.delete(`/admin/clients/${id}`);
    navigate('/admin/clients');
  };

  if (loading || !client) return <p className="text-[var(--color-muted-foreground)]">Loading...</p>;

  return (
    <div>
      <Link to="/admin/clients" className="text-sm text-[var(--color-accent)] flex items-center gap-1 mb-4">
        <Icon name="ArrowLeft" size={16} /> Back to Clients
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-foreground)]">{client.name}</h1>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            {client.email} · {client.mobile}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            iconName="MessageCircle"
            onClick={() =>
              window.open(buildWhatsAppReminderUrl(client.mobile, generalReminderMessage(client)), '_blank')
            }
          >
            Remind on WhatsApp
          </Button>
          <Button variant="outline" iconName="Trash2" onClick={handleDeleteClient}>
            Delete Client
          </Button>
        </div>
      </div>

      {/* Subscriptions */}
      <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[var(--color-foreground)]">Products & Services</h2>
          <Button size="sm" variant="default" iconName="Plus" onClick={() => setShowSubForm(!showSubForm)}>
            Assign
          </Button>
        </div>

        {showSubForm && (
          <form
            onSubmit={handleAddSubscription}
            className="bg-[var(--color-muted)] rounded-lg p-4 mb-4 space-y-3"
          >
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-[var(--color-foreground)] mb-2 block">Type</label>
                <select
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  value={subForm.itemType}
                  onChange={(e) => setSubForm({ ...subForm, itemType: e.target.value, itemId: '', itemName: '' })}
                >
                  <option value="product">Product</option>
                  <option value="service">Service</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--color-foreground)] mb-2 block">Item</label>
                <select
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  value={subForm.itemId}
                  onChange={(e) => handleItemSelect(e.target.value)}
                  required
                >
                  <option value="">Select...</option>
                  {itemOptions.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name || item.title}
                    </option>
                  ))}
                </select>
              </div>
              <Input
                label="Plan Amount (₹)"
                type="number"
                value={subForm.planAmount}
                onChange={(e) => setSubForm({ ...subForm, planAmount: e.target.value })}
              />
              <Input
                label="Plan Start Date"
                type="date"
                value={subForm.planStartDate}
                onChange={(e) => setSubForm({ ...subForm, planStartDate: e.target.value })}
                required
              />
              <Input
                label="Plan End Date"
                type="date"
                value={subForm.planEndDate}
                onChange={(e) => setSubForm({ ...subForm, planEndDate: e.target.value })}
                required
              />
            </div>
            {subError && <p className="text-sm text-destructive">{subError}</p>}
            <div className="flex gap-3">
              <Button type="submit" size="sm" variant="default" loading={subSaving}>
                Assign
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => setShowSubForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        )}

        {(client.subscriptions || []).length === 0 ? (
          <p className="text-sm text-[var(--color-muted-foreground)]">No products or services assigned yet.</p>
        ) : (
          <div className="space-y-3">
            {client.subscriptions.map((sub) => {
              const daysLeft = differenceInCalendarDays(new Date(sub.planEndDate), new Date());
              const expired = daysLeft < 0;
              return (
                <div
                  key={sub.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-[var(--color-border)]"
                >
                  <div>
                    <div className="font-medium text-[var(--color-foreground)]">
                      {sub.itemName}{' '}
                      <span className="text-xs text-[var(--color-muted-foreground)]">({sub.itemType})</span>
                    </div>
                    <div className="text-xs text-[var(--color-muted-foreground)]">
                      ₹{Number(sub.planAmount).toLocaleString()} / year · {sub.planStartDate} to {sub.planEndDate} ·{' '}
                      {expired ? (
                        <span className="text-destructive font-medium">Expired</span>
                      ) : (
                        <span>{daysLeft} days remaining</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="xs"
                      variant="outline"
                      iconName="MessageCircle"
                      onClick={() =>
                        window.open(
                          buildWhatsAppReminderUrl(client.mobile, subscriptionReminderMessage(client, sub)),
                          '_blank'
                        )
                      }
                    >
                      Remind
                    </Button>
                    <Button
                      size="xs"
                      variant="outline"
                      iconName="Trash2"
                      onClick={() => handleDeleteSubscription(sub.id)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Custom fields */}
      <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-6">
        <h2 className="text-lg font-semibold text-[var(--color-foreground)] mb-4">Custom Fields</h2>

        <form onSubmit={handleAddField} className="flex gap-3 mb-4">
          <Input
            placeholder="Label"
            value={fieldForm.label}
            onChange={(e) => setFieldForm({ ...fieldForm, label: e.target.value })}
          />
          <Input
            placeholder="Value"
            value={fieldForm.value}
            onChange={(e) => setFieldForm({ ...fieldForm, value: e.target.value })}
          />
          <Button type="submit" variant="outline" loading={fieldSaving}>
            Add
          </Button>
        </form>

        {(client.customFields || []).length === 0 ? (
          <p className="text-sm text-[var(--color-muted-foreground)]">No custom fields yet.</p>
        ) : (
          <div className="space-y-2">
            {client.customFields.map((field) => (
              <div key={field.id} className="flex items-center justify-between px-3 py-2 bg-[var(--color-muted)] rounded-lg">
                <span className="text-sm text-[var(--color-foreground)]">
                  <strong>{field.label}:</strong> {field.value}
                </span>
                <button onClick={() => handleDeleteField(field.id)} aria-label="Remove field">
                  <Icon name="X" size={16} className="text-[var(--color-muted-foreground)]" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientDetail;
