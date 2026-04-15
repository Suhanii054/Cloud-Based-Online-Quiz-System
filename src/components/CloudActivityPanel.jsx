import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

/**
 * CloudActivityPanel
 *
 * Reusable animated cloud-activity log panel.
 *
 * Props:
 *   logs — array of { message: string, status: "pending"|"success"|"error", timestamp: string }
 *          Each entry is revealed one-by-one with a 400ms stagger so the UI looks
 *          like live cloud operations are streaming in.
 */
const CloudActivityPanel = ({ logs = [] }) => {
  // How many log entries are currently visible
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    // Nothing to show — reset after a tick so the state update is inside a callback
    if (logs.length === 0) {
      const t = setTimeout(() => setVisibleCount(0), 0);
      return () => clearTimeout(t);
    }

    // All logs are already visible — nothing to do
    if (visibleCount >= logs.length) return;

    // Reveal one more entry after 400ms (staggered animation)
    const t = setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + 1, logs.length));
    }, 400);

    return () => clearTimeout(t);
  }, [logs.length, visibleCount]);

  const visibleLogs = logs.slice(0, visibleCount);

  return (
    <div className="bg-surface border border-primary/20 rounded-2xl shadow-neon-card p-4 w-full">
      {/* Panel header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-textMain">☁️ Cloud Activity</h3>

        {/* Pulsing "Live" indicator */}
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
          </span>
          <span className="text-xs text-success font-medium">Live</span>
        </div>
      </div>

      {/* Log entries */}
      <div className="space-y-2 min-h-[60px]">
        {visibleLogs.length === 0 && (
          <p className="text-xs text-textMuted italic">Waiting for activity…</p>
        )}

        {visibleLogs.map((log, idx) => (
          <div
            key={idx}
            className="flex items-start gap-2 animate-fadeIn"
          >
            {/* Status icon */}
            <div className="mt-0.5 flex-shrink-0">
              {log.status === 'pending' && (
                <Loader2 size={13} className="text-secondary animate-spin" />
              )}
              {log.status === 'success' && (
                <CheckCircle2 size={13} className="text-success" />
              )}
              {log.status === 'error' && (
                <XCircle size={13} className="text-danger" />
              )}
            </div>

            {/* Message */}
            <div className="flex-1 min-w-0">
              <span className="text-xs text-textMain leading-snug">{log.message}</span>
            </div>

            {/* Elapsed time badge */}
            {log.ts && (
              <span className="text-[10px] text-textMuted flex-shrink-0 font-mono">
                {log.ts}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CloudActivityPanel;
