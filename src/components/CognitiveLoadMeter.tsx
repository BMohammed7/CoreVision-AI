import { CognitiveState } from '@/lib/simulation';
import { motion } from 'framer-motion';

interface CognitiveLoadMeterProps {
  state: CognitiveState;
}

export default function CognitiveLoadMeter({ state }: CognitiveLoadMeterProps) {
  const { load, alarmRate, activeAlarms, smartHudActive } = state;

  const getLoadColor = () => {
    if (load >= 80) return 'bg-critical';
    if (load >= 60) return 'bg-caution';
    return 'bg-nominal';
  };

  const getLoadLabel = () => {
    if (load >= 80) return 'OVERLOAD';
    if (load >= 60) return 'HIGH';
    if (load >= 40) return 'ELEVATED';
    return 'NOMINAL';
  };

  const getLoadTextColor = () => {
    if (load >= 80) return 'text-critical';
    if (load >= 60) return 'text-caution';
    return 'text-nominal';
  };

  return (
    <div className="hud-panel p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Operator Cognitive Load
        </h2>
        <span className={`font-display text-xs font-bold uppercase ${getLoadTextColor()} ${load >= 80 ? 'animate-pulse-critical' : ''}`}>
          {getLoadLabel()}
        </span>
      </div>

      {/* Main load bar */}
      <div className="relative">
        <div className="h-6 bg-secondary rounded-sm overflow-hidden border border-border">
          <motion.div
            className={`h-full ${getLoadColor()} relative`}
            animate={{ width: `${load}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            {load >= 20 && (
              <span className="absolute inset-0 flex items-center justify-center font-display text-[10px] font-bold text-primary-foreground">
                {Math.round(load)}%
              </span>
            )}
          </motion.div>
        </div>
        {/* Threshold markers */}
        <div className="absolute top-0 left-[60%] h-6 w-px bg-caution/50" />
        <div className="absolute top-0 left-[80%] h-6 w-px bg-critical/50" />
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <div className="text-[9px] uppercase tracking-wider text-muted-foreground">Active</div>
          <div className="font-display text-sm font-bold text-foreground">{activeAlarms}</div>
        </div>
        <div>
          <div className="text-[9px] uppercase tracking-wider text-muted-foreground">Rate</div>
          <div className="font-display text-sm font-bold text-foreground">{alarmRate.toFixed(1)}/s</div>
        </div>
        <div>
          <div className="text-[9px] uppercase tracking-wider text-muted-foreground">Smart HUD</div>
          <div className={`font-display text-sm font-bold ${smartHudActive ? 'text-ai-cyan' : 'text-muted-foreground'}`}>
            {smartHudActive ? 'ACTIVE' : 'STANDBY'}
          </div>
        </div>
      </div>

      {smartHudActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-[10px] text-ai-cyan text-center py-1 border border-ai-cyan/20 bg-ai-cyan/5 rounded-sm"
        >
          ⚡ Smart HUD activated — filtering non-critical information
        </motion.div>
      )}
    </div>
  );
}
