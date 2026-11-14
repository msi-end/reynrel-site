import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, Package } from 'lucide-react';
import { adminApi } from '../lib/api';
import { inr, pct } from '../lib/format';
import { Card, PageHeader, Table, Td, Badge, Empty, Loading, Button, Modal, Field, Input, useAction } from '../components/ui';
import { useProducts } from './useConfig';

export default function Products() {
  const { data } = useProducts();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [run, busy] = useAction();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const create = () => run(() => adminApi.post('/admin/products', { name, status: 'draft' }), { success: 'Product created' }).then((r) => {
    if (!r) return;
    qc.invalidateQueries({ queryKey: ['admin', 'products'] });
    navigate(`/admin/products/${r.id}`);
  });
  return (
    <>
      <PageHeader title="Products & pricing" subtitle="Software products, plans, services, features and default commission"
        actions={<Button icon={Plus} onClick={() => setOpen(true)}>New product</Button>} />
      <Card padded={false}>
        {!data ? <div className="p-4"><Loading /></div> : (
          <Table head={['Product', 'Status', 'Plans', 'From', 'Default commission', 'Partners', 'Approved orders']}
            empty={data.length === 0 && <Empty icon={Package} title="No products yet" action={<Button icon={Plus} onClick={() => setOpen(true)}>New product</Button>} />}>
            {data.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50">
                <Td><Link to={`/admin/products/${p.id}`} className="font-medium text-slate-900 hover:text-brand-600">{p.name}</Link><div className="text-xs text-slate-500">{p.category || '—'} · /{p.slug}</div></Td>
                <Td><Badge status={p.status} /></Td>
                <Td className="tabular">{p.plan_count}<span className="text-xs text-slate-500"> · {p.service_count} services · {p.feature_count} features</span></Td>
                <Td className="tabular">{p.from_price !== null ? inr(p.from_price) : '—'}</Td>
                <Td className="tabular">{pct(p.default_commission_pct)} <span className="text-xs text-slate-500">/ {pct(p.renewal_commission_pct)} renewal</span></Td>
                <Td className="tabular">{p.partner_count}</Td>
                <Td className="tabular">{p.approved_orders}</Td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
      <Modal open={open} title="New product" size="sm" onClose={() => setOpen(false)}
        footer={<><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button loading={busy} disabled={!name.trim()} onClick={create}>Create</Button></>}>
        <Field label="Product name" hint="Starts as a draft (hidden from partners) until you set it Active."><Input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && name.trim() && create()} /></Field>
      </Modal>
    </>
  );
}
