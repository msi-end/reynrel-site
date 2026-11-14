import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Download } from 'lucide-react';
import { adminApi, qs } from '../lib/api';
import { inr, date, today } from '../lib/format';
import { Card, PageHeader, Pills, Table, Td, Badge, Empty, Loading, Button, Modal, Field, Input, Select, useAction } from '../components/ui';

export default function Withdrawals() {
  const [status, setStatus] = useState('requested');
  const [modal, setModal] = useState(null);
  const [run] = useAction();
  const { data } = useQuery({ queryKey: ['admin', 'withdrawals', status], queryFn: () => adminApi.get(`/admin/withdrawals${qs({ status })}`) });
  const qc = useQueryClient();
  const exportCsv = () => run(async () => {
    const blob = await adminApi.blob('/admin/withdrawals/export.csv');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `partner-payouts-${today()}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 10_000);
    return true;
  });
  return (
    <>
      <PageHeader title="Payouts" subtitle="Approve withdrawal requests, transfer from your bank, then record the UTR."
        actions={<Button variant="outline" icon={Download} onClick={exportCsv}>Bank transfer sheet (approved)</Button>} />
      <Card padded={false}>
        <div className="p-4 border-b border-slate-100"><Pills value={status} onChange={setStatus} options={[['requested', 'New requests'], ['approved', 'Approved — to pay'], ['paid', 'Paid'], ['rejected', 'Rejected'], ['', 'All']]} /></div>
        {!data ? <div className="p-4"><Loading /></div> : (
          <Table head={['Reference', 'Partner', 'Gross', 'TDS', 'Net payable', 'Bank', 'Status', '']} empty={data.length === 0 && <Empty title="No withdrawals here" />}>
            {data.map((w) => (
              <tr key={w.id}>
                <Td className="font-mono text-xs">{w.reference}<div className="font-sans text-slate-400">{date(w.requested_at)}</div>{w.partner_note && <div className="font-sans text-slate-600">“{w.partner_note}”</div>}</Td>
                <Td><Link to={`/admin/partners/${w.partner_id}`} className="text-brand-600">{w.partner_name}</Link><div className="text-xs font-mono text-slate-500">{w.partner_code}</div></Td>
                <Td className="tabular">{inr(w.amount)}</Td>
                <Td className="tabular text-slate-600">{inr(w.tds_amount)} <span className="text-xs">({Number(w.tds_pct)}%)</span></Td>
                <Td className="tabular font-semibold">{inr(w.net_amount)}</Td>
                <Td className="text-xs">{w.bank_holder}<div className="font-mono">••{w.bank_last4} · {w.bank_ifsc}</div>{w.bank_name}</Td>
                <Td><Badge status={w.status} />{w.utr && <div className="text-xs mt-1">{w.pay_mode} · <span className="font-mono">{w.utr}</span><div>{date(w.paid_on)}</div></div>}{w.review_note && <div className="text-xs text-slate-500 mt-1">{w.review_note}</div>}</Td>
                <Td>
                  <div className="flex flex-col gap-1 items-start">
                    {w.status === 'requested' && <Button size="xs" variant="success" onClick={() => setModal({ action: 'approve', w })}>Approve</Button>}
                    {['requested', 'approved'].includes(w.status) && <><Button size="xs" onClick={() => setModal({ action: 'paid', w })}>Mark paid</Button><Button size="xs" variant="outline" onClick={() => setModal({ action: 'reject', w })}>Reject</Button></>}
                  </div>
                </Td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
      {modal && <PayModal {...modal} onClose={() => setModal(null)} onDone={() => { setModal(null); qc.invalidateQueries({ queryKey: ['admin'] }); }} />}
    </>
  );
}

function PayModal({ action, w, onClose, onDone }) {
  const [run, busy] = useAction();
  const [f, setF] = useState({ utr: '', mode: 'NEFT', paidOn: today(), note: '' });
  const s = (k) => ({ value: f[k], onChange: (e) => setF({ ...f, [k]: e.target.value }) });
  const title = { approve: 'Approve', paid: 'Record payment', reject: 'Reject' }[action];
  return (
    <Modal open title={`${title} · ${w.reference}`} onClose={onClose}
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button variant={action === 'reject' ? 'danger' : 'primary'} loading={busy} onClick={() => run(() => adminApi.put(`/admin/withdrawals/${w.id}`, { action, ...f }), { success: `${w.reference} ${action === 'paid' ? 'marked paid' : `${action}d`}` }).then((r) => r && onDone())}>Confirm</Button></>}>
      <div className="space-y-3 text-sm">
        <p className="text-slate-600">{w.partner_name} · pay <b>{inr(w.net_amount)}</b> to {w.bank_holder} ••{w.bank_last4} ({w.bank_ifsc})</p>
        {action === 'paid' && (
          <div className="grid sm:grid-cols-3 gap-3">
            <Field label="UTR / reference" required className="sm:col-span-3"><Input {...s('utr')} /></Field>
            <Field label="Mode"><Select {...s('mode')}>{['NEFT', 'RTGS', 'IMPS', 'UPI', 'Cheque'].map((m) => <option key={m}>{m}</option>)}</Select></Field>
            <Field label="Paid on" className="sm:col-span-2"><Input type="date" {...s('paidOn')} /></Field>
          </div>
        )}
        {action === 'reject' && <p className="text-slate-600">The amount goes back to the partner's available balance.</p>}
        <Field label={action === 'reject' ? 'Reason (shown to partner)' : 'Note'} required={action === 'reject'}><Input {...s('note')} /></Field>
      </div>
    </Modal>
  );
}
