// Nuclear Reactor Emergency Simulation Engine
// Simulates a pressure leak scenario with cascading alarms

export interface ReactorState {
  pressure: number;        // PSI (normal: 2235)
  temperature: number;     // °F (normal: 580)
  coolantFlow: number;     // % (normal: 100)
  reactivity: number;      // pcm
  powerLevel: number;      // % (normal: 100)
  containmentPressure: number; // PSI
  radiationLevel: number;  // mRem/hr
  steamGeneratorLevel: number; // %
  elapsedTime: number;     // seconds since event
  phase: 'nominal' | 'degraded' | 'emergency' | 'critical';
}

export interface Alarm {
  id: string;
  code: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  system: string;
  timestamp: number;
  isRootCause: boolean;
  isConsequential: boolean;
}

export interface CognitiveState {
  load: number;            // 0-100
  alarmRate: number;       // alarms per second
  activeAlarms: number;
  smartHudActive: boolean;
}

export interface AIRecommendation {
  step: number;
  action: string;
  system: string;
  priority: 'immediate' | 'urgent' | 'monitor';
  completed: boolean;
}

const ALARM_TEMPLATES: Omit<Alarm, 'id' | 'timestamp'>[] = [
  { code: 'RCS-P-001', message: 'PRIMARY COOLANT PRESSURE LOW', severity: 'critical', system: 'RCS', isRootCause: true, isConsequential: false },
  { code: 'RCS-P-002', message: 'PRESSURIZER LEVEL DROPPING', severity: 'critical', system: 'RCS', isRootCause: false, isConsequential: true },
  { code: 'RCS-T-001', message: 'REACTOR COOLANT TEMP HIGH', severity: 'warning', system: 'RCS', isRootCause: false, isConsequential: true },
  { code: 'RCS-F-001', message: 'COOLANT FLOW ANOMALY DETECTED', severity: 'warning', system: 'RCS', isRootCause: false, isConsequential: true },
  { code: 'SG-L-001', message: 'STEAM GENERATOR LEVEL LOW', severity: 'warning', system: 'SG', isRootCause: false, isConsequential: true },
  { code: 'SG-P-001', message: 'STEAM GENERATOR PRESSURE HIGH', severity: 'warning', system: 'SG', isRootCause: false, isConsequential: true },
  { code: 'CNT-P-001', message: 'CONTAINMENT PRESSURE RISING', severity: 'critical', system: 'CNMT', isRootCause: false, isConsequential: true },
  { code: 'RAD-001', message: 'AREA RADIATION MONITOR HIGH', severity: 'critical', system: 'RAD', isRootCause: false, isConsequential: true },
  { code: 'ECCS-001', message: 'SAFETY INJECTION SIGNAL', severity: 'critical', system: 'ECCS', isRootCause: false, isConsequential: true },
  { code: 'RX-001', message: 'REACTOR TRIP SIGNAL', severity: 'critical', system: 'RPS', isRootCause: false, isConsequential: true },
  { code: 'RCS-P-003', message: 'PORV OPEN INDICATION', severity: 'critical', system: 'RCS', isRootCause: false, isConsequential: true },
  { code: 'RCS-P-004', message: 'SAFETY VALVE DISCHARGE TEMP HIGH', severity: 'warning', system: 'RCS', isRootCause: false, isConsequential: true },
  { code: 'FW-001', message: 'FEEDWATER FLOW MISMATCH', severity: 'warning', system: 'FW', isRootCause: false, isConsequential: true },
  { code: 'TB-001', message: 'TURBINE TRIP', severity: 'info', system: 'TB', isRootCause: false, isConsequential: true },
  { code: 'EL-001', message: 'GENERATOR TRIP - Loss of Load', severity: 'info', system: 'ELEC', isRootCause: false, isConsequential: true },
  { code: 'CW-001', message: 'CIRCULATING WATER PUMP TRIP', severity: 'info', system: 'CW', isRootCause: false, isConsequential: true },
  { code: 'RCS-F-002', message: 'RCP SEAL INJECTION FLOW LOW', severity: 'warning', system: 'RCS', isRootCause: false, isConsequential: true },
  { code: 'CNT-T-001', message: 'CONTAINMENT TEMP HIGH', severity: 'warning', system: 'CNMT', isRootCause: false, isConsequential: true },
  { code: 'CNT-H-001', message: 'CONTAINMENT HUMIDITY HIGH', severity: 'info', system: 'CNMT', isRootCause: false, isConsequential: true },
  { code: 'RAD-002', message: 'CONTAINMENT PARTICULATE MONITOR HIGH', severity: 'warning', system: 'RAD', isRootCause: false, isConsequential: true },
  { code: 'RAD-003', message: 'STACK GAS MONITOR ELEVATED', severity: 'info', system: 'RAD', isRootCause: false, isConsequential: true },
  { code: 'ECCS-002', message: 'ACCUMULATOR LEVEL LOW', severity: 'warning', system: 'ECCS', isRootCause: false, isConsequential: true },
  { code: 'ECCS-003', message: 'RWST LEVEL DECREASING', severity: 'warning', system: 'ECCS', isRootCause: false, isConsequential: true },
  { code: 'VT-001', message: 'CONTAINMENT VENT ISOLATION', severity: 'info', system: 'CNMT', isRootCause: false, isConsequential: true },
  { code: 'AC-001', message: 'CONTROL ROOM AC OVERLOAD', severity: 'info', system: 'HVAC', isRootCause: false, isConsequential: false },
  { code: 'EL-002', message: 'DIESEL GENERATOR AUTO-START', severity: 'info', system: 'ELEC', isRootCause: false, isConsequential: true },
  { code: 'FW-002', message: 'AUX FEEDWATER PUMP START', severity: 'info', system: 'FW', isRootCause: false, isConsequential: true },
  { code: 'RCS-L-001', message: 'REACTOR VESSEL LEVEL INDICATION LOW', severity: 'critical', system: 'RCS', isRootCause: false, isConsequential: true },
  { code: 'CHG-001', message: 'CHARGING PUMP AUTO-START', severity: 'info', system: 'CVCS', isRootCause: false, isConsequential: true },
  { code: 'LD-001', message: 'LETDOWN ISOLATED', severity: 'info', system: 'CVCS', isRootCause: false, isConsequential: true },
  // More noise alarms
  { code: 'TB-002', message: 'CONDENSER VACUUM LOW', severity: 'info', system: 'TB', isRootCause: false, isConsequential: false },
  { code: 'CW-002', message: 'INTAKE SCREEN DIFFERENTIAL HIGH', severity: 'info', system: 'CW', isRootCause: false, isConsequential: false },
  { code: 'AC-002', message: 'TSC VENTILATION AUTO-START', severity: 'info', system: 'HVAC', isRootCause: false, isConsequential: false },
  { code: 'CM-001', message: 'SEISMIC MONITOR - NO SEISMIC EVENT', severity: 'info', system: 'MISC', isRootCause: false, isConsequential: false },
  { code: 'FP-001', message: 'FIRE DETECTION ZONE 12 - SPURIOUS', severity: 'info', system: 'FP', isRootCause: false, isConsequential: false },
  { code: 'EL-003', message: 'UPS BATTERY ON DISCHARGE', severity: 'warning', system: 'ELEC', isRootCause: false, isConsequential: false },
  { code: 'SG-L-002', message: 'BLOWDOWN ISOLATION VALVE CLOSED', severity: 'info', system: 'SG', isRootCause: false, isConsequential: true },
  { code: 'RCS-T-002', message: 'COLD LEG TEMP DEVIATION', severity: 'warning', system: 'RCS', isRootCause: false, isConsequential: true },
  { code: 'NI-001', message: 'SOURCE RANGE COUNT RATE HIGH', severity: 'warning', system: 'NI', isRootCause: false, isConsequential: true },
  { code: 'NI-002', message: 'INTERMEDIATE RANGE FLUX HIGH', severity: 'warning', system: 'NI', isRootCause: false, isConsequential: true },
  { code: 'RCS-P-005', message: 'PRESSURIZER HEATER TRIPPED', severity: 'info', system: 'RCS', isRootCause: false, isConsequential: true },
  { code: 'VT-002', message: 'MAIN STEAM ISOLATION', severity: 'info', system: 'MS', isRootCause: false, isConsequential: true },
  { code: 'RAD-004', message: 'PROCESS RADIATION MONITOR CH-4 HIGH', severity: 'info', system: 'RAD', isRootCause: false, isConsequential: false },
  { code: 'SG-T-001', message: 'SG TUBE SHEET ΔT ABNORMAL', severity: 'warning', system: 'SG', isRootCause: false, isConsequential: true },
  { code: 'EL-004', message: 'BUS TIE BREAKER AUTO-TRANSFER', severity: 'info', system: 'ELEC', isRootCause: false, isConsequential: false },
  { code: 'CHG-002', message: 'VCT LEVEL LOW - AUTO MAKEUP', severity: 'info', system: 'CVCS', isRootCause: false, isConsequential: true },
  { code: 'CNT-S-001', message: 'CONTAINMENT SPRAY ACTUATION', severity: 'critical', system: 'CNMT', isRootCause: false, isConsequential: true },
];

