import React, { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useClientAuth } from '../../context/ClientAuthContext';

const ClientSignup = () => {
  const navigate = useNavigate();
  const { signup, isAuthenticated, loading } = useClientAuth();
  const [form, setForm] = useState({ name: '', email: '', mobile: '', password: '' });
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
      await signup(form.name, form.email, form.mobile, form.password);
      navigate('/client/dashboard');
    } catch (err) {
      setError(err?.response?.data?.error || 'Sign up failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] px-4 py-12">
      <div className="w-full max-w-md bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl shadow-lg p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center mb-4">
            <Icon name="UserPlus" size={28} color="white" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-foreground)]">Create Your Account</h1>
          <p className="text-sm text-[var(--color-muted-foreground)] mt-1">Track your Reynrel services in one place</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <Input
            label="Mobile Number"
            type="tel"
            value={form.mobile}
            onChange={(e) => setForm({ ...form, mobile: e.target.value })}
            required
          />
          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            description="At least 6 characters"
            required
          />

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" variant="default" fullWidth loading={submitting}>
            Sign Up
          </Button>
        </form>

        <p className="text-sm text-center text-[var(--color-muted-foreground)] mt-6">
          Already have an account?{' '}
          <Link to="/client/login" className="text-[var(--color-primary)] font-medium">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ClientSignup;
