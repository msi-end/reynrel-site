import React, { useState } from 'react';
import { Clock, XCircle, Ban, LogOut, KeyRound } from 'lucide-react';
import { PartnerAuth } from '../auth';
import { partnerApi } from '../lib/api';
import { date } from '../lib/format';
import { Card, Badge, Button, Field, Input, Alert, Dl, useAction } from '../components/ui';
import { DocumentList } from './Documents';

const STATES = {
  pending: { icon: Clock, tone: 'bg-amber-50 text-amber-600', title: 'Application under review', text: 'We are verifying your details and documents. You will get full access once approved. Make sure every required document is uploaded.' },
  rejected: { icon: XCircle, tone: 'bg-red-50 text-red-600', title: 'Application not approved', text: 'We could not approve your application.' },
  suspended: { icon: Ban, tone: 'bg-red-50 text-red-600', title: 'Account suspended', text: 'Your partner account is suspended. Contact Reynrel for details.' }
};

export default function StatusScreen({ me, onLogout }) {
  const s = STATES[me.status] || STATES.pending;
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2"><img src="/logo.png" alt="" className="w-7 h-7" /><span className="font-semibold">Rendil Partner</span></div>
          <Button size="sm" variant="ghost" icon={LogOut} onClick={onLogout}>Log out</Button>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <Card>
          <div className="flex gap-4">
            <span className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${s.tone}`}><s.icon size={24} /></span>
            <div>
              <h1 className="text-xl font-bold">{s.title}</h1>
              <p className="text-sm text-slate-600 mt-1">{s.text}</p>
              {me.statusReason && me.status !== 'pending' && <p className="text-sm mt-2 bg-slate-50 rounded-lg p-3">Reason: {me.statusReason}</p>}
            </div>
          </div>
          <div className="mt-5 pt-5 border-t border-slate-100">
            <Dl items={[['Partner ID', <span className="font-mono">{me.code}</span>], ['Applied on', date(me.createdAt)], ['Status', <Badge status={me.status} />], ['Documents', `${me.documents.uploaded}/${me.documents.required} required uploaded · ${me.documents.verified} verified`]]} />
          </div>
        </Card>
        {me.status !== 'suspended' && <Card title="Your documents"><DocumentList /></Card>}
      </main>
    </div>
  );
}

export function ForcePassword({ onLogout }) {
  const { signIn } = PartnerAuth.useAuth();
  const [run, busy] = useAction();
  const [f, setF] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [err, setErr] = useState('');
  const submit = (e) => {
    e.preventDefault();
    if (f.newPassword !== f.confirm) return setErr('New passwords do not match');
    setErr('');
    return run(() => partnerApi.put('/auth/partner/password', f), { success: 'Password set' }).then((r) => r && signIn(r.token));
  };
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <form onSubmit={submit} className="w-full max-w-sm bg-white border border-slate-200 rounded-2xl p-7 space-y-4">
        <div className="w-11 h-11 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center"><KeyRound size={20} /></div>
        <div><h1 className="text-xl font-bold">Set your password</h1><p className="text-sm text-slate-500 mt-1">Your account was created with a temporary password. Choose your own to continue.</p></div>
        {err && <Alert>{err}</Alert>}
        <Field label="Temporary password"><Input type="password" autoComplete="current-password" value={f.currentPassword} onChange={(e) => setF({ ...f, currentPassword: e.target.value })} /></Field>
        <Field label="New password" hint="At least 8 characters with letters and numbers"><Input type="password" autoComplete="new-password" value={f.newPassword} onChange={(e) => setF({ ...f, newPassword: e.target.value })} /></Field>
        <Field label="Confirm new password"><Input type="password" autoComplete="new-password" value={f.confirm} onChange={(e) => setF({ ...f, confirm: e.target.value })} /></Field>
        <Button type="submit" loading={busy} className="w-full">Save and continue</Button>
        <button type="button" onClick={onLogout} className="w-full text-sm text-slate-500">Log out</button>
      </form>
    </div>
  );
}
