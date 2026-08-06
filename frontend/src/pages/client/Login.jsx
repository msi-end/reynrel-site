import React, { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useClientAuth } from '../../context/ClientAuthContext';

const ClientLogin = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, loading } = useClientAuth();
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!loading && isAuthenticated) {
    return <Navigate to="/client/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(form.identifier, form.password);
      navigate('/client/dashboard');
    } catch (err) {
      setError(err?.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] px-4">
      <div className="w-full max-w-md bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl shadow-lg p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center mb-4">
            <Icon name="User" size={28} color="white" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-foreground)]">Client Login</h1>
          <p className="text-sm text-[var(--color-muted-foreground)] mt-1">View your services & subscriptions</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email or Mobile"
            type="text"
            value={form.identifier}
            onChange={(e) => setForm({ ...form, identifier: e.target.value })}
            required
          />
          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" variant="default" fullWidth loading={submitting}>
            Log In
          </Button>
        </form>

        <p className="text-sm text-center text-[var(--color-muted-foreground)] mt-6">
          Don't have an account?{' '}
          <Link to="/client/signup" className="text-[var(--color-primary)] font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ClientLogin;
