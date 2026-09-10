import React from 'react';
import { getReadinessStatus } from '../../utils/readiness';
import { ShieldCheck, AlertCircle, AlertTriangle } from 'lucide-react';

export default function StatusBadge({ status, probability, size = 'md' }) {
  // If probability is provided, derive status dynamically
  const readiness = probability !== undefined ? getReadinessStatus(probability) : null;
  const currentStatus = readiness ? readiness.status : status;

  let badgeClass = 'bg-rose-500/15 text-rose-400 border-rose-500/30';
  let Icon = AlertTriangle;
  let text = currentStatus || 'Needs Training';

  if (currentStatus === 'Ready') {
    badgeClass = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    Icon = ShieldCheck;
  } else if (currentStatus === 'Near-Ready') {
    badgeClass = 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    Icon = AlertCircle;
  }

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${badgeClass} ${sizeClasses[size] || sizeClasses.md}`}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
      <span>{text}</span>
    </span>
  );
}
