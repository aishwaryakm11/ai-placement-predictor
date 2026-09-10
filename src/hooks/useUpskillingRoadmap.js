import { useMutation } from '@tanstack/react-query';
import { generateRoadmap } from '../services/roadmapService';

/**
 * React Query mutation hook for dynamic roadmap generation.
 * POST /api/roadmap
 */
export function useUpskillingRoadmap(options = {}) {
  return useMutation({
    mutationFn: (payload) => generateRoadmap(payload),
    ...options,
  });
}
