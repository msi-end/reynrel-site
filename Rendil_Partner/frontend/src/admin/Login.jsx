import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { AdminAuth } from '../auth';
import { adminApi } from '../lib/api';
import { Button, Field, Input, Alert } from '../components/ui';

export default function Login() {
  const { user, ready, signIn } = AdminAuth.useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  if (ready && user) return <Navigate to="/admin" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const r = await adminApi.post('/auth/admin/login', { email, password });
      await signIn(r.token);
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <form onSubmit={submit} className="w-full max-w-sm bg-white rounded-2xl p-7 space-y-5 shadow-2xl">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="" className="w-9 h-9" />
          <div><h1 className="text-lg font-bold text-slate-900">Rendil Partner</h1><p className="text-xs text-slate-500">Admin panel</p></div>
        </div>
        {error && <Alert>{error}</Alert>}
        <Field label="Email"><Input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required /></Field>
        <Field label="Password"><Input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required /></Field>
        <Button type="submit" loading={busy} className="w-full">Log in</Button>
      </form>
    </div>
  );
}
