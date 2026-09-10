import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ label = 'Computing ML predictions...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 gap-3 text-center">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-2 border-brand/20 border-t-cyan-400 animate-spin" />
        <Loader2 className="w-6 h-6 text-brand absolute inset-0 m-auto animate-pulse" />
      </div>
      <p className="text-sm font-medium text-slate-300 tracking-wide">{label}</p>
      <p className="text-xs text-slate-500 font-mono">Evaluating multidimensional employability parameters</p>
    </div>
  );
}
