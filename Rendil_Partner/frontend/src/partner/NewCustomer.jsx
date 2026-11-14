import React, { useCallback, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { PartnerAuth } from '../auth';
import { partnerApi } from '../lib/api';
import { INDIAN_STATES } from '../lib/format';
import { Card, PageHeader, Field, Input, Select, Textarea, Button, Checkbox, Alert, Loading, useForm, useAction } from '../components/ui';
import OrderPicker from './OrderPicker';
import { useCatalogue } from './useCatalogue';

const BUSINESS_TYPES = ['Kirana / General store', 'Pharmacy', 'FMCG distributor', 'Wholesale', 'Garments & footwear', 'Electronics', 'Hardware', 'Restaurant / Café', 'Clinic', 'Manufacturing', 'Services', 'Other'];

export default function NewCustomer() {
  const { data: catalogue } = useCatalogue();
  const { user: me } = PartnerAuth.useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [run, busy] = useAction();
  const [order, setOrder] = useState({ productId: params.get('product') || '', planId: '', serviceIds: [] });
  const [install, setInstall] = useState({ request: me.permissions.requestInstallations, mode: 'remote', preferredDate: '', notes: '' });
  const { values: v, set, bind, errors, setErrors } = useForm({ businessName: '', contactName: '', mobile: '', email: '', gstin: '', businessType: '', address: '', city: '', state: me.address?.state || '', pincode: '', notes: '', consent: false });
  const onOrder = useCallback((o) => setOrder(o), []);
  if (!catalogue) return <Loading rows={8} />;
  if (!me.permissions.addCustomers) return <Alert tone="amber">Adding customers is not enabled for your account. Contact Reynrel.</Alert>;
  if (!catalogue.length) return <Alert tone="amber">No products are assigned to your account yet.</Alert>;
  const submit = (e) => {
    e.preventDefault();
    run(() => partnerApi.post('/partner/customers', { ...v, order: { ...order, installation: install.request ? install : undefined } }), { success: 'Customer submitted for approval', onFieldErrors: setErrors })
      .then((r) => { if (r) { qc.invalidateQueries({ queryKey: ['partner'] }); navigate(`/customers/${r.id}`); } });
  };
  return (
    <>
      <PageHeader title="Add customer" subtitle="Register the customer before they buy so the sale is credited to you"
        back={<Link to="/customers" className="text-sm text-slate-500 inline-flex items-center gap-1 mb-1"><ArrowLeft size={14} />Customers</Link>} />
      <form onSubmit={submit} className="grid lg:grid-cols-5 gap-6 items-start">
        <div className="lg:col-span-3 space-y-6">
          <Card title="Customer">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Business name" required error={errors.businessName} className="sm:col-span-2"><Input {...bind('businessName')} /></Field>
              <Field label="Contact person" required error={errors.contactName}><Input {...bind('contactName')} /></Field>
              <Field label="Mobile" required error={errors.mobile}><Input inputMode="numeric" maxLength={10} {...bind('mobile', (x) => x.replace(/\D/g, ''))} /></Field>
              <Field label="Email" error={errors.email}><Input type="email" {...bind('email')} /></Field>
              <Field label="GSTIN" error={errors.gstin}><Input maxLength={15} {...bind('gstin', (x) => x.toUpperCase().replace(/\s/g, ''))} /></Field>
              <Field label="Business type"><Select value={v.businessType} onChange={(e) => set('businessType', e.target.value)}><option value="">Select</option>{BUSINESS_TYPES.map((b) => <option key={b}>{b}</option>)}</Select></Field>
              <Field label="Address" className="sm:col-span-2"><Input {...bind('address')} /></Field>
              <Field label="City" required error={errors.city}><Input {...bind('city')} /></Field>
              <Field label="State" required error={errors.state}><Select value={v.state} error={errors.state} onChange={(e) => set('state', e.target.value)}><option value="">Select</option>{INDIAN_STATES.map((s) => <option key={s}>{s}</option>)}</Select></Field>
              <Field label="PIN code" error={errors.pincode}><Input maxLength={6} {...bind('pincode', (x) => x.replace(/\D/g, ''))} /></Field>
              <Field label="Notes for Reynrel" className="sm:col-span-2"><Textarea {...bind('notes')} placeholder="Current software, data to migrate, number of PCs…" /></Field>
            </div>
          </Card>
          {me.permissions.requestInstallations && (
            <Card title="Installation">
              <Checkbox checked={install.request} onChange={(e) => setInstall({ ...install, request: e.target.checked })} label="Request installation now" />
              {install.request && (
                <div className="grid sm:grid-cols-3 gap-4 mt-4">
                  <Field label="Mode"><Select value={install.mode} onChange={(e) => setInstall({ ...install, mode: e.target.value })}><option value="remote">Remote</option><option value="onsite">On-site</option></Select></Field>
                  <Field label="Preferred date"><Input type="date" value={install.preferredDate} onChange={(e) => setInstall({ ...install, preferredDate: e.target.value })} /></Field>
                  <Field label="Notes"><Input value={install.notes} onChange={(e) => setInstall({ ...install, notes: e.target.value })} placeholder="Printer model, PCs…" /></Field>
                </div>
              )}
            </Card>
          )}
        </div>
        <div className="lg:col-span-2 space-y-6 lg:sticky lg:top-6">
          <Card title="Order">
            <OrderPicker catalogue={catalogue} value={order} onChange={onOrder} errors={errors} />
          </Card>
          <Card>
            <Checkbox checked={v.consent} onChange={(e) => set('consent', e.target.checked)} label={<>The customer agreed to share these details with Reynrel for onboarding and installation.{errors.consent && <span className="block text-red-600">{errors.consent}</span>}</>} />
            <Button type="submit" loading={busy} className="w-full mt-4">Submit for approval</Button>
            <p className="text-xs text-slate-500 mt-3">Reynrel approves the order once payment is received; your commission is credited automatically.</p>
          </Card>
        </div>
      </form>
    </>
  );
}
