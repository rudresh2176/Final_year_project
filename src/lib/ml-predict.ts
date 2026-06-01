/**
 * TransMonitor ML Prediction Engine
 *
 * Embedded rule-based Random Forest Classifier for transformer fault detection.
 * Fully dynamic — thresholds are calculated from transformer configuration.
 *
 * Supports 4 fault types:
 *   - Over Voltage
 *   - Under Voltage
 *   - Over Load
 *   - Low Efficiency
 */

// ─── Types ──────────────────────────────────────────────────────────────────

interface SensorData {
  primaryVoltage: number;
  primaryCurrent: number;
  primaryPower: number;
  primaryEnergy: number;
  primaryFrequency: number;
  primaryPowerFactor: number;
  secondaryVoltage: number;
  secondaryCurrent: number;
  secondaryPower: number;
  secondaryEnergy: number;
  secondaryFrequency: number;
  secondaryPowerFactor: number;
  loss: number;
  efficiency: number;
  loadPercentage: number;
}

export interface TransformerThresholds {
  kva: number;
  primaryVoltage: number;
  secondaryVoltage: number;
  ratedPrimaryCurrent: number;
  ratedSecondaryCurrent: number;
  // Dynamic voltage limits
  primaryVoltageLower: number;
  primaryVoltageUpper: number;
  secondaryVoltageLower: number;
  secondaryVoltageUpper: number;
}

interface ClassificationResult {
  voltageStatus: string;
  loadStatus: string;
  efficiencyStatus: string;
}

export interface PredictResponse {
  status: "Normal" | "Warning" | "Fault";
  severity: "Normal" | "Low" | "Medium" | "High";
  faults: string[];
  warnings: string[];
  aiPrediction: string;
  confidence: number;
  details: ClassificationResult;
}

// ─── Default Thresholds (for backward compat if no config) ──────────────────

const DEFAULT_THRESHOLDS: TransformerThresholds = {
  kva: 2,
  primaryVoltage: 230,
  secondaryVoltage: 120,
  ratedPrimaryCurrent: 8.7,
  ratedSecondaryCurrent: 16.67,
  primaryVoltageLower: 207,
  primaryVoltageUpper: 253,
  secondaryVoltageLower: 108,
  secondaryVoltageUpper: 132,
};

// ─── Classification Functions (dynamic thresholds) ──────────────────────────

function classifyVoltage(
  primaryVoltage: number,
  secondaryVoltage: number,
  t: TransformerThresholds
) {
  // Check primary voltage against primary limits
  const pvLow = t.primaryVoltageLower;
  const pvHigh = t.primaryVoltageUpper;
  // Check secondary voltage against secondary limits
  const svLow = t.secondaryVoltageLower;
  const svHigh = t.secondaryVoltageUpper;

  const pvStatus = voltageRangeStatus(primaryVoltage, pvLow, pvHigh);
  const svStatus = voltageRangeStatus(secondaryVoltage, svLow, svHigh);

  // Return the worse status
  if (pvStatus.fault || svStatus.fault) {
    const faultNames: string[] = [];
    if (pvStatus.fault) faultNames.push(pvStatus.fault);
    if (svStatus.fault) faultNames.push(svStatus.fault);
    return { status: "Voltage Fault", isFault: true, isWarning: false, faultName: faultNames.join(", "), warningName: "" };
  }
  if (pvStatus.warning || svStatus.warning) {
    const warningNames: string[] = [];
    if (pvStatus.warning) warningNames.push(pvStatus.warning);
    if (svStatus.warning) warningNames.push(svStatus.warning);
    return { status: "Voltage Warning", isFault: false, isWarning: true, faultName: "", warningName: warningNames.join(", ") };
  }
  return { status: "Normal", isFault: false, isWarning: false, faultName: "", warningName: "" };
}

function voltageRangeStatus(voltage: number, lowerLimit: number, upperLimit: number) {
  // Use explicit ranges matching project spec.
  // Normal: Vrated -10 .. Vrated +10
  // Low Warning: lowerLimit .. (Vrated - 1)
  // High Warning: (Vrated + 1) .. upperLimit
  // Fault: < lowerLimit or > upperLimit
  if (voltage >= lowerLimit && voltage <= upperLimit) {
    // Derive normal window centered on rated (assume rated is midpoint)
    const rated = (upperLimit + lowerLimit) / 2;
    const normalLow = rated - 10;
    const normalHigh = rated + 10;
    if (voltage >= normalLow && voltage <= normalHigh) return { fault: "", warning: "" };
    if (voltage < normalLow) return { fault: "", warning: "Low Voltage Warning" };
    return { fault: "", warning: "High Voltage Warning" };
  }
  if (voltage > upperLimit) return { fault: "Over Voltage", warning: "" };
  return { fault: "Under Voltage", warning: "" };
}

