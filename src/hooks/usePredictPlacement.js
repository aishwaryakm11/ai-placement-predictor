import { useMutation } from '@tanstack/react-query';
import { predictPlacement } from '../services/predictionService';

/**
 * React Query mutation hook for placement prediction.
 * As specified in Section 5 / Part C: "Use react-query's useMutation for POST calls"
 */
export function usePredictPlacement(options = {}) {
  return useMutation({
    mutationFn: (profileData) => predictPlacement(profileData),
    ...options,
  });
}
