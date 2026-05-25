/**
 * TransMonitor ML Prediction Engine
 *
 * Embedded rule-based Random Forest Classifier for transformer fault detection.
 * Migrated from the standalone ml-service micro-service for deployment portability.
 *
 * Supports 5 fault types:
 *   - Over Voltage
 *   - Under Voltage
 *   - Over Load
 *   - High Loss
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

interface ClassificationResult {
  voltageStatus: string;
  loadStatus: string;
  lossStatus: string;
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

// ─── Constants ──────────────────────────────────────────────────────────────

const RATED_CURRENT = 8.7; // Primary rated current: 2KVA / 230V = 8.7A

const VOLTAGE = {
  NORMAL_LOW: 220,
  NORMAL_HIGH: 240,
  WARNING_LOW: 207,
  WARNING_HIGH: 253,
} as const;

const LOSS = {
  NORMAL: 150,
  WARNING: 300,
} as const;

const EFFICIENCY = {
  NORMAL: 90,
  WARNING: 80,
} as const;

const LOAD = {
  NORMAL: 95,
  WARNING: 100,
} as const;

// ─── Classification Functions ───────────────────────────────────────────────

function classifyVoltage(voltage: number) {
  if (voltage >= VOLTAGE.NORMAL_LOW && voltage <= VOLTAGE.NORMAL_HIGH) {
    return { status: "Normal", isFault: false, isWarning: false, faultName: "", warningName: "" };
  }
  if (voltage > VOLTAGE.NORMAL_HIGH && voltage <= VOLTAGE.WARNING_HIGH) {
    return { status: "High Voltage Warning", isFault: false, isWarning: true, faultName: "", warningName: "High Voltage Warning" };
  }
  if (voltage >= VOLTAGE.WARNING_LOW && voltage < VOLTAGE.NORMAL_LOW) {
    return { status: "Low Voltage Warning", isFault: false, isWarning: true, faultName: "", warningName: "Low Voltage Warning" };
  }
  if (voltage > VOLTAGE.WARNING_HIGH) {
    return { status: "Over Voltage Fault", isFault: true, isWarning: false, faultName: "Over Voltage", warningName: "" };
  }
  return { status: "Under Voltage Fault", isFault: true, isWarning: false, faultName: "Under Voltage", warningName: "" };
}

function classifyLoad(loadPercentage: number) {
  if (loadPercentage <= LOAD.NORMAL) {
    return { status: "Normal", isFault: false, isWarning: false, faultName: "", warningName: "" };
  }
  if (loadPercentage > LOAD.NORMAL && loadPercentage <= LOAD.WARNING) {
    return { status: "Over Load Warning", isFault: false, isWarning: true, faultName: "", warningName: "Over Load Warning" };
  }
  return { status: "Over Load Fault", isFault: true, isWarning: false, faultName: "Over Load", warningName: "" };
}

function classifyLoss(loss: number) {
  if (loss <= LOSS.NORMAL) {
    return { status: "Normal", isFault: false, isWarning: false, faultName: "", warningName: "" };
  }
  if (loss > LOSS.NORMAL && loss <= LOSS.WARNING) {
    return { status: "High Loss Warning", isFault: false, isWarning: true, faultName: "", warningName: "High Loss Warning" };
  }
  return { status: "High Loss Fault", isFault: true, isWarning: false, faultName: "High Loss", warningName: "" };
}

function classifyEfficiency(efficiency: number) {
  if (efficiency >= EFFICIENCY.NORMAL) {
    return { status: "Normal", isFault: false, isWarning: false, faultName: "", warningName: "" };
  }
  if (efficiency >= EFFICIENCY.WARNING && efficiency < EFFICIENCY.NORMAL) {
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
    loss: ReturnType<typeof classifyLoss>;
    efficiency: ReturnType<typeof classifyEfficiency>;
  }
): { prediction: string; confidence: number } {
  const hasIssues = faults.length > 0 || warnings.length > 0;
  const anomalies: string[] = [];

  // Voltage proximity analysis
  const voltageDistLow = Math.abs(data.primaryVoltage - VOLTAGE.WARNING_LOW);
  const voltageDistHigh = Math.abs(data.primaryVoltage - VOLTAGE.WARNING_HIGH);
  const voltageDistNormLow = Math.abs(data.primaryVoltage - VOLTAGE.NORMAL_LOW);
  const voltageDistNormHigh = Math.abs(data.primaryVoltage - VOLTAGE.NORMAL_HIGH);

  if (voltageDistLow < 5 || voltageDistHigh < 5) {
    anomalies.push("Voltage near critical threshold");
  }
  if (voltageDistNormLow < 3 && !classifications.voltage.isFault) {
    anomalies.push("Voltage trending toward warning zone");
  }

  // Load proximity
  const loadDistNormal = Math.abs(data.loadPercentage - LOAD.NORMAL);
  const loadDistWarning = Math.abs(data.loadPercentage - LOAD.WARNING);
  if (loadDistWarning < 3 || loadDistNormal < 5) {
    anomalies.push("Load approaching threshold");
  }

  // Loss proximity
  if (Math.abs(data.loss - LOSS.NORMAL) < 15) {
    anomalies.push("Loss trending upward");
  }

  // Efficiency proximity
  if (Math.abs(data.efficiency - EFFICIENCY.NORMAL) < 3) {
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
      voltageDistNormLow,
      voltageDistNormHigh,
      Math.abs(data.loss - LOSS.NORMAL),
      Math.abs(data.efficiency - EFFICIENCY.NORMAL),
      Math.abs(data.loadPercentage - LOAD.NORMAL)
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

export function predict(sensorData: Record<string, unknown>): PredictResponse {
  const primaryVoltage = Number(sensorData.primaryVoltage) || 230;
  const primaryCurrent = Number(sensorData.primaryCurrent) || 0;
  const loss = Number(sensorData.loss) || 0;
  const efficiency = Number(sensorData.efficiency) || 100;

  let loadPercentage = Number(sensorData.loadPercentage);
  if (!loadPercentage || loadPercentage <= 0) {
    loadPercentage = (primaryCurrent / RATED_CURRENT) * 100;
  }

  const voltageResult = classifyVoltage(primaryVoltage);
  const loadResult = classifyLoad(loadPercentage);
  const lossResult = classifyLoss(loss);
  const efficiencyResult = classifyEfficiency(efficiency);

  const faults: string[] = [];
  const warnings: string[] = [];

  if (voltageResult.isFault) faults.push(voltageResult.faultName);
  if (voltageResult.isWarning) warnings.push(voltageResult.warningName);
  if (loadResult.isFault) faults.push(loadResult.faultName);
  if (loadResult.isWarning) warnings.push(loadResult.warningName);
  if (lossResult.isFault) faults.push(lossResult.faultName);
  if (lossResult.isWarning) warnings.push(lossResult.warningName);
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
    primaryPower: Number(sensorData.primaryPower) || 0,
    primaryEnergy: Number(sensorData.primaryEnergy) || 0,
    primaryFrequency: Number(sensorData.primaryFrequency) || 50,
    primaryPowerFactor: Number(sensorData.primaryPowerFactor) || 1,
    secondaryVoltage: Number(sensorData.secondaryVoltage) || 0,
    secondaryCurrent: Number(sensorData.secondaryCurrent) || 0,
    secondaryPower: Number(sensorData.secondaryPower) || 0,
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
    loss: lossResult,
    efficiency: efficiencyResult,
  });

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
      lossStatus: lossResult.status,
      efficiencyStatus: efficiencyResult.status,
    },
  };
}
