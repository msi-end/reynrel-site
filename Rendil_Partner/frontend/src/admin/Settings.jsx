import React, { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { adminApi } from '../lib/api';
import { dateTime, date, labelize } from '../lib/format';
import { AdminAuth } from '../auth';
import { Card, PageHeader, Tabs, Field, Input, Textarea, Select, Button, Checkbox, Toggle, Table, Td, Badge, Alert, Loading, Modal, useAction } from '../components/ui';
import { useSettings } from './useConfig';

export default function SettingsPage() {
  const { user } = AdminAuth.useAuth();
  const owner = user?.role === 'owner';
  const [tab, setTab] = useState('program');
  const tabs = [['program', 'Programme'], ['types', 'Partner types'], ['docs', 'Document types'], ['terms', 'Terms'], ...(owner ? [['admins', 'Admin users']] : []), ['account', 'My account'], ['audit', 'Audit log']];
  return (
    <>
      <PageHeader title="Settings" subtitle={owner ? 'Programme rules, registration requirements and access' : 'Only the owner can change programme settings'} />
      <Tabs value={tab} onChange={setTab} tabs={tabs} />
      <div key={tab} className="rp-fade">
        {tab === 'program' && <Program owner={owner} />}
        {tab === 'types' && <ListEditor owner={owner} field="partnerTypes" title="Partner types" hint="Shown in the registration form." />}
        {tab === 'docs' && <ListEditor owner={owner} field="documentTypes" title="Document types" hint="Required documents must be uploaded to apply. Keys cannot change after use." docs />}
        {tab === 'terms' && <Terms owner={owner} />}
        {tab === 'admins' && <Admins me={user} />}
        {tab === 'account' && <Account />}
        {tab === 'audit' && <Audit />}
      </div>
    </>
  );
}

function useSave() {
  const qc = useQueryClient();
  const [run, busy] = useAction();
  const save = (body) => run(() => adminApi.put('/admin/settings', body), { success: 'Settings saved' }).then((r) => { if (r) qc.setQueryData(['admin', 'settings'], r); return r; });
  return [save, busy];
}

function Program({ owner }) {
  const { data } = useSettings();
  const [save, busy] = useSave();
  const [f, setF] = useState(null);
  useEffect(() => { if (data && !f) setF(data.program); }, [data, f]);
  if (!f) return <Loading />;
  const s = (k) => ({ value: f[k] ?? '', onChange: (e) => setF({ ...f, [k]: e.target.value }), disabled: !owner });
  return (
    <div className="grid lg:grid-cols-2 gap-6 items-start">
      <Card title="Commission & payouts">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Programme default commission %" hint="Used when a product has no default"><Input type="number" {...s('defaultCommissionPct')} /></Field>
          <Field label="Programme default renewal %"><Input type="number" {...s('defaultRenewalPct')} /></Field>
          <Field label="Minimum withdrawal (₹)"><Input type="number" {...s('minWithdrawal')} /></Field>
          <Field label="TDS on payouts %" hint="Sec. 194H — confirm current rate with your CA"><Input type="number" step="0.01" {...s('tdsPercent')} /></Field>
        </div>
      </Card>
      <Card title="Company & registration">
        <div className="space-y-4">
          <Field label="Company name"><Input {...s('companyName')} /></Field>
          <div className="grid grid-cols-2 gap-4"><Field label="Support phone"><Input {...s('supportPhone')} /></Field><Field label="Support email"><Input {...s('supportEmail')} /></Field></div>
          <Field label="Main website"><Input {...s('mainSiteUrl')} /></Field>
          <Toggle checked={!!f.registrationOpen} disabled={!owner} onChange={(v) => setF({ ...f, registrationOpen: v })} label="Accept new partner applications" />
        </div>
      </Card>
      {owner && <div className="lg:col-span-2"><Button loading={busy} onClick={() => save({ program: f })}>Save programme settings</Button></div>}
    </div>
  );
}

function ListEditor({ owner, field, title, hint, docs }) {
  const { data } = useSettings();
  const [save, busy] = useSave();
  const [items, setItems] = useState(null);
  useEffect(() => { if (data && !items) setItems(data[field]); }, [data, items, field]);
  if (!items) return <Loading />;
  const upd = (i, patch) => setItems((s) => s.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  return (
    <Card title={title} subtitle={hint} action={owner && <Button size="sm" loading={busy} onClick={() => save({ [field]: items })}>Save</Button>}>
      <div className="space-y-2">
        {items.map((x, i) => (
          <div key={i} className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <Input className="sm:w-48 font-mono text-xs" placeholder="key" value={x.key} disabled={!owner} onChange={(e) => upd(i, { key: e.target.value })} />
            <Input className="flex-1" placeholder="Label" value={x.label} disabled={!owner} onChange={(e) => upd(i, { label: e.target.value })} />
            {docs && <><Checkbox checked={!!x.required} disabled={!owner} onChange={(e) => upd(i, { required: e.target.checked })} label="Required" /><Checkbox checked={!!x.requiredIfGstin} disabled={!owner} onChange={(e) => upd(i, { requiredIfGstin: e.target.checked })} label="If GSTIN" /></>}
            {owner && <Button size="xs" variant="danger-ghost" icon={Trash2} onClick={() => setItems((s) => s.filter((_, j) => j !== i))} aria-label="Remove" />}
          </div>
        ))}
        {owner && <Button size="sm" variant="outline" icon={Plus} onClick={() => setItems((s) => [...s, { key: '', label: '' }])}>Add</Button>}
      </div>
    </Card>
  );
}

function Terms({ owner }) {
  const { data, refetch } = useQuery({ queryKey: ['admin', 'terms'], queryFn: () => adminApi.get('/admin/terms') });
  const [draft, setDraft] = useState(null);
  const [run, busy] = useAction();
  useEffect(() => { if (data && draft === null) setDraft(data[0]?.content || ''); }, [data, draft]);
  if (!data || draft === null) return <Loading />;
  const publish = () => window.confirm('Publish a new version? Every partner will be asked to accept it.') && run(() => adminApi.post('/admin/terms', { content: draft }), { success: (r) => `Version ${r.version} published` }).then((r) => r && refetch());
  return (
    <Card title={`Partner terms — current version ${data[0]?.version}`} subtitle={`History: ${data.map((t) => `v${t.version} (${date(t.created_at)})`).join(' · ')}`}>
      <Textarea rows={22} className="font-mono text-xs" value={draft} disabled={!owner} onChange={(e) => setDraft(e.target.value)} />
      {owner && (
        <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
          <p className="text-xs text-slate-500">Each version is stored. Applicants accept the latest; existing partners are prompted in their portal.</p>
          <Button loading={busy} disabled={draft.trim() === (data[0]?.content || '').trim()} onClick={publish}>Publish version {(data[0]?.version || 0) + 1}</Button>
        </div>
      )}
    </Card>
  );
}

function Admins({ me }) {
  const { data, refetch } = useQuery({ queryKey: ['admin', 'admins'], queryFn: () => adminApi.get('/admin/admins') });
  const [run, busy] = useAction();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ name: '', email: '', role: 'manager' });
  const [pw, setPw] = useState(null);
  if (!data) return <Loading />;
  return (
    <Card title="Admin users" padded={false} action={<Button size="sm" icon={Plus} onClick={() => { setPw(null); setOpen(true); }}>Add admin</Button>}>
      <Table head={['Name', 'Role', 'Status', 'Last login', '']}>
        {data.map((a) => (
          <tr key={a.id}>
            <Td><div className="font-medium">{a.name}</div><div className="text-xs text-slate-500">{a.email}</div></Td>
            <Td><Badge status={a.role} /></Td><Td><Badge status={a.active ? 'active' : 'suspended'}>{a.active ? 'Active' : 'Disabled'}</Badge></Td>
            <Td className="text-xs">{dateTime(a.last_login_at)}</Td>
            <Td>{a.id !== me.id && (
              <div className="flex gap-1">
                <Select className="h-8 w-28" value={a.role} onChange={(e) => run(() => adminApi.put(`/admin/admins/${a.id}`, { role: e.target.value }), { success: 'Role updated' }).then(refetch)}><option value="owner">Owner</option><option value="manager">Manager</option><option value="viewer">Viewer</option></Select>
                <Button size="xs" variant="outline" onClick={() => run(() => adminApi.put(`/admin/admins/${a.id}`, { active: !a.active }), { success: 'Updated' }).then(refetch)}>{a.active ? 'Disable' : 'Enable'}</Button>
              </div>
            )}</Td>
          </tr>
        ))}
      </Table>
      <div className="p-4 text-xs text-slate-500">Owner: everything. Manager: manage partners, products, orders and payouts. Viewer: read-only.</div>
      <Modal open={open} title="Add admin" onClose={() => setOpen(false)} footer={!pw && <Button loading={busy} onClick={() => run(() => adminApi.post('/admin/admins', f), { success: 'Admin added' }).then((r) => { if (r) { setPw(r.temporaryPassword); refetch(); } })}>Create</Button>}>
        {pw ? <Alert tone="blue">Temporary password for {f.email}: <b className="font-mono">{pw}</b> — shown once. Ask them to change it after logging in.</Alert> : (
          <div className="space-y-3">
            <Field label="Name"><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
            <Field label="Email"><Input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field>
            <Field label="Role"><Select value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })}><option value="manager">Manager</option><option value="viewer">Viewer</option><option value="owner">Owner</option></Select></Field>
          </div>
        )}
      </Modal>
    </Card>
  );
}

