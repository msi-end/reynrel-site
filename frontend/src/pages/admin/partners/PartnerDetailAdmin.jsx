import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import { adminApi } from '../../../lib/apiClient';
import { Card, StatCard, StatusBadge, Table, Td, Empty, Btn, Field, inputCls, Alert, Modal, inr, fmtDate, errMsg } from '../../../components/partner/ui';

const DOC_LABELS = { panCard: 'PAN card', cancelledCheque: 'Cancelled cheque / passbook', addressProof: 'Address proof', gstCertificate: 'GST certificate', qualificationCertificate: 'Qualification certificate', photo: 'Photo' };

const Row = ({ k, v, mono }) => (<><dt className="text-slate-500">{k}</dt><dd className={`col-span-2 ${mono ? 'font-mono' : ''}`}>{v || '—'}</dd></>);

const AccessEditor = ({ partner, products, onSaved }) => {
  const [rows, setRows] = useState(() => products.map((pr) => {
    const a = partner.productAccess.find((x) => x.productId === pr.id);
    return {
      productId: pr.id, name: pr.name, price: pr.pricingAnnual, assigned: !!a && a.enabled !== false,
      commissionPercent: a?.commissionPercent ?? '', renewalPercent: a?.renewalPercent ?? '',
      plans: a?.plans?.length ? a.plans : pr.pricingAnnual ? [{ name: 'Standard (Annual)', price: pr.pricingAnnual }] : [],
      demoUrl: a?.demoAccess?.url || '', demoUser: a?.demoAccess?.username || '', demoPass: a?.demoAccess?.password || '',
      resources: (a?.resources || []).map((r) => `${r.label}|${r.url}`).join('\n')
    };
  }));
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const upd = (i, k, v) => setRows((rs) => rs.map((r, j) => (j === i ? { ...r, [k]: v } : r)));

  const save = async () => {
    setBusy(true);
    setMsg(null);
    try {
      const productAccess = rows.filter((r) => r.assigned).map((r) => ({
        productId: r.productId, enabled: true,
        commissionPercent: r.commissionPercent === '' ? null : Number(r.commissionPercent),
        renewalPercent: r.renewalPercent === '' ? null : Number(r.renewalPercent),
        plans: r.plans.filter((p) => p.name),
        demoAccess: r.demoUrl ? { url: r.demoUrl, username: r.demoUser, password: r.demoPass } : null,
        resources: r.resources.split('\n').map((l) => l.trim()).filter(Boolean).map((l) => { const [label, url] = l.includes('|') ? l.split('|') : ['Resource', l]; return { label: label.trim(), url: url.trim() }; })
      }));
      await adminApi.put(`/admin/partners/${partner.id}/access`, { productAccess });
      setMsg({ tone: 'green', text: 'Software access saved.' });
      onSaved();
    } catch (err) {
      setMsg({ tone: 'red', text: errMsg(err) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      {msg && <Alert tone={msg.tone}>{msg.text}</Alert>}
      <p className="text-sm text-slate-600">Leave a rate blank to use the partner's default ({partner.commission.defaultPercent}% / {partner.commission.renewalPercent}%).</p>
      {rows.map((r, i) => (
        <div key={r.productId} className={`rounded-xl border p-4 ${r.assigned ? 'border-blue-200 bg-blue-50/30' : 'border-slate-200'}`}>
          <label className="flex items-center gap-2 font-medium text-slate-900">
            <input type="checkbox" className="h-4 w-4" checked={r.assigned} onChange={(e) => upd(i, 'assigned', e.target.checked)} /> {r.name}
            {r.price ? <span className="text-xs font-normal text-slate-500">list {inr(r.price)}/yr</span> : null}
          </label>
          {r.assigned && (
            <div className="mt-4 grid md:grid-cols-2 gap-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="New sale %"><input type="number" min={0} max={100} className={inputCls()} value={r.commissionPercent} placeholder={String(partner.commission.defaultPercent)} onChange={(e) => upd(i, 'commissionPercent', e.target.value)} /></Field>
                <Field label="Renewal %"><input type="number" min={0} max={100} className={inputCls()} value={r.renewalPercent} placeholder={String(partner.commission.renewalPercent)} onChange={(e) => upd(i, 'renewalPercent', e.target.value)} /></Field>
              </div>
              <div>
                <span className="block text-sm font-medium text-slate-700 mb-1">Plans partner can sell</span>
                {r.plans.map((p, k) => (
                  <div key={k} className="flex gap-2 mb-2">
                    <input className={inputCls()} value={p.name} placeholder="Plan name" onChange={(e) => upd(i, 'plans', r.plans.map((x, m) => (m === k ? { ...x, name: e.target.value } : x)))} />
                    <input type="number" className={`${inputCls()} w-32`} value={p.price} placeholder="₹" onChange={(e) => upd(i, 'plans', r.plans.map((x, m) => (m === k ? { ...x, price: e.target.value } : x)))} />
                    <button type="button" className="text-slate-400 hover:text-red-600" onClick={() => upd(i, 'plans', r.plans.filter((_, m) => m !== k))}><Icon name="Trash2" size={16} /></button>
                  </div>
                ))}
                <button type="button" className="text-xs text-blue-600" onClick={() => upd(i, 'plans', [...r.plans, { name: '', price: '' }])}>+ Add plan</button>
              </div>
              <div className="grid grid-cols-3 gap-2 md:col-span-2">
                <Field label="Demo URL"><input className={inputCls()} value={r.demoUrl} onChange={(e) => upd(i, 'demoUrl', e.target.value)} /></Field>
                <Field label="Demo user"><input className={inputCls()} value={r.demoUser} onChange={(e) => upd(i, 'demoUser', e.target.value)} /></Field>
                <Field label="Demo password"><input className={inputCls()} value={r.demoPass} onChange={(e) => upd(i, 'demoPass', e.target.value)} /></Field>
              </div>
              <Field label="Sales resources (one per line: Label|https://…)" className="md:col-span-2"><textarea className={`${inputCls()} h-16 py-2`} value={r.resources} onChange={(e) => upd(i, 'resources', e.target.value)} /></Field>
            </div>
          )}
        </div>
      ))}
      <Btn onClick={save} loading={busy}>Save access & rates</Btn>
    </div>
  );
};

const PartnerDetailAdmin = () => {
  const { id } = useParams();
  const [d, setD] = useState(null);
  const [tab, setTab] = useState('profile');
  const [sensitive, setSensitive] = useState(null);
  const [statusModal, setStatusModal] = useState(null);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const [commission, setCommission] = useState(null);
  const [notes, setNotes] = useState('');
  const [tier, setTier] = useState('');
  const [adj, setAdj] = useState({ amount: '', description: '' });

  const load = () => adminApi.get(`/admin/partners/${id}`).then((r) => {
    setD(r.data);
    setCommission(r.data.partner.commission);
    setNotes(r.data.partner.adminNotes || '');
    setTier(r.data.partner.tier || '');
  });
  useEffect(() => { load(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!d) return <p className="text-slate-500">Loading…</p>;
  const p = d.partner;

  const act = async (fn, ok) => {
    setBusy(true);
    setMsg(null);
    try {
      await fn();
      setMsg({ tone: 'green', text: ok });
      await load();
      return true;
    } catch (err) {
      setMsg({ tone: 'red', text: errMsg(err) });
      return false;
    } finally {
      setBusy(false);
    }
  };

  const changeStatus = async () => {
    const ok = await act(() => adminApi.put(`/admin/partners/${id}/status`, { status: statusModal, reason, productIds: statusModal === 'approved' ? d.products.map((x) => x.id) : undefined }), `Partner ${statusModal}.`);
    if (ok) { setStatusModal(null); setReason(''); }
  };

  const openDoc = async (doc) => {
    const r = await adminApi.get(`/admin/partners/${id}/documents/${doc.id}`, { responseType: 'blob' });
    const url = URL.createObjectURL(r.data);
    window.open(url, '_blank', 'noopener');
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  };

  const reveal = async () => setSensitive((await adminApi.get(`/admin/partners/${id}/sensitive`)).data);

  return (
    <div className="space-y-6">
      <Link to="/admin/partners" className="text-sm text-slate-500 inline-flex items-center gap-1"><Icon name="ArrowLeft" size={14} />Partners</Link>
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-slate-900">{p.personal.fullName}</h1>
            <StatusBadge status={p.status} />
            <span className="text-xs bg-slate-100 rounded-full px-2 py-0.5">{p.tier}</span>
          </div>
          <p className="text-sm text-slate-500"><span className="font-mono">{p.partnerCode}</span> · {p.partnerTypeLabel} · {p.business.name || 'Individual'} · applied {fmtDate(p.createdAt)}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {p.status !== 'approved' && <Btn variant="success" icon="Check" onClick={() => setStatusModal('approved')}>Approve</Btn>}
          {p.status === 'pending' && <Btn variant="outline" icon="X" onClick={() => setStatusModal('rejected')}>Reject</Btn>}
          {p.status === 'approved' && <Btn variant="outline" icon="Ban" onClick={() => setStatusModal('suspended')}>Suspend</Btn>}
        </div>
      </div>
      {msg && <Alert tone={msg.tone}>{msg.text}</Alert>}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total earned" value={inr(d.balance.totalEarned)} icon="TrendingUp" />
        <StatCard label="Available" value={inr(d.balance.available)} icon="Wallet" tone="green" />
        <StatCard label="Paid (net)" value={inr(d.balance.paidNet)} icon="Landmark" tone="slate" hint={`TDS ${inr(d.balance.tdsDeducted)}`} />
        <StatCard label="Customers" value={`${d.customers.filter((c) => c.status === 'approved').length}/${d.customers.length}`} icon="Users" tone="violet" hint={`expected ${p.expectedMonthlyCustomers}/month`} />
      </div>

      <div className="flex gap-1 overflow-x-auto border-b border-slate-200">
        {[['profile', 'Profile & KYC'], ['access', 'Software & commission'], ['customers', `Customers (${d.customers.length})`], ['ledger', 'Ledger'], ['withdrawals', `Withdrawals (${d.withdrawals.length})`]].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={`px-4 py-2 text-sm whitespace-nowrap border-b-2 -mb-px ${tab === k ? 'border-blue-600 text-blue-700 font-medium' : 'border-transparent text-slate-500'}`}>{l}</button>
        ))}
      </div>

      {tab === 'profile' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <Card title="Contact & address">
            <dl className="grid grid-cols-3 gap-y-2 text-sm">
              <Row k="Email" v={p.contact.email} /><Row k="Mobile" v={p.contact.mobile} /><Row k="WhatsApp" v={p.contact.whatsapp} />
              <Row k="DOB" v={p.personal.dateOfBirth} />
              <Row k="Address" v={[p.address.line1, p.address.line2, p.address.city, p.address.district, p.address.state, p.address.pincode].filter(Boolean).join(', ')} />
            </dl>
          </Card>
          <Card title="Business & professional">
            <dl className="grid grid-cols-3 gap-y-2 text-sm">
              <Row k="Entity" v={p.business.entityType} /><Row k="GSTIN" v={p.business.gstin} mono /><Row k="Website" v={p.business.website} />
              <Row k="Qualification" v={p.professional.qualification} /><Row k="Membership no." v={p.professional.membershipNumber} />
              <Row k="Experience" v={p.professional.experienceYears && `${p.professional.experienceYears} yrs`} /><Row k="Client base" v={p.professional.existingClientBase} />
              <Row k="Team" v={p.professional.teamSize} /><Row k="Industries" v={p.professional.industriesServed?.join(', ')} />
              <Row k="Areas" v={p.professional.areasServed} /><Row k="Software known" v={p.professional.softwareExperience} />
              <Row k="Heard via" v={p.professional.howDidYouHear} />
            </dl>
          </Card>
          <Card title="PAN & bank" action={!sensitive && <Btn size="sm" variant="outline" icon="Eye" onClick={reveal}>Reveal (logged)</Btn>}>
            <dl className="grid grid-cols-3 gap-y-2 text-sm">
              <Row k="PAN" v={sensitive ? sensitive.pan : p.pan.masked} mono /><Row k="Name on PAN" v={p.pan.nameOnPan} />
              <Row k="Account holder" v={p.bank.accountHolder} /><Row k="Account no." v={sensitive ? sensitive.accountNumber : p.bank.accountMasked} mono />
              <Row k="IFSC" v={p.bank.ifsc} mono /><Row k="Bank" v={`${p.bank.bankName}${p.bank.branch ? ` · ${p.bank.branch}` : ''} (${p.bank.accountType})`} />
              <dt className="text-slate-500">Verified</dt><dd className="col-span-2"><StatusBadge status={p.bank.verified ? 'approved' : 'pending'} label={p.bank.verified ? 'Verified' : 'Not verified'} /></dd>
            </dl>
            {p.pendingBankChange && (
              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm">
                <div className="font-medium text-amber-900">Requested bank change · {fmtDate(p.pendingBankChange.requestedAt)}</div>
                <div className="mt-1 text-amber-900">{p.pendingBankChange.accountHolder} · <span className="font-mono">{sensitive?.pendingAccountNumber || p.pendingBankChange.accountMasked}</span> · <span className="font-mono">{p.pendingBankChange.ifsc}</span> · {p.pendingBankChange.bankName}</div>
                <div className="mt-3 flex gap-2">
                  <Btn size="sm" variant="success" loading={busy} onClick={() => act(() => adminApi.put(`/admin/partners/${id}/bank-change`, { action: 'approve' }), 'Bank change approved.')}>Approve change</Btn>
                  <Btn size="sm" variant="outline" loading={busy} onClick={() => act(() => adminApi.put(`/admin/partners/${id}/bank-change`, { action: 'reject' }), 'Bank change rejected.')}>Reject</Btn>
                </div>
              </div>
            )}
          </Card>
          <Card title="Documents">
            {p.documents.length === 0 ? <p className="text-sm text-slate-500">No documents.</p> : (
              <ul className="divide-y divide-slate-100 -my-2">
                {p.documents.map((doc) => (
                  <li key={doc.id} className="py-2 flex items-center justify-between gap-3 text-sm">
                    <div><div className="font-medium text-slate-800">{DOC_LABELS[doc.type] || doc.type}</div><div className="text-xs text-slate-500">{doc.originalName} · {(doc.size / 1024).toFixed(0)} KB · {fmtDate(doc.uploadedAt)}</div></div>
                    <Btn size="sm" variant="outline" icon="ExternalLink" onClick={() => openDoc(doc)}>View</Btn>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500">
              Terms accepted: {p.termsAcceptance.map((t) => `v${t.version} on ${fmtDate(t.acceptedAt)} (IP ${t.ip})`).join('; ')}
            </div>
          </Card>
          <Card title="Status history & admin notes" className="lg:col-span-2">
            <div className="grid md:grid-cols-2 gap-6">
              <ol className="text-sm space-y-2">
                {p.statusHistory.slice().reverse().map((h, i) => (
                  <li key={i} className="flex gap-2"><StatusBadge status={h.status} /><span className="text-slate-500">{new Date(h.at).toLocaleString('en-IN')} · {h.by}</span>{h.reason && <span className="text-slate-700">— {h.reason}</span>}</li>
                ))}
              </ol>
              <div className="space-y-3">
                <Field label="Tier"><input className={inputCls()} value={tier} onChange={(e) => setTier(e.target.value)} /></Field>
                <Field label="Internal notes"><textarea className={`${inputCls()} h-24 py-2`} value={notes} onChange={(e) => setNotes(e.target.value)} /></Field>
                <Btn size="sm" loading={busy} onClick={() => act(() => adminApi.put(`/admin/partners/${id}`, { adminNotes: notes, tier }), 'Saved.')}>Save</Btn>
              </div>
            </div>
          </Card>
        </div>
      )}

      {tab === 'access' && (
        <div className="space-y-6">
          <Card title="Default commission rates">
            <div className="flex flex-wrap items-end gap-3">
              <Field label="New sale %"><input type="number" min={0} max={100} className={`${inputCls()} w-32`} value={commission.defaultPercent} onChange={(e) => setCommission({ ...commission, defaultPercent: e.target.value })} /></Field>
              <Field label="Renewal %"><input type="number" min={0} max={100} className={`${inputCls()} w-32`} value={commission.renewalPercent} onChange={(e) => setCommission({ ...commission, renewalPercent: e.target.value })} /></Field>
              <Btn loading={busy} onClick={() => act(() => adminApi.put(`/admin/partners/${id}`, { commission }), 'Default rates saved.')}>Save defaults</Btn>
            </div>
            <p className="mt-3 text-xs text-slate-500">Rate changes apply to customers approved from now on. Past ledger entries are not recalculated.</p>
          </Card>
          <Card title="Software access"><AccessEditor partner={p} products={d.products} onSaved={load} /></Card>
        </div>
      )}

      {tab === 'customers' && (
        <Card action={<Link to={`/admin/partner-customers?partnerId=${id}`} className="text-sm text-blue-600">Manage in review queue →</Link>} title="Customers">
          <Table head={['Customer', 'Software', 'Value', 'Status', 'Installation', 'Subscription']} empty={d.customers.length === 0 && <Empty title="No customers yet" />}>
            {d.customers.map((c) => (
              <tr key={c.id}>
                <Td><div className="font-medium">{c.businessName}</div><div className="text-xs text-slate-500">{c.contactName} · {c.mobile} · {c.city}</div></Td>
                <Td>{c.productName}<div className="text-xs text-slate-500">{c.plan}</div></Td>
                <Td className="tabular-nums">{inr(c.saleAmount ?? c.planAmount)}</Td>
                <Td><StatusBadge status={c.status} /></Td>
                <Td><StatusBadge status={c.installation.status} /></Td>
                <Td className="text-xs">{c.subscription ? <>{fmtDate(c.subscription.startDate)} → {fmtDate(c.subscription.endDate)}</> : '—'}</Td>
              </tr>
            ))}
          </Table>
        </Card>
      )}

      {tab === 'ledger' && (
        <div className="space-y-6">
          <Card title="Manual adjustment">
            <div className="flex flex-wrap items-end gap-3">
              <Field label="Amount (₹, negative to debit)"><input type="number" className={`${inputCls()} w-48`} value={adj.amount} onChange={(e) => setAdj({ ...adj, amount: e.target.value })} /></Field>
              <Field label="Description" className="flex-1 min-w-[220px]"><input className={inputCls()} value={adj.description} onChange={(e) => setAdj({ ...adj, description: e.target.value })} placeholder="e.g. Festive bonus Oct 2026" /></Field>
              <Btn loading={busy} onClick={async () => { if (await act(() => adminApi.post(`/admin/partners/${id}/adjustments`, { amount: Number(adj.amount), description: adj.description }), 'Adjustment recorded.')) setAdj({ amount: '', description: '' }); }}>Add entry</Btn>
            </div>
          </Card>
          <Card title="Commission ledger">
            <Table head={['Date', 'Type', 'Description', 'Base', 'Rate', 'Amount', 'By']} empty={d.ledger.length === 0 && <Empty title="No entries" />}>
              {d.ledger.map((l) => (
                <tr key={l.id}>
                  <Td className="whitespace-nowrap">{fmtDate(l.createdAt)}</Td><Td><StatusBadge status={l.type} /></Td><Td>{l.description}</Td>
                  <Td className="tabular-nums">{l.baseAmount ? inr(l.baseAmount) : '—'}</Td><Td>{l.percent ? `${l.percent}%` : '—'}</Td>
                  <Td className={`tabular-nums font-medium ${l.amount < 0 ? 'text-red-600' : 'text-emerald-700'}`}>{inr(l.amount, { decimals: 2 })}</Td>
                  <Td className="text-xs text-slate-500">{l.createdBy}</Td>
                </tr>
              ))}
            </Table>
          </Card>
        </div>
      )}

      {tab === 'withdrawals' && (
        <Card title="Withdrawals" action={<Link to="/admin/partner-withdrawals" className="text-sm text-blue-600">Process withdrawals →</Link>}>
          <Table head={['Reference', 'Requested', 'Gross', 'Net', 'Status', 'UTR']} empty={d.withdrawals.length === 0 && <Empty title="No withdrawals" />}>
            {d.withdrawals.map((w) => (
              <tr key={w.id}><Td className="font-mono text-xs">{w.reference}</Td><Td>{fmtDate(w.requestedAt)}</Td><Td className="tabular-nums">{inr(w.amount)}</Td><Td className="tabular-nums">{inr(w.netAmount)}</Td><Td><StatusBadge status={w.status} /></Td><Td className="font-mono text-xs">{w.payment?.utr || '—'}</Td></tr>
            ))}
          </Table>
        </Card>
      )}

      <Modal open={!!statusModal} title={statusModal === 'approved' ? 'Approve partner' : statusModal === 'rejected' ? 'Reject application' : 'Suspend partner'} onClose={() => setStatusModal(null)}>
        <div className="space-y-4 text-sm">
          {statusModal === 'approved' && <p className="text-slate-600">This marks the bank account as verified and gives dashboard access. {p.productAccess.length === 0 && 'All products will be assigned at the default rate — refine them in “Software & commission”.'} Make sure you have checked the PAN, bank proof and address proof.</p>}
          {statusModal !== 'approved' && <Field label="Reason (shown to partner)" required><textarea className={`${inputCls()} h-24 py-2`} value={reason} onChange={(e) => setReason(e.target.value)} /></Field>}
          {statusModal === 'approved' && <Field label="Note (optional)"><input className={inputCls()} value={reason} onChange={(e) => setReason(e.target.value)} /></Field>}
          <div className="flex justify-end gap-2"><Btn variant="outline" onClick={() => setStatusModal(null)}>Cancel</Btn><Btn variant={statusModal === 'approved' ? 'success' : 'danger'} loading={busy} onClick={changeStatus}>Confirm</Btn></div>
        </div>
      </Modal>
    </div>
  );
};

export default PartnerDetailAdmin;
