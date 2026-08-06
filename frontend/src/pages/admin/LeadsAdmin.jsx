import React, { useEffect, useState } from 'react';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import { adminApi } from '../../lib/apiClient';

const statusStyles = {
  new: 'bg-[var(--color-brand-electric)]/10 text-[var(--color-brand-electric)]',
  contacted: 'bg-[var(--color-brand-orange)]/10 text-[var(--color-brand-orange)]',
  closed: 'bg-[var(--color-brand-success)]/10 text-[var(--color-brand-success)]'
};

const sourceLabels = {
  homepage: 'Homepage',
  'contact-page': 'Contact Page',
  unknown: 'Unknown'
};

const LeadsAdmin = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [filter, setFilter] = useState('all');

  const load = () => {
    setLoading(true);
    adminApi
      .get('/leads')
      .then((res) => setLeads(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const updateStatus = async (id, status) => {
    setBusyId(id);
    try {
      await adminApi.put(`/leads/${id}/status`, { status });
      load();
    } finally {
      setBusyId(null);
    }
  };

  const deleteLead = async (id) => {
    setBusyId(id);
    try {
      await adminApi.delete(`/leads/${id}`);
      load();
    } finally {
      setBusyId(null);
    }
  };

  const visibleLeads = leads
    .filter((l) => filter === 'all' || l.status === filter)
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-foreground)]">Leads</h1>
        <div className="flex gap-2">
          {['all', 'new', 'contacted', 'closed'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
                filter === s
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-[var(--color-muted)] text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)]/70'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-[var(--color-muted-foreground)]">Loading...</p>
      ) : visibleLeads.length === 0 ? (
        <p className="text-[var(--color-muted-foreground)]">No leads yet.</p>
      ) : (
        <div className="space-y-3">
          {visibleLeads.map((lead) => (
            <div
              key={lead.id}
              className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-5"
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-medium text-[var(--color-foreground)]">{lead.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusStyles[lead.status]}`}>
                      {lead.status}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-[var(--color-muted)] text-[var(--color-muted-foreground)]">
                      {sourceLabels[lead.source] || lead.source}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[var(--color-muted-foreground)] mb-2">
                    <a href={`mailto:${lead.email}`} className="hover:text-[var(--color-primary)] flex items-center gap-1">
                      <Icon name="Mail" size={14} />
                      {lead.email}
                    </a>
                    {lead.phone && (
                      <a href={`tel:${lead.phone}`} className="hover:text-[var(--color-primary)] flex items-center gap-1">
                        <Icon name="Phone" size={14} />
                        {lead.phone}
                      </a>
                    )}
                    {lead.company && (
                      <span className="flex items-center gap-1">
                        <Icon name="Building2" size={14} />
                        {lead.company}
                      </span>
                    )}
                    {lead.service && (
                      <span className="flex items-center gap-1">
                        <Icon name="Tag" size={14} />
                        {lead.service}
                      </span>
                    )}
                  </div>
                  {lead.message && (
                    <p className="text-sm text-[var(--color-foreground)]/80 mt-1">"{lead.message}"</p>
                  )}
                  <p className="text-xs text-[var(--color-muted-foreground)] mt-2">
                    Submitted {new Date(lead.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  {lead.status !== 'contacted' && (
                    <Button
                      size="xs"
                      variant="outline"
                      loading={busyId === lead.id}
                      onClick={() => updateStatus(lead.id, 'contacted')}
                    >
                      Mark Contacted
                    </Button>
                  )}
                  {lead.status !== 'closed' && (
                    <Button
                      size="xs"
                      variant="default"
                      loading={busyId === lead.id}
                      onClick={() => updateStatus(lead.id, 'closed')}
                    >
                      Mark Closed
                    </Button>
                  )}
                  <Button
                    size="xs"
                    variant="ghost"
                    iconName="Trash2"
                    loading={busyId === lead.id}
                    onClick={() => deleteLead(lead.id)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LeadsAdmin;
