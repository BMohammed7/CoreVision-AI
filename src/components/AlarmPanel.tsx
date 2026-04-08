import { Alarm, CognitiveState, getRootCauseAnalysis } from '@/lib/simulation';
import { motion, AnimatePresence } from 'framer-motion';

interface AlarmPanelProps {
  alarms: Alarm[];
  cognitiveState: CognitiveState;
}

export default function AlarmPanel({ alarms, cognitiveState }: AlarmPanelProps) {
  const { rootCause, consequential, noise } = getRootCauseAnalysis(alarms);
  const smartMode = cognitiveState.smartHudActive;

  const displayAlarms = smartMode
    ? [rootCause, ...consequential.slice(0, 5)].filter(Boolean) as Alarm[]
    : alarms;

  const filteredCount = alarms.length - displayAlarms.length;

  const severityStyles = {
    critical: 'border-critical/50 bg-critical/5 text-critical',
    warning: 'border-caution/50 bg-caution/5 text-caution',
    info: 'border-border bg-secondary/30 text-muted-foreground',
  };

  return (
    <div className="hud-panel p-4 flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Alarm Annunciator
        </h2>
        <div className="flex items-center gap-2">
          {smartMode && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-[9px] font-display uppercase tracking-wider text-ai-cyan bg-ai-cyan/10 border border-ai-cyan/30 px-2 py-0.5 rounded-sm"
            >
              AI FILTERED
            </motion.span>
          )}
          <span className={`font-display text-xs font-bold ${alarms.length > 20 ? 'text-critical animate-pulse-critical' : 'text-caution'}`}>
            {alarms.length}
          </span>
        </div>
      </div>

      {smartMode && rootCause && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-3 p-2 border border-ai-cyan/40 bg-ai-cyan/5 rounded-sm glow-cyan"
        >
          <div className="text-[9px] uppercase tracking-wider text-ai-cyan mb-1 font-display">⚡ Root Cause Identified</div>
          <div className="text-xs text-ai-cyan font-bold">{rootCause.code}: {rootCause.message}</div>
        </motion.div>
      )}

      <div className="flex-1 overflow-y-auto space-y-1 min-h-0">
        <AnimatePresence mode="popLayout">
          {displayAlarms.map((alarm) => (
            <motion.div
              key={alarm.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20, height: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex items-start gap-2 p-1.5 border rounded-sm text-[10px] ${severityStyles[alarm.severity]} ${alarm.severity === 'critical' ? 'animate-pulse-critical' : ''}`}
            >
              <span className="font-display font-bold shrink-0 w-20">{alarm.code}</span>
              <span className="flex-1 truncate">{alarm.message}</span>
              {alarm.isRootCause && (
                <span className="shrink-0 text-[8px] bg-ai-cyan/20 text-ai-cyan px-1 rounded">ROOT</span>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {smartMode && filteredCount > 0 && (
        <div className="mt-2 pt-2 border-t border-border text-[10px] text-muted-foreground text-center">
          {filteredCount} consequential/noise alarms suppressed by AI filter
        </div>
      )}
    </div>
  );
}