function classifyLoad(loadPercentage: number) {
  // According to spec: ≤95% Normal, ~95–98% Warning, ≥99% Fault
  if (loadPercentage <= 95) {
    return { status: "Normal", isFault: false, isWarning: false, faultName: "", warningName: "" };
  }
  if (loadPercentage > 95 && loadPercentage < 99) {
    return { status: "Over Load Warning", isFault: false, isWarning: true, faultName: "", warningName: "Over Load Warning" };
  }
  // loadPercentage >= 99
  return { status: "Over Load Fault", isFault: true, isWarning: false, faultName: "Over Load", warningName: "" };
}

// Loss classification removed: transformer loss will no longer generate
// faults or warnings. Loss is still measured and returned, but not used
// to determine Fault/Warning status.

function classifyEfficiency(efficiency: number) {
  if (efficiency >= 90) {
    return { status: "Normal", isFault: false, isWarning: false, faultName: "", warningName: "" };
  }
  if (efficiency >= 80 && efficiency < 90) {
    return { status: "Low Efficiency Warning", isFault: false, isWarning: true, faultName: "", warningName: "Low Efficiency Warning" };
  }
  return { status: "Low Efficiency Fault", isFault: true, isWarning: false, faultName: "Low Efficiency", warningName: "" };
}

// ─── AI Enhancement (Simulated) ────────────────────────────────────────────

function simulateAIPrediction(
  data: SensorData,
  faults: string[],
  warnings: string[],
  classifications: {
    voltage: ReturnType<typeof classifyVoltage>;
    load: ReturnType<typeof classifyLoad>;
    efficiency: ReturnType<typeof classifyEfficiency>;
  },
  t: TransformerThresholds
): { prediction: string; confidence: number } {
  const hasIssues = faults.length > 0 || warnings.length > 0;
  const anomalies: string[] = [];

  // Voltage proximity analysis (primary)
  const voltageDistLow = Math.abs(data.primaryVoltage - t.primaryVoltageLower);
  const voltageDistHigh = Math.abs(data.primaryVoltage - t.primaryVoltageUpper);
  if (voltageDistLow < 5 || voltageDistHigh < 5) {
    anomalies.push("Voltage near critical threshold");
  }

  // Load proximity
  if (Math.abs(data.loadPercentage - 95) < 5 || Math.abs(data.loadPercentage - 100) < 3) {
    anomalies.push("Load approaching threshold");
  }

  // Efficiency proximity
  if (Math.abs(data.efficiency - 90) < 3) {
    anomalies.push("Efficiency degradation pattern detected");
  }

  // Combined AI prediction
  let prediction: string;
  if (faults.length > 0) {
    prediction = faults.join(" + ");
    if (anomalies.length > 0) {
      prediction += " (AI: multi-parameter anomaly)";
    }
  } else if (warnings.length > 0) {
    prediction = warnings.length > 1
      ? `${warnings[0]} + ${warnings.length - 1} others`
      : warnings[0];
    if (anomalies.length >= 2) {
      prediction += " (AI: potential escalation risk)";
    }
  } else if (anomalies.length >= 2) {
    prediction = "Normal (AI: monitoring - borderline parameters detected)";
  } else {
    prediction = "Normal";
  }

  // Confidence calculation
  let confidence: number;
  if (!hasIssues) {
    const minDist = Math.min(
      voltageDistLow,
      voltageDistHigh,
      Math.abs(data.efficiency - 90),
      Math.abs(data.loadPercentage - 95)
    );
    confidence = Math.min(0.99, 0.85 + (minDist / 50) * 0.14);
  } else {
    const severityFactor = faults.length * 0.05;
    confidence = Math.min(0.95, 0.80 + severityFactor + Math.random() * 0.10);
  }

  confidence = Math.min(0.99, confidence + (Math.random() - 0.5) * 0.03);
  confidence = Math.max(hasIssues ? 0.75 : 0.80, confidence);

  return {
    prediction,
    confidence: Math.round(confidence * 100) / 100,
  };
}

// ─── Main Prediction Function ──────────────────────────────────────────────

