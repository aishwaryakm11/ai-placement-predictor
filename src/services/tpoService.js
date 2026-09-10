import apiClient from './api';
import { MOCK_TPO_ANALYTICS_RESPONSE } from '../utils/mockData';

/**
 * Fetch institutional analytics for TPO dashboard per Section 5 / Part C.
 * GET /api/tpo/analytics
 */
export async function getTpoAnalytics() {
  try {
    const response = await apiClient.get('/api/tpo/analytics');
    return response.data;
  } catch (error) {
    console.warn('Backend /api/tpo/analytics unavailable, using fallback mock analytics:', error.normalizedMessage);
    return MOCK_TPO_ANALYTICS_RESPONSE;
  }
}
