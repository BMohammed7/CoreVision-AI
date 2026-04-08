import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import ReactorStatus from '@/components/ReactorStatus';
import AlarmPanel from '@/components/AlarmPanel';
import CognitiveLoadMeter from '@/components/CognitiveLoadMeter';
import AIRecommendations from '@/components/AIRecommendations';
import {
  ReactorState, Alarm, CognitiveState, AIRecommendation,
  getInitialReactorState, simulateStep, generateAlarms,
  calculateCognitiveLoad, AI_RECOMMENDATIONS,
} from '@/lib/simulation';

const TICK_RATE = 500; // ms

export default function HUDDashboard() {
  const [reactorState, setReactorState] = useState<ReactorState>(getInitialReactorState());
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [cognitiveState, setCognitiveState] = useState<CognitiveState>({ load: 0, alarmRate: 0, activeAlarms: 0, smartHudActive: false });
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>(AI_RECOMMENDATIONS.map(r => ({ ...r })));
  const [running, setRunning] = useState(false);
  const alarmsRef = useRef<Alarm[]>([]);

  const tick = useCallback(() => {
    setReactorState(prev => {
      const next = simulateStep(prev, TICK_RATE / 1000);
      const newAlarms = generateAlarms(next, alarmsRef.current);
      if (newAlarms.length > 0) {
        const updated = [...alarmsRef.current, ...newAlarms];
        alarmsRef.current = updated;
        setAlarms(updated);
      }
      const cognitive = calculateCognitiveLoad(alarmsRef.current, next);
      setCognitiveState(cognitive);
      return next;
    });
  }, []);

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(tick, TICK_RATE);
    return () => clearInterval(interval);
  }, [running, tick]);

  const handleToggleStep = (step: number) => {
    setRecommendations(prev => prev.map(r => r.step === step ? { ...r, completed: !r.completed } : r));
  };

  const handleReset = () => {
    setRunning(false);
    setReactorState(getInitialReactorState());
    setAlarms([]);
    alarmsRef.current = [];
    setCognitiveState({ load: 0, alarmRate: 0, activeAlarms: 0, smartHudActive: false });
    setRecommendations(AI_RECOMMENDATIONS.map(r => ({ ...r })));
  };

  return (
    <div className="min-h-screen bg-background scanline-overlay hud-flicker">
      {/* Header */}
      <header className="border-b border-border px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-nominal animate-pulse" />
          <h1 className="font-display text-sm uppercase tracking-[0.3em] text-foreground">
            Nuclear Smart HUD
          </h1>
          <span className="text-[9px] font-display uppercase tracking-wider text-muted-foreground">
            v2.0 — Cognitive-Aware Interface
          </span>
        </div>
        <div className="flex items-center gap-2">
          {!running ? (
            <button
              onClick={() => setRunning(true)}
              className="font-display text-[10px] uppercase tracking-wider px-3 py-1.5 bg-nominal/10 border border-nominal/30 text-nominal rounded-sm hover:bg-nominal/20 transition-colors"
            >
              ▶ Start Simulation
            </button>
          ) : (
            <button
              onClick={() => setRunning(false)}
              className="font-display text-[10px] uppercase tracking-wider px-3 py-1.5 bg-caution/10 border border-caution/30 text-caution rounded-sm hover:bg-caution/20 transition-colors"
            >
              ⏸ Pause
            </button>
          )}
          <button
            onClick={handleReset}
            className="font-display text-[10px] uppercase tracking-wider px-3 py-1.5 bg-secondary border border-border text-muted-foreground rounded-sm hover:text-foreground transition-colors"
          >
            ↺ Reset
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <div className="p-3 grid grid-cols-12 gap-3 h-[calc(100vh-49px)]">
        {/* Left Column — Reactor Status */}
        <div className="col-span-4 flex flex-col gap-3">
          <ReactorStatus state={reactorState} />
          <CognitiveLoadMeter state={cognitiveState} />

          {/* Phase indicator */}
          <div className="hud-panel p-3">
            <div className="text-[9px] font-display uppercase tracking-wider text-muted-foreground mb-2">
              Event Timeline
            </div>
            <div className="flex gap-1">
              {['nominal', 'degraded', 'emergency', 'critical'].map((phase) => {
                const active = reactorState.phase === phase;
                const passed = ['nominal', 'degraded', 'emergency', 'critical'].indexOf(reactorState.phase) >=
                  ['nominal', 'degraded', 'emergency', 'critical'].indexOf(phase);
                return (
                  <div key={phase} className="flex-1">
                    <div className={`h-1.5 rounded-sm transition-colors ${
                      active ? (phase === 'critical' ? 'bg-critical animate-pulse-critical' : phase === 'emergency' ? 'bg-critical' : phase === 'degraded' ? 'bg-caution' : 'bg-nominal')
                      : passed ? 'bg-muted-foreground/30' : 'bg-secondary'
                    }`} />
                    <div className={`text-[8px] mt-1 uppercase tracking-wider ${active ? 'text-foreground' : 'text-muted-foreground/50'}`}>
                      {phase}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Center Column — Alarms */}
        <div className="col-span-4">
          <AlarmPanel alarms={alarms} cognitiveState={cognitiveState} />
        </div>

        {/* Right Column — AI Recommendations */}
        <div className="col-span-4 flex flex-col gap-3">
          <AIRecommendations
            recommendations={recommendations}
            visible={cognitiveState.smartHudActive || reactorState.phase !== 'nominal'}
            onToggleStep={handleToggleStep}
          />

          {/* System info when AI not active */}
          {!cognitiveState.smartHudActive && reactorState.phase === 'nominal' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="hud-panel p-6 flex-1 flex flex-col items-center justify-center text-center"
            >
              <div className="w-12 h-12 rounded-full border-2 border-nominal/30 flex items-center justify-center mb-4">
                <div className="w-4 h-4 rounded-full bg-nominal/50 animate-pulse" />
              </div>
              <div className="font-display text-sm uppercase tracking-wider text-nominal mb-2">
                All Systems Nominal
              </div>
              <div className="text-[10px] text-muted-foreground max-w-[200px]">
                Press "Start Simulation" to initiate a Small Break LOCA scenario.
                The Smart HUD will activate when cognitive overload is detected.
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