export const AI_RECOMMENDATIONS: AIRecommendation[] = [
  { step: 1, action: 'VERIFY reactor trip — confirm all rods fully inserted', system: 'RPS', priority: 'immediate', completed: false },
  { step: 2, action: 'VERIFY Safety Injection actuated — check SI flow indicators', system: 'ECCS', priority: 'immediate', completed: false },
  { step: 3, action: 'IDENTIFY leak source — check pressurizer PORV & safety valve tailpipe temps', system: 'RCS', priority: 'immediate', completed: false },
  { step: 4, action: 'ISOLATE if LOCA confirmed — close PORV block valve if PORV leak', system: 'RCS', priority: 'urgent', completed: false },
  { step: 5, action: 'MONITOR RCS pressure trend — verify SI restoring pressure', system: 'RCS', priority: 'urgent', completed: false },
  { step: 6, action: 'CHECK containment pressure & spray status', system: 'CNMT', priority: 'urgent', completed: false },
  { step: 7, action: 'VERIFY aux feedwater flow to steam generators', system: 'FW', priority: 'monitor', completed: false },
  { step: 8, action: 'MONITOR core exit thermocouples for adequate core cooling', system: 'RCS', priority: 'monitor', completed: false },
];

export function getInitialReactorState(): ReactorState {
  return {
    pressure: 2235,
    temperature: 580,
    coolantFlow: 100,
    reactivity: 0,
    powerLevel: 100,
    containmentPressure: 1.0,
    radiationLevel: 0.5,
    steamGeneratorLevel: 65,
    elapsedTime: 0,
    phase: 'nominal',
  };
}

