import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { differenceInCalendarDays } from 'date-fns';
import Button from '../../components/ui/Button';
import { clientApi } from '../../lib/apiClient';
import { useClientAuth } from '../../context/ClientAuthContext';

const statusStyles = {
  pending: 'bg-[var(--color-brand-orange)]/10 text-[var(--color-brand-orange)]',
  approved: 'bg-[var(--color-brand-success)]/10 text-[var(--color-brand-success)]',
  rejected: 'bg-destructive/10 text-destructive'
};

const ClientDashboard = () => {
  const navigate = useNavigate();
  const { client, logout, refresh } = useClientAuth();
  const [renewals, setRenewals] = useState([]);
  const [activeRequestId, setActiveRequestId] = useState(null);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadRenewals = () => {
    clientApi.get('/client/renewals').then((res) => setRenewals(res.data));
  };

  useEffect(loadRenewals, []);

  const handleLogout = () => {
    logout();
    navigate('/client/login');
  };

  const handleRequestRenewal = async (subscriptionId) => {
    setSubmitting(true);
    try {
      await clientApi.post('/client/renewals', { subscriptionId, message });
      setMessage('');
      setActiveRequestId(null);
      loadRenewals();
      refresh();
    } finally {
      setSubmitting(false);
    }
  };

  const pendingBySubscription = new Set(
    renewals.filter((r) => r.status === 'pending').map((r) => r.subscriptionId)
  );

  if (!client) return null;

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <header className="bg-[var(--color-card)] border-b border-[var(--color-border)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <span className="font-bold text-[var(--color-foreground)]">Reynrel Client Panel</span>
          <Button size="sm" variant="outline" iconName="LogOut" onClick={handleLogout}>
            Log Out
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-2xl font-bold text-[var(--color-foreground)] mb-1">Welcome, {client.name}</h1>
        <p className="text-sm text-[var(--color-muted-foreground)] mb-8">{client.email} · {client.mobile}</p>

        <h2 className="text-lg font-semibold text-[var(--color-foreground)] mb-4">Your Products & Services</h2>
        {(client.subscriptions || []).length === 0 ? (
          <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-6 mb-10 text-sm text-[var(--color-muted-foreground)]">
            No products or services have been assigned to your account yet. Contact us if you believe this is a
            mistake.
          </div>
        ) : (
          <div className="space-y-4 mb-10">
            {client.subscriptions.map((sub) => {
              const daysLeft = differenceInCalendarDays(new Date(sub.planEndDate), new Date());
              const expired = daysLeft < 0;
              const hasPendingRequest = pendingBySubscription.has(sub.id);
              return (
                <div key={sub.id} className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-6">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <h3 className="font-semibold text-[var(--color-foreground)]">{sub.itemName}</h3>
                      <p className="text-xs text-[var(--color-muted-foreground)] capitalize">{sub.itemType}</p>
                      <p className="text-sm text-[var(--color-foreground)]/80 mt-2">
                        ₹{Number(sub.planAmount).toLocaleString()} / year · Valid {sub.planStartDate} to{' '}
                        {sub.planEndDate}
                      </p>
                      <p className={`text-sm font-medium mt-1 ${expired ? 'text-destructive' : 'text-[var(--color-brand-success)]'}`}>
                        {expired ? 'Expired' : `${daysLeft} days remaining`}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      {hasPendingRequest ? (
                        <span className="text-xs px-3 py-1.5 rounded-full font-medium bg-[var(--color-brand-orange)]/10 text-[var(--color-brand-orange)]">
                          Renewal Requested
                        </span>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          iconName="RefreshCcw"
                          onClick={() => setActiveRequestId(activeRequestId === sub.id ? null : sub.id)}
                        >
                          Request Renewal
                        </Button>
                      )}
                    </div>
                  </div>

                  {activeRequestId === sub.id && (
                    <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
                      <textarea
                        rows={2}
                        placeholder="Optional message for our team..."
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm mb-3"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                      />
                      <Button
                        size="sm"
                        variant="default"
                        loading={submitting}
                        onClick={() => handleRequestRenewal(sub.id)}
                      >
                        Submit Request
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <h2 className="text-lg font-semibold text-[var(--color-foreground)] mb-4">Renewal Request History</h2>
        {renewals.length === 0 ? (
          <p className="text-sm text-[var(--color-muted-foreground)]">No renewal requests yet.</p>
        ) : (
          <div className="space-y-2">
            {renewals
              .slice()
              .sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt))
              .map((r) => {
                const sub = (client.subscriptions || []).find((s) => s.id === r.subscriptionId);
                return (
                  <div
                    key={r.id}
                    className="flex items-center justify-between px-4 py-3 bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg"
                  >
                    <div>
                      <span className="text-sm font-medium text-[var(--color-foreground)]">
                        {sub?.itemName || 'Item'}
                      </span>
                      <span className="text-xs text-[var(--color-muted-foreground)] ml-2">
                        {new Date(r.requestedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusStyles[r.status]}`}>
                      {r.status}
                    </span>
                  </div>
                );
              })}
          </div>
        )}
      </main>
    </div>
  );
};

export default ClientDashboard;
