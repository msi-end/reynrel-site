import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Plus, Pencil, Trash2, ArrowUp, ArrowDown, Upload, ImageOff } from 'lucide-react';
import { adminApi } from '../lib/api';
import { inr, pct, labelize } from '../lib/format';
import { Card, PageHeader, Tabs, Badge, Button, Field, Input, Select, Textarea, Table, Td, Empty, Loading, Modal, Alert, Toggle, Checkbox, useForm, useAction } from '../components/ui';

export default function ProductEdit() {
  const { id } = useParams();
  const [tab, setTab] = useState('details');
  const key = ['admin', 'product', id];
  const qc = useQueryClient();
  const { data: p } = useQuery({ queryKey: key, queryFn: () => adminApi.get(`/admin/products/${id}`) });
  // Mutations return the full product; write it straight into the cache (no refetch flash).
  const apply = (next) => { if (next) { qc.setQueryData(key, next); qc.invalidateQueries({ queryKey: ['admin', 'products'] }); } return next; };
  if (!p) return <Loading rows={8} />;
  return (
    <>
      <PageHeader
        back={<Link to="/admin/products" className="text-sm text-slate-500 inline-flex items-center gap-1 mb-1"><ArrowLeft size={14} />Products</Link>}
        title={<span className="flex items-center gap-2">{p.name} <Badge status={p.status} /></span>}
        subtitle={`${p.category || 'Uncategorised'} · ${p.usage.orders} orders · ${inr(p.usage.sales)} approved sales`}
      />
      <Tabs value={tab} onChange={setTab} tabs={[
        ['details', 'Details & commission'], ['plans', 'Plans & prices', p.plans.length], ['services', 'Services', p.services.length],
        ['features', 'Features', p.features.length], ['media', 'Screenshots', p.media.length], ['partners', 'Partner rates', p.partners.length]
      ]} />
      <div key={tab} className="rp-fade">
        {tab === 'details' && <Details p={p} apply={apply} />}
        {tab === 'plans' && <Plans p={p} apply={apply} />}
        {tab === 'services' && <Services p={p} apply={apply} />}
        {tab === 'features' && <Features p={p} apply={apply} />}
        {tab === 'media' && <Media p={p} apply={apply} />}
        {tab === 'partners' && <PartnerRates p={p} />}
      </div>
    </>
  );
}

function Details({ p, apply }) {
  const [run, busy] = useAction();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { values: v, set, bind, setErrors } = useForm({
    name: p.name, slug: p.slug, category: p.category || '', tagline: p.tagline || '', description: p.description || '', icon: p.icon || 'Package',
    websiteUrl: p.website_url || '', status: p.status, sortOrder: p.sort_order, defaultCommissionPct: p.default_commission_pct, renewalCommissionPct: p.renewal_commission_pct
  });
  const save = (e) => { e.preventDefault(); run(() => adminApi.put(`/admin/products/${p.id}`, v), { success: 'Product saved', onFieldErrors: setErrors }).then(apply); };
  const remove = () => {
    if (!window.confirm(`Delete ${p.name}? This removes its plans, services, features and partner assignments.`)) return;
    run(() => adminApi.del(`/admin/products/${p.id}`), { success: 'Product deleted' }).then((r) => {
      if (r === undefined) return;
      qc.invalidateQueries({ queryKey: ['admin', 'products'] });
      navigate('/admin/products');
    });
  };
  return (
    <form onSubmit={save} className="grid lg:grid-cols-3 gap-6 items-start">
      <Card title="Product details" className="lg:col-span-2">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Name" required error={bind('name').error}><Input {...bind('name')} /></Field>
          <Field label="Slug" error={bind('slug').error} hint="Used in links, e.g. reynrel.in/products/{slug}"><Input {...bind('slug')} /></Field>
          <Field label="Category"><Input {...bind('category')} /></Field>
          <Field label="Website page"><Input placeholder="https://reynrel.in/products/…" {...bind('websiteUrl')} /></Field>
          <Field label="Tagline" className="sm:col-span-2"><Input {...bind('tagline')} /></Field>
          <Field label="Description" className="sm:col-span-2"><Textarea rows={6} {...bind('description')} /></Field>
        </div>
      </Card>
      <div className="space-y-6">
        <Card title="Visibility & commission">
          <div className="space-y-4">
            <Field label="Status" hint="Only Active products are visible to partners">
              <Select value={v.status} onChange={(e) => set('status', e.target.value)}><option value="active">Active</option><option value="draft">Draft</option><option value="archived">Archived</option></Select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Default commission %"><Input type="number" min={0} max={100} step="0.01" {...bind('defaultCommissionPct')} /></Field>
              <Field label="Renewal %"><Input type="number" min={0} max={100} step="0.01" {...bind('renewalCommissionPct')} /></Field>
            </div>
            <p className="text-xs text-slate-500">Applies to every partner without their own rate. Set partner-specific rates on the partner's page.</p>
            <Field label="Sort order"><Input type="number" {...bind('sortOrder')} /></Field>
            <Button type="submit" loading={busy} className="w-full">Save</Button>
          </div>
        </Card>
        <Card title="Danger zone">
          <p className="text-sm text-slate-600 mb-3">Products with customer orders can't be deleted — archive them instead.</p>
          <Button variant="danger-ghost" icon={Trash2} onClick={remove}>Delete product</Button>
        </Card>
      </div>
    </form>
  );
}