export function simulateStep(state: ReactorState, dt: number): ReactorState {
  const t = state.elapsedTime + dt;
  const next = { ...state, elapsedTime: t };

  if (t < 5) {
    // Nominal — nothing happening yet
    next.phase = 'nominal';
    return next;
  }

  // Leak begins at t=5
  const leakTime = t - 5;

  if (leakTime < 15) {
    next.phase = 'degraded';
    next.pressure = Math.max(1600, 2235 - leakTime * 40);
    next.temperature = Math.min(620, 580 + leakTime * 2.5);
    next.coolantFlow = Math.max(85, 100 - leakTime * 1);
    next.powerLevel = Math.max(80, 100 - leakTime * 1.2);
    next.containmentPressure = Math.min(3, 1.0 + leakTime * 0.12);
    next.radiationLevel = Math.min(15, 0.5 + leakTime * 0.8);
    next.steamGeneratorLevel = Math.max(45, 65 - leakTime * 1.3);
    next.reactivity = -leakTime * 5;
  } else if (leakTime < 45) {
    next.phase = 'emergency';
    const emergTime = leakTime - 15;
    next.pressure = Math.max(800, 1600 - emergTime * 25);
    next.temperature = Math.min(680, 620 + emergTime * 1.8);
    next.coolantFlow = Math.max(55, 85 - emergTime * 0.9);
    next.powerLevel = Math.max(5, 80 - emergTime * 2.5);
    next.containmentPressure = Math.min(12, 3 + emergTime * 0.28);
    next.radiationLevel = Math.min(150, 15 + emergTime * 4);
    next.steamGeneratorLevel = Math.max(20, 45 - emergTime * 0.8);
    next.reactivity = -(15 * 5) - emergTime * 3;
  } else {
    next.phase = 'critical';
    const critTime = leakTime - 45;
    next.pressure = Math.max(400, 800 - critTime * 10);
    next.temperature = Math.min(750, 680 + critTime * 1.2);
    next.coolantFlow = Math.max(30, 55 - critTime * 0.5);
    next.powerLevel = Math.max(0, 5 - critTime * 0.2);
    next.containmentPressure = Math.min(20, 12 + critTime * 0.15);
    next.radiationLevel = Math.min(500, 150 + critTime * 5);
    next.steamGeneratorLevel = Math.max(10, 20 - critTime * 0.2);
    next.reactivity = -(15 * 5 + 30 * 3) - critTime * 2;
  }

  return next;
}