function Account() {
  const [run, busy] = useAction();
  const { logout } = AdminAuth.useAuth();
  const [f, setF] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const submit = (e) => {
    e.preventDefault();
    if (f.newPassword !== f.confirm) return run(async () => { throw new Error('New passwords do not match'); });
    return run(() => adminApi.put('/auth/admin/password', f), { success: 'Password changed — please log in again' }).then((r) => r && logout());
  };
  return (
    <Card title="Change password" className="max-w-lg">
      <form onSubmit={submit} className="space-y-3">
        <Field label="Current password"><Input type="password" autoComplete="current-password" value={f.currentPassword} onChange={(e) => setF({ ...f, currentPassword: e.target.value })} /></Field>
        <Field label="New password" hint="At least 8 characters with letters and numbers"><Input type="password" autoComplete="new-password" value={f.newPassword} onChange={(e) => setF({ ...f, newPassword: e.target.value })} /></Field>
        <Field label="Confirm new password"><Input type="password" autoComplete="new-password" value={f.confirm} onChange={(e) => setF({ ...f, confirm: e.target.value })} /></Field>
        <Button type="submit" loading={busy}>Change password</Button>
      </form>
    </Card>
  );
}

function Audit() {
  const { data } = useQuery({ queryKey: ['admin', 'audit'], queryFn: () => adminApi.get('/admin/audit') });
  if (!data) return <Loading />;
  return (
    <Card title="Audit log" subtitle="Sensitive-data views, money movements and configuration changes (latest 300)" padded={false}>
      <Table head={['When', 'Who', 'Action', 'Details']} dense>
        {data.map((a) => (
          <tr key={a.id}>
            <Td className="whitespace-nowrap text-xs text-slate-500">{dateTime(a.created_at)}</Td><Td className="text-xs">{a.actor}</Td>
            <Td>{labelize(a.action.replace(/\./g, ' · '))}</Td>
            <Td className="text-xs text-slate-500 font-mono max-w-md truncate">{a.meta ? JSON.stringify(a.meta) : ''}</Td>
          </tr>
        ))}
      </Table>
    </Card>
  );
}
