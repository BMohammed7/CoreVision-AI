import { AIRecommendation } from '@/lib/simulation';
import { motion } from 'framer-motion';

interface AIRecommendationsProps {
  recommendations: AIRecommendation[];
  visible: boolean;
  onToggleStep: (step: number) => void;
}

export default function AIRecommendations({ recommendations, visible, onToggleStep }: AIRecommendationsProps) {
  if (!visible) return null;

  const priorityStyles = {
    immediate: 'border-critical/40 bg-critical/5',
    urgent: 'border-caution/40 bg-caution/5',
    monitor: 'border-border bg-secondary/30',
  };

  const priorityText = {
    immediate: 'text-critical',
    urgent: 'text-caution',
    monitor: 'text-muted-foreground',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="hud-panel p-4 space-y-3 glow-cyan"
    >
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xs uppercase tracking-[0.2em] text-ai-cyan">
          ⚡ AI Emergency Procedure Guide
        </h2>
        <span className="text-[9px] font-display uppercase tracking-wider text-ai-cyan/70">
          E-0 / ECA-1.1
        </span>
      </div>

      <div className="text-[10px] text-ai-cyan/80 border-b border-ai-cyan/20 pb-2">
        ROOT CAUSE: Small Break LOCA — Primary Coolant System breach detected.
        AI has identified 1 root cause alarm from {recommendations.length > 0 ? '47' : '0'} total alarms.
      </div>

      <div className="space-y-1.5">
        {recommendations.map((rec) => (
          <motion.button
            key={rec.step}
            onClick={() => onToggleStep(rec.step)}
            className={`w-full flex items-start gap-2 p-2 border rounded-sm text-left transition-all ${
              rec.completed ? 'opacity-40 line-through' : priorityStyles[rec.priority]
            }`}
            whileTap={{ scale: 0.98 }}
          >
            <div className={`shrink-0 w-5 h-5 rounded-sm border flex items-center justify-center text-[10px] font-display font-bold ${
              rec.completed ? 'bg-nominal/20 border-nominal/40 text-nominal' : 'border-border text-muted-foreground'
            }`}>
              {rec.completed ? '✓' : rec.step}
            </div>
            <div className="flex-1 min-w-0">
              <div className={`text-[10px] ${rec.completed ? 'text-muted-foreground' : 'text-foreground'}`}>
                {rec.action}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[8px] font-display uppercase tracking-wider text-muted-foreground">{rec.system}</span>
                <span className={`text-[8px] font-display uppercase tracking-wider ${priorityText[rec.priority]}`}>{rec.priority}</span>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
