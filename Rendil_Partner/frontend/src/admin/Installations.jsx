import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi, qs } from '../lib/api';
import { date, dateTime } from '../lib/format';
import { Card, PageHeader, Pills, Table, Td, Badge, Empty, Loading, Button, Modal, Field, Input, Select, Textarea, useAction } from '../components/ui';

export default function Installations() {
  const [status, setStatus] = useState('open');
  const [edit, setEdit] = useState(null);
  const { data } = useQuery({ queryKey: ['admin', 'installations', status], queryFn: () => adminApi.get(`/admin/installations${qs({ status })}`) });
  const qc = useQueryClient();
  return (
    <>
      <PageHeader title="Installations" subtitle="Requests raised by partners for their customers" />
      <Card padded={false}>
        <div className="p-4 border-b border-slate-100"><Pills value={status} onChange={setStatus} options={[['open', 'Open'], ['requested', 'New'], ['scheduled', 'Scheduled'], ['in_progress', 'In progress'], ['completed', 'Completed'], ['cancelled', 'Cancelled'], ['', 'All']]} /></div>
        {!data ? <div className="p-4"><Loading /></div> : (
          <Table head={['Customer', 'Product · order', 'Partner', 'Requested', 'Schedule', 'Status', '']} empty={data.length === 0 && <Empty title="No installations here" />}>
            {data.map((i) => (
              <tr key={i.id}>
                <Td><div className="font-medium">{i.business_name}</div><div className="text-xs text-slate-500">{i.contact_name} · {i.mobile} · {i.city}</div>{i.partner_notes && <div className="text-xs text-slate-600 mt-1 max-w-xs">“{i.partner_notes}”</div>}</Td>
                <Td>{i.product_name}<div className="text-xs font-mono text-slate-500">{i.reference}</div></Td>
                <Td><Link to={`/admin/partners/${i.partner_id}`} className="text-brand-600">{i.partner_name}</Link></Td>
                <Td className="text-xs whitespace-nowrap">{dateTime(i.created_at)}<div className="text-slate-500">{i.mode} · pref. {date(i.preferred_date)}</div></Td>
                <Td className="text-xs">{i.scheduled_for ? dateTime(i.scheduled_for) : '—'}{i.engineer && <div className="text-slate-500">{i.engineer}</div>}</Td>
                <Td><Badge status={i.status} /></Td>
                <Td><Button size="xs" variant="outline" onClick={() => setEdit(i)}>Update</Button></Td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
      {edit && <InstallForm i={edit} onClose={() => setEdit(null)} onDone={() => { setEdit(null); qc.invalidateQueries({ queryKey: ['admin'] }); }} />}
    </>
  );
}

function InstallForm({ i, onClose, onDone }) {
  const [run, busy] = useAction();
  const [f, setF] = useState({ status: i.status === 'requested' ? 'scheduled' : i.status, scheduledFor: i.scheduled_for || '', engineer: i.engineer || '', adminNotes: i.admin_notes || '' });
  const s = (k) => ({ value: f[k], onChange: (e) => setF({ ...f, [k]: e.target.value }) });
  return (
    <Modal open title={`Installation · ${i.business_name}`} onClose={onClose}
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button loading={busy} onClick={() => run(() => adminApi.put(`/admin/installations/${i.id}`, f), { success: 'Installation updated' }).then((r) => r && onDone())}>Save</Button></>}>
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Status"><Select {...s('status')}>{['requested', 'scheduled', 'in_progress', 'completed', 'cancelled'].map((x) => <option key={x} value={x}>{x.replace('_', ' ')}</option>)}</Select></Field>
        <Field label="Scheduled for"><Input type="datetime-local" {...s('scheduledFor')} /></Field>
        <Field label="Engineer" className="sm:col-span-2"><Input {...s('engineer')} /></Field>
        <Field label="Notes (visible to partner)" className="sm:col-span-2"><Textarea {...s('adminNotes')} /></Field>
      </div>
    </Modal>
  );
}
