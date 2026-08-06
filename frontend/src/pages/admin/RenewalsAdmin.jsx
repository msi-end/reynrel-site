import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import { adminApi } from '../../lib/apiClient';

const statusStyles = {
  pending: 'bg-[var(--color-brand-orange)]/10 text-[var(--color-brand-orange)]',
  approved: 'bg-[var(--color-brand-success)]/10 text-[var(--color-brand-success)]',
  rejected: 'bg-destructive/10 text-destructive'
};

const RenewalsAdmin = () => {
  const [requests, setRequests] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const load = () => {
    setLoading(true);
    Promise.all([adminApi.get('/admin/renewals'), adminApi.get('/admin/clients')])
      .then(([renewalsRes, clientsRes]) => {
        setRequests(renewalsRes.data);
        setClients(clientsRes.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const clientById = Object.fromEntries(clients.map((c) => [c.id, c]));
  const subscriptionById = Object.fromEntries(
    clients.flatMap((c) => (c.subscriptions || []).map((s) => [s.id, s]))
  );

  const handleApprove = async (id) => {
    setBusyId(id);
    try {
      await adminApi.put(`/admin/renewals/${id}/approve`, {});
      load();
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (id) => {
    setBusyId(id);
    try {
      await adminApi.put(`/admin/renewals/${id}/reject`, {});
      load();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--color-foreground)] mb-6">Renewal Requests</h1>

      {loading ? (
        <p className="text-[var(--color-muted-foreground)]">Loading...</p>
      ) : requests.length === 0 ? (
        <p className="text-[var(--color-muted-foreground)]">No renewal requests yet.</p>
      ) : (
        <div className="space-y-3">
          {requests
            .slice()
            .sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt))
            .map((req) => {
              const client = clientById[req.clientId];
              const subscription = subscriptionById[req.subscriptionId];
              return (
                <div
                  key={req.id}
                  className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-5 flex items-start justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Link
                        to={client ? `/admin/clients/${client.id}` : '#'}
                        className="font-medium text-[var(--color-foreground)] hover:text-[var(--color-primary)]"
                      >
                        {client?.name || 'Unknown client'}
                      </Link>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusStyles[req.status]}`}
                      >
                        {req.status}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--color-muted-foreground)]">
                      {subscription?.itemName || 'Unknown item'}
                      {subscription && ` · currently valid until ${subscription.planEndDate}`}
                    </p>
                    {req.message && (
                      <p className="text-sm text-[var(--color-foreground)]/80 mt-2">"{req.message}"</p>
                    )}
                    <p className="text-xs text-[var(--color-muted-foreground)] mt-1">
                      Requested {new Date(req.requestedAt).toLocaleString()}
                    </p>
                  </div>

                  {req.status === 'pending' && (
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        size="xs"
                        variant="default"
                        iconName="Check"
                        loading={busyId === req.id}
                        onClick={() => handleApprove(req.id)}
                      >
                        Approve (+1yr)
                      </Button>
                      <Button
                        size="xs"
                        variant="outline"
                        iconName="X"
                        loading={busyId === req.id}
                        onClick={() => handleReject(req.id)}
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
};

export default RenewalsAdmin;
