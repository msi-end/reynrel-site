import { adminApi, partnerApi } from '../lib/api';
import { createAuth } from './AuthProvider';

export const AdminAuth = createAuth('admin', adminApi, '/auth/admin/me');
export const PartnerAuth = createAuth('partner', partnerApi, '/partner/me');
