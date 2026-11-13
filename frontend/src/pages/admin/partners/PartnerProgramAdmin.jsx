import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../../lib/apiClient';
import { Card, Btn, Field, inputCls, Alert, fmtDate, errMsg, Table, Td } from '../../../components/partner/ui';

const PartnerProgramAdmin = () => {
  const [s, setS] = useState(null);
  const [terms, setTerms] = useState([]);
  const [draft, setDraft] = useState('');
  const [msg, setMsg] = useState(null);
  const [tmsg, setTmsg] = useState(null);
  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState([]);

  const load = () => adminApi.get('/admin/partner-ops/program').then((r) => { setS(r.data.settings); setTerms(r.data.terms); setDraft(r.data.terms[0]?.content || ''); });
  useEffect(() => { load(); adminApi.get('/admin/partner-ops/audit-log').then((r) => setLog(r.data)); }, []);

  if (!s) return <p className="text-slate-500">Loading…</p>;
  const save = async () => {
    setBusy(true);
    try {
      await adminApi.put('/admin/partner-ops/program', s);
      setMsg({ tone: 'green', text: 'Settings saved.' });
    } catch (e) {
      setMsg({ tone: 'red', text: errMsg(e) });
    } finally {
      setBusy(false);
    }
  };
  const publish = async () => {
    if (!window.confirm('Publish a new version? All partners will be asked to accept it.')) return;
    try {
      await adminApi.post('/admin/partner-ops/terms', { content: draft });
      setTmsg({ tone: 'green', text: 'New terms version published.' });
      load();
    } catch (e) {
      setTmsg({ tone: 'red', text: errMsg(e) });
    }
  };
  const num = (k) => <input type="number" className={inputCls()} value={s[k]} onChange={(e) => setS({ ...s, [k]: e.target.value })} />;
  const tierSet = (i, k, v) => setS({ ...s, tiers: s.tiers.map((t, j) => (j === i ? { ...t, [k]: v } : t)) });

  return (
    <div className="space-y-6">
      <div>
        <Link to="/admin/partners" className="text-sm text-slate-500">← Partners</Link>
        <h1 className="text-2xl font-bold text-slate-900 mt-1">Partner program settings</h1>
      </div>
      <Card title="Payout & commission defaults">
        {msg && <div className="mb-4"><Alert tone={msg.tone}>{msg.text}</Alert></div>}
        <div className="grid md:grid-cols-5 gap-4">
          <Field label="Minimum withdrawal (₹)">{num('minWithdrawal')}</Field>
          <Field label="TDS on payout (%)" hint="Sec. 194H — confirm current rate with your CA">{num('tdsPercent')}</Field>
          <Field label="Default new-sale %">{num('defaultCommissionPercent')}</Field>
          <Field label="Default renewal %">{num('defaultRenewalPercent')}</Field>
          <Field label="Payout cycle (days)">{num('payoutCycleDays')}</Field>
        </div>
        <h3 className="mt-6 mb-2 text-sm font-medium text-slate-900">Tiers (shown on the public partner page)</h3>
        <Table head={['Name', 'Min approved customers / quarter', 'New sale %', 'Renewal %', '']}>
          {s.tiers.map((t, i) => (
            <tr key={i}>
              <Td><input className={inputCls()} value={t.name} onChange={(e) => tierSet(i, 'name', e.target.value)} /></Td>
              <Td><input type="number" className={inputCls()} value={t.minCustomersPerQuarter} onChange={(e) => tierSet(i, 'minCustomersPerQuarter', e.target.value)} /></Td>
              <Td><input type="number" className={inputCls()} value={t.commissionPercent} onChange={(e) => tierSet(i, 'commissionPercent', e.target.value)} /></Td>
              <Td><input type="number" className={inputCls()} value={t.renewalPercent} onChange={(e) => tierSet(i, 'renewalPercent', e.target.value)} /></Td>
              <Td><button className="text-sm text-red-600" onClick={() => setS({ ...s, tiers: s.tiers.filter((_, j) => j !== i) })}>Remove</button></Td>
            </tr>
          ))}
        </Table>
        <div className="mt-3 flex gap-2">
          <Btn variant="outline" size="sm" onClick={() => setS({ ...s, tiers: [...s.tiers, { name: '', minCustomersPerQuarter: 0, commissionPercent: 0, renewalPercent: 0 }] })}>+ Tier</Btn>
          <Btn size="sm" loading={busy} onClick={save}>Save settings</Btn>
        </div>
        <p className="mt-3 text-xs text-slate-500">Changing defaults affects new partners only. Existing partners keep their individual rates.</p>
      </Card>

      <Card title={`Partner terms & conditions — current version ${terms[0]?.version}`}>
        {tmsg && <div className="mb-4"><Alert tone={tmsg.tone}>{tmsg.text}</Alert></div>}
        <textarea className={`${inputCls()} h-96 py-2 font-mono text-xs`} value={draft} onChange={(e) => setDraft(e.target.value)} />
        <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
          <p className="text-xs text-slate-500">Publishing creates a new version. Applicants accept the latest; existing partners are prompted to accept it. Have these reviewed by a lawyer.</p>
          <Btn onClick={publish} disabled={draft.trim() === (terms[0]?.content || '').trim()}>Publish as version {(terms[0]?.version || 0) + 1}</Btn>
        </div>
        <div className="mt-4 text-xs text-slate-500">History: {terms.map((t) => `v${t.version} (${fmtDate(t.effectiveFrom)})`).join(' · ')}</div>
      </Card>

      <Card title="Security audit log (sensitive data access & financial actions)">
        <div className="max-h-80 overflow-y-auto text-xs font-mono space-y-1">
          {log.map((l) => <div key={l.id}><span className="text-slate-400">{new Date(l.at).toLocaleString('en-IN')}</span> {l.actor} <span className="text-blue-700">{l.action}</span> {l.targetId || ''} {Object.keys(l.meta || {}).length ? JSON.stringify(l.meta) : ''}</div>)}
          {log.length === 0 && <p className="text-slate-500">No entries.</p>}
        </div>
      </Card>
    </div>
  );
};

export default PartnerProgramAdmin;
