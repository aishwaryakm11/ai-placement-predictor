import React from 'react';
import { AlertTriangle, XCircle, RefreshCw } from 'lucide-react';

export default function ErrorBanner({ message, onRetry, onDismiss }) {
  if (!message) return null;

  return (
    <div className="bg-rose-950/40 border border-status-red/40 rounded-xl p-4 text-rose-200 flex items-start gap-3 shadow-cyber-red/20 mb-4 animate-in fade-in slide-in-from-top-2">
      <AlertTriangle className="w-5 h-5 text-status-red flex-shrink-0 mt-0.5" />
      <div className="flex-1 text-sm">
        <h4 className="font-semibold text-rose-300">Service Alert</h4>
        <p className="mt-0.5 text-rose-200/90 text-xs leading-relaxed">{message}</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-1.5 px-3 py-1 bg-status-red/20 hover:bg-status-red/30 border border-status-red/50 text-rose-200 rounded-lg text-xs font-medium transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        )}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="p-1 text-rose-400 hover:text-white rounded transition-colors"
            title="Dismiss"
          >
            <XCircle className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
