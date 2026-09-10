import apiClient from './api';
import { MOCK_ROADMAP_RESPONSE } from '../utils/mockData';

/**
 * Request dynamic, phased upskilling roadmap per Section 5 / Part C.
 * POST /api/roadmap
 */
export async function generateRoadmap(payload) {
  try {
    const response = await apiClient.post('/api/roadmap', payload);
    return response.data;
  } catch (error) {
    console.warn('Backend /api/roadmap unavailable, using fallback roadmap:', error.normalizedMessage);
    const targetRole = payload?.target_role || 'Full-Stack Developer';
    return {
      ...MOCK_ROADMAP_RESPONSE,
      target_role: targetRole,
    };
  }
}
