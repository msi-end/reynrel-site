import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { PartnerAuth } from '../auth';
import { partnerApi } from '../lib/api';
import { Button, Field, Input, Alert } from '../components/ui';

export default function Login() {
  const { user, ready, signIn } = PartnerAuth.useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  if (ready && user) return <Navigate to="/" replace />;
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const r = await partnerApi.post('/auth/partner/login', { identifier, password });
      await signIn(r.token);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between bg-slate-950 text-white p-12">
        <div className="flex items-center gap-2.5"><img src="/logo.png" alt="" className="w-8 h-8" /><span className="font-semibold text-lg">Rendil Partner</span></div>
        <div>
          <h1 className="text-4xl font-bold leading-tight">Your customers, installations and commission — in one place.</h1>
          <ul className="mt-8 space-y-3 text-slate-300">
            {['Register customers and request installations', 'See your prices and commission for every product', 'Track every rupee you earn', 'Withdraw straight to your bank'].map((t) => (
              <li key={t} className="flex gap-3"><CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />{t}</li>
            ))}
          </ul>
        </div>
        <p className="text-sm text-slate-500">Reynrel Infotech · Partner Platform</p>
      </div>
      <div className="flex items-center justify-center p-6">
        <form onSubmit={submit} className="w-full max-w-sm space-y-5">
          <div className="lg:hidden flex items-center gap-2"><img src="/logo.png" alt="" className="w-8 h-8" /><span className="font-semibold">Rendil Partner</span></div>
          <div><h2 className="text-2xl font-bold">Partner login</h2><p className="text-sm text-slate-500 mt-1">Use your email, mobile number or partner ID.</p></div>
          {error && <Alert>{error}</Alert>}
          <Field label="Email, mobile or partner ID"><Input autoComplete="username" value={identifier} onChange={(e) => setIdentifier(e.target.value)} required /></Field>
          <Field label="Password"><Input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required /></Field>
          <Button type="submit" loading={busy} className="w-full">Log in</Button>
          <p className="text-sm text-slate-500 text-center">New partner? <Link to="/register" className="text-brand-600 font-medium">Apply to join</Link></p>
          <p className="text-xs text-slate-400 text-center">Forgot your password? Ask your Reynrel contact to reset it.</p>
        </form>
      </div>
    </div>
  );
}
