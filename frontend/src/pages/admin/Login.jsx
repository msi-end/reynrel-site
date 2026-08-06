import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useAdminAuth } from '../../context/AdminAuthContext';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, loading } = useAdminAuth();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!loading && isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(form.username, form.password);
      navigate('/admin');
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
            <Icon name="ShieldCheck" size={28} color="white" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-foreground)]">Admin Login</h1>
          <p className="text-sm text-[var(--color-muted-foreground)] mt-1">Reynrel Infotech Admin Panel</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Username"
            type="text"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
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
      </div>
    </div>
  );
};

export default AdminLogin;
