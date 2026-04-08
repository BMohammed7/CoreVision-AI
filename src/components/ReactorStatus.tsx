import { ReactorState } from '@/lib/simulation';
import { motion } from 'framer-motion';

interface GaugeProps {
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  nominal: number;
  warningLow?: number;
  warningHigh?: number;
  criticalLow?: number;
  criticalHigh?: number;
}

function getGaugeColor(value: number, props: GaugeProps): string {
  if (props.criticalLow !== undefined && value <= props.criticalLow) return 'text-critical';
  if (props.criticalHigh !== undefined && value >= props.criticalHigh) return 'text-critical';
  if (props.warningLow !== undefined && value <= props.warningLow) return 'text-caution';
  if (props.warningHigh !== undefined && value >= props.warningHigh) return 'text-caution';
  return 'text-nominal';
}

function getBarColor(value: number, props: GaugeProps): string {
  if (props.criticalLow !== undefined && value <= props.criticalLow) return 'bg-critical';
  if (props.criticalHigh !== undefined && value >= props.criticalHigh) return 'bg-critical';
  if (props.warningLow !== undefined && value <= props.warningLow) return 'bg-caution';
  if (props.warningHigh !== undefined && value >= props.warningHigh) return 'bg-caution';
  return 'bg-nominal';
}

function Gauge(props: GaugeProps) {
  const { label, value, unit, min, max } = props;
  const percentage = ((value - min) / (max - min)) * 100;
  const colorClass = getGaugeColor(value, props);
  const barClass = getBarColor(value, props);

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-baseline">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
        <span className={`font-display text-sm font-bold ${colorClass}`}>
          {value.toFixed(1)} <span className="text-[9px] text-muted-foreground">{unit}</span>
        </span>
      </div>
      <div className="h-1.5 bg-secondary rounded-sm overflow-hidden">
        <motion.div
          className={`h-full ${barClass} rounded-sm`}
          initial={{ width: '0%' }}
          animate={{ width: `${Math.max(0, Math.min(100, percentage))}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  );
}

interface ReactorStatusProps {
  state: ReactorState;
}

export default function ReactorStatus({ state }: ReactorStatusProps) {
  const phaseColors = {
    nominal: 'text-nominal',
    degraded: 'text-caution',
    emergency: 'text-critical animate-pulse-critical',
    critical: 'text-critical animate-pulse-critical',
  };

  return (
    <div className="hud-panel p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xs uppercase tracking-[0.2em] text-muted-foreground">Reactor Status</h2>
        <div className={`font-display text-xs font-bold uppercase tracking-wider ${phaseColors[state.phase]}`}>
          {state.phase}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Gauge label="RCS Pressure" value={state.pressure} unit="PSI" min={0} max={2500}
          nominal={2235} warningLow={1800} criticalLow={1200} />
        <Gauge label="Coolant Temp" value={state.temperature} unit="°F" min={400} max={800}
          nominal={580} warningHigh={620} criticalHigh={680} />
        <Gauge label="Coolant Flow" value={state.coolantFlow} unit="%" min={0} max={100}
          nominal={100} warningLow={80} criticalLow={60} />
        <Gauge label="Power Level" value={state.powerLevel} unit="%" min={0} max={100}
          nominal={100} warningLow={50} criticalLow={20} />
        <Gauge label="CNMT Press" value={state.containmentPressure} unit="PSI" min={0} max={25}
          nominal={1} warningHigh={5} criticalHigh={10} />
        <Gauge label="Radiation" value={state.radiationLevel} unit="mR/hr" min={0} max={500}
          nominal={0.5} warningHigh={10} criticalHigh={50} />
        <Gauge label="SG Level" value={state.steamGeneratorLevel} unit="%" min={0} max={100}
          nominal={65} warningLow={40} criticalLow={25} />
        <Gauge label="Reactivity" value={state.reactivity} unit="pcm" min={-200} max={50}
          nominal={0} warningLow={-50} criticalLow={-100} />
      </div>

      <div className="flex items-center justify-between text-[10px] text-muted-foreground border-t border-border pt-2">
        <span>T+ {formatTime(state.elapsedTime)}</span>
        <span className="font-display tracking-wider">UNIT 1 — PWR 1000MWe</span>
      </div>
    </div>
  );
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
