/**
 * Shared readiness utility function as mandated by specification.
 * Consistent red/amber/green status coloring driven by this single function.
 * Thresholds:
 * - >= 80%: "Ready" (Status Green #16a34a)
 * - 60% - 79%: "Near-Ready" (Status Amber #d97706)
 * - < 60%: "Needs Training" (Status Red #dc2626)
 */

export const READINESS_STATUSES = {
  READY: 'Ready',
  NEAR_READY: 'Near-Ready',
  NEEDS_TRAINING: 'Needs Training',
};

export function getReadinessStatus(probability) {
  const prob = Number(probability) || 0;
  if (prob >= 80) {
    return {
      status: READINESS_STATUSES.READY,
      label: 'Ready for Placement',
      color: '#16a34a',
      bgClass: 'bg-status-green/10 text-emerald-400 border-status-green/30',
      badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      barColor: '#16a34a',
      gradient: 'from-emerald-500 to-teal-400',
      description: 'Profile strongly aligned with market benchmarks and recruiter expectations.',
      ringColor: '#16a34a',
    };
  }
  if (prob >= 60) {
    return {
      status: READINESS_STATUSES.NEAR_READY,
      label: 'Near-Ready',
      color: '#d97706',
      bgClass: 'bg-status-amber/10 text-amber-400 border-status-amber/30',
      badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      barColor: '#d97706',
      gradient: 'from-amber-500 to-orange-400',
      description: 'Solid foundation, but minor skill deficits in target tech stack need closure.',
      ringColor: '#d97706',
    };
  }
  return {
    status: READINESS_STATUSES.NEEDS_TRAINING,
    label: 'Needs Training',
    color: '#dc2626',
    bgClass: 'bg-status-red/10 text-rose-400 border-status-red/30',
    badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    barColor: '#dc2626',
    gradient: 'from-rose-500 to-red-600',
    description: 'Requires targeted institutional bootcamp intervention to clear placement cutoffs.',
    ringColor: '#dc2626',
  };
}
