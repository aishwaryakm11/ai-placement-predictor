import { useQuery } from '@tanstack/react-query';
import { getTpoAnalytics } from '../services/tpoService';

/**
 * React Query hook for TPO Institutional Analytics.
 * As specified in Section 5 / Part C: "Use useQuery for GET calls"
 */
export function useTpoAnalytics(options = {}) {
  return useQuery({
    queryKey: ['tpoAnalytics'],
    queryFn: getTpoAnalytics,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    refetchOnWindowFocus: false,
    ...options,
  });
}