const CYCLES = [['yearly', 'Yearly'], ['monthly', 'Monthly'], ['quarterly', 'Quarterly'], ['one_time', 'One-time']];
function Plans({ p, apply }) {
  const [edit, setEdit] = useState(null);
  const [run, busy] = useAction();
  const remove = (pl) => window.confirm(`Remove plan ${pl.name}? Plans with orders are deactivated instead.`) && run(() => adminApi.del(`/admin/products/${p.id}/plans/${pl.id}`), { success: 'Plan removed' }).then(apply);
  return (
    <Card padded={false} title="Plans" subtitle="List prices excl. GST. Partners can be given special prices on their page." action={<Button size="sm" icon={Plus} onClick={() => setEdit({})}>Add plan</Button>}>
      <Table head={['Plan', 'Billing', 'List price', 'Renewal', 'Min. partner price', 'Status', '']} empty={p.plans.length === 0 && <Empty title="No plans yet" action={<Button size="sm" icon={Plus} onClick={() => setEdit({})}>Add plan</Button>} />}>
        {p.plans.map((pl) => (
          <tr key={pl.id}>
            <Td><div className="font-medium">{pl.name}</div><div className="text-xs text-slate-500 max-w-xs">{pl.description}</div>{pl.inclusions.length > 0 && <div className="text-xs text-slate-400">{pl.inclusions.length} inclusions</div>}</Td>
            <Td>{labelize(pl.billing_cycle)}</Td>
            <Td className="tabular font-medium">{inr(pl.price)}</Td>
            <Td className="tabular">{pl.renewal_price !== null ? inr(pl.renewal_price) : '—'}</Td>
            <Td className="tabular">{pl.min_partner_price !== null ? inr(pl.min_partner_price) : '—'}</Td>
            <Td><Badge status={pl.active ? 'active' : 'archived'}>{pl.active ? 'Active' : 'Inactive'}</Badge></Td>
            <Td className="whitespace-nowrap text-right"><Button size="xs" variant="ghost" icon={Pencil} onClick={() => setEdit(pl)}>Edit</Button><Button size="xs" variant="danger-ghost" icon={Trash2} loading={busy} onClick={() => remove(pl)} /></Td>
          </tr>
        ))}
      </Table>
      {edit && <PlanForm p={p} plan={edit} onClose={() => setEdit(null)} apply={apply} />}
    </Card>
  );
}
function PlanForm({ p, plan, onClose, apply }) {
  const [run, busy] = useAction();
  const { values: v, set, bind, setErrors } = useForm({
    name: plan.name || '', billingCycle: plan.billing_cycle || 'yearly', price: plan.price ?? '', renewalPrice: plan.renewal_price ?? '', minPartnerPrice: plan.min_partner_price ?? '',
    description: plan.description || '', inclusions: (plan.inclusions || []).join('\n'), active: plan.active === undefined ? true : !!plan.active, sortOrder: plan.sort_order ?? 0
  });
  const save = () => run(() => (plan.id ? adminApi.put(`/admin/products/${p.id}/plans/${plan.id}`, v) : adminApi.post(`/admin/products/${p.id}/plans`, v)), { success: 'Plan saved', onFieldErrors: setErrors }).then((r) => r && (apply(r), onClose()));
  return (
    <Modal open title={plan.id ? `Edit ${plan.name}` : 'Add plan'} size="lg" onClose={onClose} footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button loading={busy} onClick={save}>Save plan</Button></>}>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Plan name" required error={bind('name').error}><Input {...bind('name')} /></Field>
        <Field label="Billing"><Select value={v.billingCycle} onChange={(e) => set('billingCycle', e.target.value)}>{CYCLES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</Select></Field>
        <Field label="List price (₹)" required error={bind('price').error}><Input type="number" min={0} {...bind('price')} /></Field>
        <Field label="Renewal price (₹)" hint="Blank = same as list"><Input type="number" min={0} {...bind('renewalPrice')} /></Field>
        <Field label="Minimum partner price (₹)" hint="Lowest negotiated price allowed"><Input type="number" min={0} {...bind('minPartnerPrice')} /></Field>
        <Field label="Sort order"><Input type="number" {...bind('sortOrder')} /></Field>
        <Field label="Short description" className="sm:col-span-2"><Input {...bind('description')} /></Field>
        <Field label="What's included (one per line)" className="sm:col-span-2"><Textarea rows={5} {...bind('inclusions')} /></Field>
        <Checkbox checked={v.active} onChange={(e) => set('active', e.target.checked)} label="Active (available to partners)" />
      </div>
    </Modal>
  );
}

