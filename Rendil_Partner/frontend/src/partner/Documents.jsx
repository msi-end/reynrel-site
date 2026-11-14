import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Upload, RefreshCw } from 'lucide-react';
import { partnerApi } from '../lib/api';
import { dateTime } from '../lib/format';
import { Card, PageHeader, Badge, Loading, Button, useAction } from '../components/ui';

// Latest upload per document type with its verification status; re-upload when missing or rejected.
export function DocumentList() {
  const { data } = useQuery({ queryKey: ['partner', 'documents'], queryFn: () => partnerApi.get('/partner/documents') });
  const qc = useQueryClient();
  const [run, busy] = useAction();
  const [uploading, setUploading] = useState(null);
  if (!data) return <Loading />;
  const latest = {};
  data.documents.forEach((d) => { if (!latest[d.doc_type]) latest[d.doc_type] = d; });
  const upload = (key, file) => {
    if (!file) return;
    setUploading(key);
    const fd = new FormData();
    fd.append(key, file);
    run(() => partnerApi.post('/partner/documents', fd), { success: 'Uploaded — waiting for verification' }).then(() => {
      setUploading(null);
      qc.invalidateQueries({ queryKey: ['partner'] });
    });
  };
  return (
    <ul className="divide-y divide-slate-100 -my-2">
      {data.types.map((t) => {
        const d = latest[t.key];
        const req = t.required || (t.requiredIfGstin && data.hasGstin);
        const canUpload = !d || d.status === 'rejected' || d.status === 'pending';
        return (
          <li key={t.key} className="py-3 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
            <div className="min-w-0">
              <div className="text-sm font-medium text-slate-900">{t.label} {req && <span className="text-red-500">*</span>}</div>
              <div className="text-xs text-slate-500">{d ? `${d.original_name} · ${dateTime(d.uploaded_at)}` : req ? 'Not uploaded' : 'Optional'}</div>
              {d?.status === 'rejected' && d.remarks && <div className="text-xs text-red-700 mt-0.5">Reason: {d.remarks}</div>}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {d ? <Badge status={d.status} /> : req ? <Badge tone="red">Missing</Badge> : null}
              {canUpload && (
                <label className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-slate-300 text-sm cursor-pointer hover:bg-slate-50">
                  {busy && uploading === t.key ? <RefreshCw size={14} className="animate-spin" /> : <Upload size={14} />}{d ? 'Replace' : 'Upload'}
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" className="sr-only" disabled={busy} onChange={(e) => upload(t.key, e.target.files?.[0])} />
                </label>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default function Documents() {
  return (
    <>
      <PageHeader title="Documents" subtitle="Your KYC documents and their verification status" />
      <Card><DocumentList /></Card>
    </>
  );
}
