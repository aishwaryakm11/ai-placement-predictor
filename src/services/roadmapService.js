import apiClient from './api';
import { MOCK_ROADMAP_RESPONSE } from '../utils/mockData';

/**
 * Request dynamic, phased upskilling roadmap per Section 5 / Part C.
 * POST /api/roadmap
 */
export async function generateRoadmap(payload) {
  try {
    const requestBody = {
      student_id: payload.student_id || payload.id || 'STU-2026-001',
      known_skills: Array.isArray(payload.known_skills)
        ? payload.known_skills
        : Array.isArray(payload.current_skills)
        ? payload.current_skills
        : ['React', 'JavaScript', 'Python'],
      target_role: payload.target_role || 'Full-Stack Developer',
    };

    const response = await apiClient.post('/api/roadmap', requestBody);
    const raw = response.data;
    const data = raw && raw.data !== undefined ? raw.data : raw;

    // Normalize phases whether array of RoadmapPhase or phases
    const rawPhases = data.roadmap || data.phases || [];
    const normalizedPhases = rawPhases.map((p, idx) => ({
      phase_number: idx + 1,
      phase: p.phase || `Phase ${idx + 1}`,
      title: p.phase || p.title || `Phase ${idx + 1}: Targeted Skills`,
      estimated_weeks: Number(p.estimated_weeks) || 3,
      skills: Array.isArray(p.skills) ? p.skills : [],
      recommended_action: typeof p.recommended_action === 'string' ? p.recommended_action : '',
      recommended_actions: Array.isArray(p.recommended_actions)
        ? p.recommended_actions
        : p.recommended_action
        ? [p.recommended_action]
        : ['Complete curated placement preparation exercises'],
    }));

    const totalWeeks = normalizedPhases.reduce((acc, p) => acc + (p.estimated_weeks || 0), 0) || 10;

    return {
      target_role: requestBody.target_role,
      total_estimated_weeks: totalWeeks,
      missing_skills: data.missing_skills || [],
      phases: normalizedPhases,
      roadmap: normalizedPhases,
    };
  } catch (error) {
    console.warn('Backend /api/roadmap unavailable, using fallback roadmap:', error.normalizedMessage || error.message);
    const targetRole = payload?.target_role || 'Full-Stack Developer';
    return {
      ...MOCK_ROADMAP_RESPONSE,
      target_role: targetRole,
    };
  }
}