function Services({ p, apply }) {
  const [edit, setEdit] = useState(null);
  const [run] = useAction();
  return (
    <Card padded={false} title="Services" subtitle="Add-ons sold with the product: installation, training, data migration, extra counters…" action={<Button size="sm" icon={Plus} onClick={() => setEdit({})}>Add service</Button>}>
      <Table head={['Service', 'Price', 'Commission', 'Status', '']} empty={p.services.length === 0 && <Empty title="No services yet" />}>
        {p.services.map((s) => (
          <tr key={s.id}>
            <Td><div className="font-medium">{s.name}</div><div className="text-xs text-slate-500 max-w-md">{s.description}</div></Td>
            <Td className="tabular">{Number(s.price) ? inr(s.price) : 'Included'}</Td>
            <Td>{s.commission_pct !== null ? pct(s.commission_pct) : <span className="text-slate-500 text-xs">same as plan</span>}</Td>
            <Td><Badge status={s.active ? 'active' : 'archived'}>{s.active ? 'Active' : 'Inactive'}</Badge></Td>
            <Td className="whitespace-nowrap text-right"><Button size="xs" variant="ghost" icon={Pencil} onClick={() => setEdit(s)}>Edit</Button><Button size="xs" variant="danger-ghost" icon={Trash2} onClick={() => window.confirm(`Remove ${s.name}?`) && run(() => adminApi.del(`/admin/products/${p.id}/services/${s.id}`), { success: 'Removed' }).then(apply)} /></Td>
          </tr>
        ))}
      </Table>
      {edit && <ServiceForm p={p} s={edit} onClose={() => setEdit(null)} apply={apply} />}
    </Card>
  );
}
function ServiceForm({ p, s, onClose, apply }) {
  const [run, busy] = useAction();
  const { values: v, set, bind, setErrors } = useForm({ name: s.name || '', description: s.description || '', price: s.price ?? 0, commissionPct: s.commission_pct ?? '', active: s.active === undefined ? true : !!s.active, sortOrder: s.sort_order ?? 0 });
  const save = () => run(() => (s.id ? adminApi.put(`/admin/products/${p.id}/services/${s.id}`, v) : adminApi.post(`/admin/products/${p.id}/services`, v)), { success: 'Service saved', onFieldErrors: setErrors }).then((r) => r && (apply(r), onClose()));
  return (
    <Modal open title={s.id ? `Edit ${s.name}` : 'Add service'} onClose={onClose} footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button loading={busy} onClick={save}>Save</Button></>}>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Service name" required error={bind('name').error} className="sm:col-span-2"><Input {...bind('name')} /></Field>
        <Field label="Price (₹)" hint="0 = included"><Input type="number" min={0} {...bind('price')} /></Field>
        <Field label="Commission %" hint="Blank = same rate as the plan"><Input type="number" min={0} max={100} {...bind('commissionPct')} /></Field>
        <Field label="Description" className="sm:col-span-2"><Textarea {...bind('description')} /></Field>
        <Checkbox checked={v.active} onChange={(e) => set('active', e.target.checked)} label="Active" />
      </div>
    </Modal>
  );
}

