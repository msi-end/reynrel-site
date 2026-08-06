import React, { useEffect, useState } from 'react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { adminApi } from '../../lib/apiClient';

const SettingsAdmin = () => {
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMessage, setPwMessage] = useState('');
  const [pwError, setPwError] = useState('');

  useEffect(() => {
    adminApi.get('/settings').then((res) => setSettings(res.data));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const res = await adminApi.put('/settings', settings);
      setSettings(res.data);
      setMessage('Settings saved.');
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwSaving(true);
    setPwMessage('');
    setPwError('');
    try {
      await adminApi.put('/admin/change-password', pwForm);
      setPwMessage('Password changed.');
      setPwForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      setPwError(err?.response?.data?.error || 'Failed to change password');
    } finally {
      setPwSaving(false);
    }
  };

  if (!settings) return <p className="text-[var(--color-muted-foreground)]">Loading...</p>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-foreground)] mb-6">Site Settings</h1>
        <form
          onSubmit={handleSave}
          className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-6 space-y-4"
        >
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Email"
              value={settings.email}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
            />
            <Input
              label="Phone"
              value={settings.phone}
              onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
            />
            <Input
              label="WhatsApp Number (with country code, no +)"
              value={settings.whatsappNumber}
              onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
            />
            <Input
              label="Business Hours"
              value={settings.businessHours}
              onChange={(e) => setSettings({ ...settings, businessHours: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-[var(--color-foreground)] mb-2 block">Address</label>
            <textarea
              rows={2}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
            />
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <Input
              label="LinkedIn URL"
              value={settings.socialLinks?.linkedin || ''}
              onChange={(e) =>
                setSettings({ ...settings, socialLinks: { ...settings.socialLinks, linkedin: e.target.value } })
              }
            />
            <Input
              label="Instagram URL"
              value={settings.socialLinks?.instagram || ''}
              onChange={(e) =>
                setSettings({ ...settings, socialLinks: { ...settings.socialLinks, instagram: e.target.value } })
              }
            />
            <Input
              label="WhatsApp URL"
              value={settings.socialLinks?.whatsapp || ''}
              onChange={(e) =>
                setSettings({ ...settings, socialLinks: { ...settings.socialLinks, whatsapp: e.target.value } })
              }
            />
          </div>

          {message && <p className="text-sm text-[var(--color-brand-success)]">{message}</p>}
          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" variant="default" loading={saving}>
            Save Settings
          </Button>
        </form>
      </div>

      <div>
        <h2 className="text-xl font-bold text-[var(--color-foreground)] mb-4">Change Admin Password</h2>
        <form
          onSubmit={handleChangePassword}
          className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-6 space-y-4 max-w-md"
        >
          <Input
            label="Current Password"
            type="password"
            value={pwForm.currentPassword}
            onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
            required
          />
          <Input
            label="New Password"
            type="password"
            value={pwForm.newPassword}
            onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
            required
          />
          {pwMessage && <p className="text-sm text-[var(--color-brand-success)]">{pwMessage}</p>}
          {pwError && <p className="text-sm text-destructive">{pwError}</p>}
          <Button type="submit" variant="outline" loading={pwSaving}>
            Change Password
          </Button>
        </form>
      </div>
    </div>
  );
};

export default SettingsAdmin;