let alarmIdCounter = 0;

export function generateAlarms(state: ReactorState, existingAlarms: Alarm[]): Alarm[] {
  const existingCodes = new Set(existingAlarms.map(a => a.code));
  const newAlarms: Alarm[] = [];
  const t = state.elapsedTime;

  if (t < 5) return [];

  const leakTime = t - 5;

  // Progressively trigger alarms based on leak progression
  for (const template of ALARM_TEMPLATES) {
    if (existingCodes.has(template.code)) continue;

    let shouldTrigger = false;

    if (template.isRootCause && leakTime >= 0) shouldTrigger = true;
    else if (template.severity === 'critical' && leakTime >= 2 + Math.random() * 8) shouldTrigger = true;
    else if (template.severity === 'warning' && leakTime >= 5 + Math.random() * 15) shouldTrigger = true;
    else if (template.severity === 'info' && leakTime >= 8 + Math.random() * 20) shouldTrigger = true;

    if (shouldTrigger) {
      newAlarms.push({
        ...template,
        id: `alarm-${alarmIdCounter++}`,
        timestamp: t,
      });
    }
  }

  return newAlarms;
}

export function calculateCognitiveLoad(alarms: Alarm[], state: ReactorState): CognitiveState {
  const activeAlarms = alarms.length;
  const criticalCount = alarms.filter(a => a.severity === 'critical').length;

  // Cognitive load formula: weighted alarm count + phase stress
  const phaseWeight = { nominal: 0, degraded: 15, emergency: 35, critical: 50 }[state.phase];
  const load = Math.min(100, activeAlarms * 1.8 + criticalCount * 5 + phaseWeight);

  const recentAlarms = alarms.filter(a => a.timestamp > state.elapsedTime - 5);
  const alarmRate = recentAlarms.length / 5;

  return {
    load,
    alarmRate,
    activeAlarms,
    smartHudActive: load >= 60,
  };
}

export function getRootCauseAnalysis(alarms: Alarm[]): { rootCause: Alarm | null; consequential: Alarm[]; noise: Alarm[] } {
  const rootCause = alarms.find(a => a.isRootCause) || null;
  const consequential = alarms.filter(a => a.isConsequential);
  const noise = alarms.filter(a => !a.isRootCause && !a.isConsequential);

  return { rootCause, consequential, noise };
}
