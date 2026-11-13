import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../../lib/apiClient';
import { Card, StatusBadge, Table, Td, Empty, Btn, Field, inputCls, Alert, Modal, inr, fmtDate, errMsg } from '../../../components/partner/ui';

const PartnerWithdrawalsAdmin = () => {
  const [list, setList] = useState(null);
  const [status, setStatus] = useState('requested');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [flash, setFlash] = useState('');

  const load = () => adminApi.get('/admin/partner-ops/withdrawals', { params: { status: status || undefined } }).then((r) => setList(r.data));
  useEffect(() => { load(); }, [status]); // eslint-disable-line react-hooks/exhaustive-deps

  const open = (action, w) => { setErr(''); setModal({ action, w }); setForm({ note: '', utr: '', mode: 'NEFT', paidOn: new Date().toISOString().slice(0, 10) }); };
  const submit = async () => {
    setBusy(true);
    setErr('');
    try {
      await adminApi.put(`/admin/partner-ops/withdrawals/${modal.w.id}`, { action: modal.action, ...form });
      setFlash(`${modal.w.reference} ${modal.action === 'paid' ? 'marked as paid' : `${modal.action}d`}.`);
      setModal(null);
      load();
    } catch (e) {
      setErr(errMsg(e));
    } finally {
      setBusy(false);
    }
  };
  const exportCsv = async () => {
    const r = await adminApi.get('/admin/partner-ops/withdrawals/export.csv', { responseType: 'blob' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(r.data);
    a.download = `partner-payouts-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link to="/admin/partners" className="text-sm text-slate-500">← Partners</Link>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Withdrawals & payouts</h1>
          <p className="text-sm text-slate-500">Approve requests, transfer via your bank, then record the UTR to mark as paid.</p>
        </div>
        <Btn variant="outline" icon="Download" onClick={exportCsv}>Bank transfer sheet (approved)</Btn>
      </div>
      {flash && <Alert tone="green">{flash}</Alert>}
      <Card>
        <div className="flex gap-1 overflow-x-auto mb-4">
          {[['requested', 'New requests'], ['approved', 'Approved — to pay'], ['paid', 'Paid'], ['rejected', 'Rejected'], ['', 'All']].map(([k, l]) => (
            <button key={k} onClick={() => setStatus(k)} className={`px-3 h-8 rounded-lg text-sm whitespace-nowrap ${status === k ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>{l}</button>
          ))}
        </div>
        {!list ? <p className="text-sm text-slate-500">Loading…</p> : (
          <Table head={['Reference', 'Partner', 'Gross', 'TDS', 'Net payable', 'Bank', 'Status', '']} empty={list.length === 0 && <Empty icon="Landmark" title="No withdrawals" />}>
            {list.map((w) => (
              <tr key={w.id}>
                <Td><div className="font-mono text-xs">{w.reference}</div><div className="text-xs text-slate-500">{fmtDate(w.requestedAt)}</div>{w.note && <div className="text-xs text-slate-600">“{w.note}”</div>}</Td>
                <Td>{w.partner && <Link className="text-blue-600" to={`/admin/partners/${w.partner.id}`}>{w.partner.name}</Link>}<div className="text-xs font-mono text-slate-500">{w.partner?.partnerCode}</div></Td>
                <Td className="tabular-nums">{inr(w.amount, { decimals: 2 })}</Td>
                <Td className="tabular-nums">{inr(w.tdsAmount, { decimals: 2 })} <span className="text-xs text-slate-500">({w.tdsPercent}%)</span></Td>
                <Td className="tabular-nums font-semibold">{inr(w.netAmount, { decimals: 2 })}</Td>
                <Td className="text-xs">{w.bankSnapshot.accountHolder}<div className="font-mono">••{w.bankSnapshot.accountLast4} · {w.bankSnapshot.ifsc}</div>{w.bankSnapshot.bankName}</Td>
                <Td><StatusBadge status={w.status} />{w.payment && <div className="text-xs mt-1">{w.payment.mode} · <span className="font-mono">{w.payment.utr}</span><div>{fmtDate(w.payment.paidOn)}</div></div>}{w.reviewNote && <div className="text-xs text-slate-500 mt-1">{w.reviewNote}</div>}</Td>
                <Td>
                  <div className="flex flex-col gap-1.5">
                    {w.status === 'requested' && <Btn size="sm" variant="success" onClick={() => open('approve', w)}>Approve</Btn>}
                    {['requested', 'approved'].includes(w.status) && <Btn size="sm" onClick={() => open('paid', w)}>Mark paid</Btn>}
                    {['requested', 'approved'].includes(w.status) && <Btn size="sm" variant="outline" onClick={() => open('reject', w)}>Reject</Btn>}
                  </div>
                </Td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
      {modal && (
        <Modal open title={`${{ approve: 'Approve', paid: 'Record payment for', reject: 'Reject' }[modal.action]} ${modal.w.reference}`} onClose={() => setModal(null)}>
          <div className="space-y-4 text-sm">
            {err && <Alert>{err}</Alert>}
            <p className="text-slate-600">{modal.w.partner?.name} · net payable <strong>{inr(modal.w.netAmount, { decimals: 2 })}</strong> to ••{modal.w.bankSnapshot.accountLast4} ({modal.w.bankSnapshot.ifsc})</p>
            {modal.action === 'paid' && (
              <div className="grid grid-cols-2 gap-3">
                <Field label="UTR / bank reference" required><input className={inputCls()} value={form.utr} onChange={(e) => setForm({ ...form, utr: e.target.value })} /></Field>
                <Field label="Mode"><select className={inputCls()} value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value })}>{['NEFT', 'RTGS', 'IMPS', 'UPI', 'Cheque'].map((m) => <option key={m}>{m}</option>)}</select></Field>
                <Field label="Paid on"><input type="date" className={inputCls()} value={form.paidOn} onChange={(e) => setForm({ ...form, paidOn: e.target.value })} /></Field>
              </div>
            )}
            {modal.action === 'reject' && <p className="text-slate-600">The amount returns to the partner's available balance.</p>}
            <Field label={modal.action === 'reject' ? 'Reason (shown to partner)' : 'Note'} required={modal.action === 'reject'}><input className={inputCls()} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} /></Field>
            <div className="flex justify-end gap-2"><Btn variant="outline" onClick={() => setModal(null)}>Cancel</Btn><Btn variant={modal.action === 'reject' ? 'danger' : 'primary'} loading={busy} onClick={submit}>Confirm</Btn></div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PartnerWithdrawalsAdmin;
