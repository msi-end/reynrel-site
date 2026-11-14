import { useQuery } from '@tanstack/react-query';
import { partnerApi } from '../lib/api';

export const useCatalogue = () => useQuery({ queryKey: ['partner', 'products'], queryFn: () => partnerApi.get('/partner/products'), staleTime: 60_000 });