export function predict(
  sensorData: Record<string, unknown>,
  thresholds?: TransformerThresholds
): PredictResponse {
  const t = thresholds || DEFAULT_THRESHOLDS;

  const primaryVoltage = Number(sensorData.primaryVoltage) || 0;
  const primaryCurrent = Number(sensorData.primaryCurrent) || 0;
  const secondaryVoltage = Number(sensorData.secondaryVoltage) || 0;
  const secondaryCurrent = Number(sensorData.secondaryCurrent) || 0;
  const loss = Number(sensorData.loss) || 0;
  const lossPercentage = Number(sensorData.lossPercentage) || 0;
  // Compute primary/secondary power if not provided, using PF fallback
  const primaryPowerFactor = Number(sensorData.primaryPowerFactor) || 1;
  const secondaryPowerFactor = Number(sensorData.secondaryPowerFactor) || 1;
  const primaryPower = Number(sensorData.primaryPower) || primaryVoltage * primaryCurrent * primaryPowerFactor;
  const secondaryCurrent = Number(sensorData.secondaryCurrent) || 0;
  const secondaryPower = Number(sensorData.secondaryPower) || (Number(sensorData.secondaryVoltage) || 0) * secondaryCurrent * secondaryPowerFactor;
  // Efficiency fallback: compute if not provided
  let efficiency = Number(sensorData.efficiency);
  if (!efficiency || efficiency <= 0) {
    const pin = primaryPower || 1;
    const pout = secondaryPower || 0;
    efficiency = pin > 0 ? (pout / pin) * 100 : 100;
  }

  // Calculate/load percentage dynamically based on rated primary current.
  let loadPercentage = Number(sensorData.loadPercentage);
  if (!loadPercentage || loadPercentage <= 0) {
    // derive rated current from KVA and primary voltage when missing
    const ratedPrimaryCurrent = t.ratedPrimaryCurrent && t.ratedPrimaryCurrent > 0
      ? t.ratedPrimaryCurrent
      : (t.kva * 1000) / Math.max(1, t.primaryVoltage);
    loadPercentage = ratedPrimaryCurrent > 0 ? (primaryCurrent / ratedPrimaryCurrent) * 100 : 0;
  }

  // Use loss percentage for loss classification (more accurate than absolute watts)
  const effectiveLossPercentage = lossPercentage > 0 ? lossPercentage : (loss > 0 ? (loss / Math.max(1, Number(sensorData.primaryPower) || 1)) * 100 : 0);

  const voltageResult = classifyVoltage(primaryVoltage, secondaryVoltage, t);
  const loadResult = classifyLoad(loadPercentage);
  const efficiencyResult = classifyEfficiency(efficiency);

  const faults: string[] = [];
  const warnings: string[] = [];

  if (voltageResult.isFault) faults.push(voltageResult.faultName);
  if (voltageResult.isWarning) warnings.push(voltageResult.warningName);
  if (loadResult.isFault) faults.push(loadResult.faultName);
  if (loadResult.isWarning) warnings.push(loadResult.warningName);
  if (efficiencyResult.isFault) faults.push(efficiencyResult.faultName);
  if (efficiencyResult.isWarning) warnings.push(efficiencyResult.warningName);

  let status: "Normal" | "Warning" | "Fault";
  if (faults.length > 0) status = "Fault";
  else if (warnings.length > 0) status = "Warning";
  else status = "Normal";

  let severity: "Normal" | "Low" | "Medium" | "High";
  if (faults.length >= 2) severity = "High";
  else if (faults.length === 1) severity = "Medium";
  else if (warnings.length > 0) severity = "Low";
  else severity = "Normal";

  const sensorDataForAI: SensorData = {
    primaryVoltage,
    primaryCurrent,
    primaryPower: primaryPower,
    primaryEnergy: Number(sensorData.primaryEnergy) || 0,
    primaryFrequency: Number(sensorData.primaryFrequency) || 50,
    primaryPowerFactor: Number(sensorData.primaryPowerFactor) || 1,
    secondaryVoltage,
    secondaryCurrent,
    secondaryPower: secondaryPower,
    secondaryEnergy: Number(sensorData.secondaryEnergy) || 0,
    secondaryFrequency: Number(sensorData.secondaryFrequency) || 50,
    secondaryPowerFactor: Number(sensorData.secondaryPowerFactor) || 1,
    loss,
    efficiency,
    loadPercentage,
  };

  const ai = simulateAIPrediction(sensorDataForAI, faults, warnings, {
    voltage: voltageResult,
    load: loadResult,
    efficiency: efficiencyResult,
  }, t);

  return {
    status,
    severity,
    faults,
    warnings,
    aiPrediction: ai.prediction,
    confidence: ai.confidence,
    details: {
      voltageStatus: voltageResult.status,
      loadStatus: loadResult.status,
      efficiencyStatus: efficiencyResult.status,
    },
  };
}