function Features({ p, apply }) {
  const [items, setItems] = useState(() => p.features.map((f) => ({ group: f.group_name || '', title: f.title, description: f.description || '' })));
  const [run, busy] = useAction();
  useEffect(() => { setItems(p.features.map((f) => ({ group: f.group_name || '', title: f.title, description: f.description || '' }))); }, [p.features]);
  const upd = (i, patch) => setItems((s) => s.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const move = (i, d) => setItems((s) => { const n = [...s]; const [x] = n.splice(i, 1); n.splice(i + d, 0, x); return n; });
  return (
    <Card title="Features" subtitle="Shown to partners in their product catalogue. Group them (e.g. Billing, Inventory, Reports)."
      action={<Button size="sm" loading={busy} onClick={() => run(() => adminApi.put(`/admin/products/${p.id}/features`, { items }), { success: 'Features saved' }).then(apply)}>Save features</Button>}>
      <div className="space-y-2">
        {items.map((f, i) => (
          <div key={i} className="grid grid-cols-12 gap-2 items-start">
            <Input className="col-span-12 sm:col-span-2" placeholder="Group" value={f.group} onChange={(e) => upd(i, { group: e.target.value })} />
            <Input className="col-span-12 sm:col-span-3" placeholder="Feature" value={f.title} onChange={(e) => upd(i, { title: e.target.value })} />
            <Input className="col-span-9 sm:col-span-5" placeholder="Description" value={f.description} onChange={(e) => upd(i, { description: e.target.value })} />
            <div className="col-span-3 sm:col-span-2 flex justify-end">
              <Button size="xs" variant="ghost" icon={ArrowUp} disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move up" />
              <Button size="xs" variant="ghost" icon={ArrowDown} disabled={i === items.length - 1} onClick={() => move(i, 1)} aria-label="Move down" />
              <Button size="xs" variant="danger-ghost" icon={Trash2} onClick={() => setItems((s) => s.filter((_, j) => j !== i))} aria-label="Remove" />
            </div>
          </div>
        ))}
        {items.length === 0 && <Empty title="No features yet" />}
        <Button size="sm" variant="outline" icon={Plus} onClick={() => setItems((s) => [...s, { group: s[s.length - 1]?.group || '', title: '', description: '' }])}>Add feature</Button>
      </div>
    </Card>
  );
}

function Media({ p, apply }) {
  const [run, busy] = useAction();
  const [f, setF] = useState({ files: null, url: '', caption: '', device: 'desktop' });
  const upload = () => {
    const fd = new FormData();
    Array.from(f.files || []).forEach((x) => fd.append('images', x));
    fd.append('url', f.url);
    fd.append('caption', f.caption);
    fd.append('device', f.device);
    run(() => adminApi.post(`/admin/products/${p.id}/media`, fd), { success: 'Screenshot added' }).then((r) => { if (r) { apply(r); setF({ files: null, url: '', caption: '', device: f.device }); } });
  };
  return (
    <div className="space-y-6">
      <Card title="Add screenshots">
        <div className="grid sm:grid-cols-4 gap-3 items-end">
          <Field label="Image files (JPG/PNG/WEBP, 4 MB each)" className="sm:col-span-2"><input key={busy ? 'b' : 'a'} type="file" multiple accept=".jpg,.jpeg,.png,.webp" className="block w-full text-sm" onChange={(e) => setF({ ...f, files: e.target.files })} /></Field>
          <Field label="…or image URL"><Input placeholder="https://" value={f.url} onChange={(e) => setF({ ...f, url: e.target.value })} /></Field>
          <Field label="View"><Select value={f.device} onChange={(e) => setF({ ...f, device: e.target.value })}><option value="desktop">Desktop</option><option value="mobile">Mobile</option></Select></Field>
          <Field label="Caption" className="sm:col-span-3"><Input value={f.caption} onChange={(e) => setF({ ...f, caption: e.target.value })} /></Field>
          <Button icon={Upload} loading={busy} disabled={!f.files?.length && !f.url} onClick={upload}>Add</Button>
        </div>
      </Card>
      {p.media.length === 0 ? <Card><Empty icon={ImageOff} title="No screenshots yet" /></Card> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {p.media.map((m) => (
            <figure key={m.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className={m.device === 'mobile' ? 'bg-slate-100 flex justify-center p-3' : 'bg-slate-100'}>
                <img src={m.url} alt={m.caption || p.name} loading="lazy" className={m.device === 'mobile' ? 'h-64 rounded-lg object-cover' : 'w-full aspect-video object-cover object-top'} />
              </div>
              <figcaption className="p-3 flex items-center justify-between gap-2 text-sm">
                <span className="truncate">{m.caption || '—'} <Badge tone="gray">{m.device}</Badge></span>
                <Button size="xs" variant="danger-ghost" icon={Trash2} onClick={() => run(() => adminApi.del(`/admin/products/${p.id}/media/${m.id}`), { success: 'Removed' }).then(apply)} aria-label="Remove" />
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}

function PartnerRates({ p }) {
  return (
    <div className="space-y-6">
      <Alert tone="blue">Default for this product: {pct(p.default_commission_pct)} new sale, {pct(p.renewal_commission_pct)} renewal. Change a partner's rate or price on their page.</Alert>
      <Card title="Partners with access" padded={false}>
        <Table head={['Partner', 'Status', 'Can sell', 'Commission override', 'Renewal override']} empty={p.partners.length === 0 && <Empty title="No partners assigned" />}>
          {p.partners.map((x) => (
            <tr key={x.partner_id}>
              <Td><Link to={`/admin/partners/${x.partner_id}`} className="font-medium hover:text-brand-600">{x.full_name}</Link><div className="text-xs text-slate-500 font-mono">{x.code}</div></Td>
              <Td><Badge status={x.status} /></Td><Td>{x.enabled ? 'Yes' : 'No'}</Td>
              <Td>{x.commission_pct !== null ? pct(x.commission_pct) : <span className="text-slate-400">—</span>}</Td><Td>{x.renewal_pct !== null ? pct(x.renewal_pct) : <span className="text-slate-400">—</span>}</Td>
            </tr>
          ))}
        </Table>
      </Card>
      <Card title="Negotiated prices on this product" padded={false}>
        <Table head={['Partner', 'Item', 'Special price', 'Valid until']} empty={p.negotiatedPrices.length === 0 && <Empty title="None" />}>
          {p.negotiatedPrices.map((x) => {
            const item = p.plans.find((pl) => pl.id === x.plan_id) || p.services.find((s) => s.id === x.service_id);
            return <tr key={x.id}><Td>{x.full_name} <span className="text-xs font-mono text-slate-500">{x.code}</span></Td><Td>{item?.name}</Td><Td className="tabular">{inr(x.price)} <span className="text-xs text-slate-500">list {inr(item?.price)}</span></Td><Td>{x.valid_until || 'No expiry'}</Td></tr>;
          })}
        </Table>
      </Card>
    </div>
  );
}
