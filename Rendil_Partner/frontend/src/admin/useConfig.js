import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../lib/api';

export const useSettings = () => useQuery({ queryKey: ['admin', 'settings'], queryFn: () => adminApi.get('/admin/settings'), staleTime: 5 * 60_000 });
export const useProducts = () => useQuery({ queryKey: ['admin', 'products'], queryFn: () => adminApi.get('/admin/products') });
export const typeLabel = (settings, key) => settings?.partnerTypes?.find((t) => t.key === key)?.label || key;
