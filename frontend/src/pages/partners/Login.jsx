import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Seo from '../../components/Seo';
import Icon from '../../components/AppIcon';
import { usePartnerAuth } from '../../context/PartnerAuthContext';
import { Field, inputCls, Btn, Alert, errMsg } from '../../components/partner/ui';

const PartnerLogin = () => {
  const { login } = usePartnerAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(identifier.trim(), password);
      navigate('/partner');
    } catch (err) {
      setError(errMsg(err, 'Login failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">
      <Seo title="Partner login" description="Log in to your Reynrel Partner Dashboard." path="/partners/login" />
      <div className="hidden lg:flex flex-col justify-between bg-slate-950 text-white p-12">
        <Link to="/" className="flex items-center gap-2">
          <img src="/assets/images/reynrel-logo-icon.png" alt="" className="w-8 h-8" />
          <span className="font-semibold">Reynrel Partner Portal</span>
        </Link>
        <div>
          <h1 className="text-4xl font-bold leading-tight">Manage customers, installations and commission — in one place.</h1>
          <ul className="mt-8 space-y-3 text-slate-300">
            {['Register customers and request installations', 'Track approvals and subscription status', 'See every commission entry', 'Withdraw to your bank from ₹5,000'].map((t) => (
              <li key={t} className="flex gap-3"><Icon name="CheckCircle2" size={18} className="text-emerald-400" />{t}</li>
            ))}
          </ul>
        </div>
        <p className="text-sm text-slate-500">© {new Date().getFullYear()} Reynrel Infotech</p>
      </div>
      <div className="flex items-center justify-center p-6">
        <form onSubmit={submit} className="w-full max-w-sm space-y-5">
          <div>
            <Link to="/partners" className="text-sm text-slate-500 hover:text-slate-800 inline-flex items-center gap-1"><Icon name="ArrowLeft" size={14} /> Partner Program</Link>
            <h2 className="mt-4 text-2xl font-bold text-slate-900">Partner login</h2>
            <p className="text-sm text-slate-500 mt-1">Use your email, mobile number or partner ID.</p>
          </div>
          {error && <Alert>{error}</Alert>}
          <Field label="Email, mobile or partner ID">
            <input className={inputCls()} value={identifier} onChange={(e) => setIdentifier(e.target.value)} autoComplete="username" required />
          </Field>
          <Field label="Password">
            <input type="password" className={inputCls()} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
          </Field>
          <Btn type="submit" loading={loading} className="w-full">Log in</Btn>
          <p className="text-sm text-slate-500 text-center">
            Not a partner yet? <Link to="/partners/register" className="text-blue-600 font-medium">Apply now</Link>
          </p>
          <p className="text-xs text-slate-400 text-center">Forgot your password? Contact partner support on WhatsApp +91 98647 73099.</p>
        </form>
      </div>
    </div>
  );
};

export default PartnerLogin;
