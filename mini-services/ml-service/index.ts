/**
 * TransMonitor ML Prediction Service
 *
 * Simulated Random Forest Classifier for transformer fault detection.
 * Uses rule-based classification with AI-enhanced confidence scoring.
 *
 * Port: 3003
 * Endpoints:
 *   POST /predict  — Transformer fault prediction
 *   GET  /health   — Service health check
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

interface PredictResponse {
  status: "Normal" | "Warning" | "Fault";
  severity: "Normal" | "Low" | "Medium" | "High";
  faults: string[];
  warnings: string[];
  aiPrediction: string;
  confidence: number;
  details: ClassificationResult;
}

interface HealthResponse {
  status: string;
  service: string;
  model: string;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const RATED_CURRENT = 8.7; // Primary rated current: 2KVA / 230V = 8.7A

// Voltage thresholds
const VOLTAGE = {
  NORMAL_LOW: 220,
  NORMAL_HIGH: 240,
  WARNING_LOW: 207,
  WARNING_HIGH: 253,
} as const;

// Loss thresholds (Watts)
const LOSS = {
  NORMAL: 150,
  WARNING: 300,
} as const;

// Efficiency thresholds (%)
const EFFICIENCY = {
  NORMAL: 90,
  WARNING: 80,
} as const;

// Load thresholds (%)
const LOAD = {
  NORMAL: 95,
  WARNING: 100,
} as const;

// ─── Classification Functions ───────────────────────────────────────────────

/**
 * Classify voltage based on primaryVoltage.
 * Returns [status string, isFault boolean, isWarning boolean, faultName]
 */
function classifyVoltage(voltage: number): {
  status: string;
  isFault: boolean;
  isWarning: boolean;
  faultName: string;
  warningName: string;
} {
  if (voltage >= VOLTAGE.NORMAL_LOW && voltage <= VOLTAGE.NORMAL_HIGH) {
    return {
      status: "Normal",
      isFault: false,
      isWarning: false,
      faultName: "",
      warningName: "",
    };
  }
  if (voltage > VOLTAGE.NORMAL_HIGH && voltage <= VOLTAGE.WARNING_HIGH) {
    return {
      status: "High Voltage Warning",
      isFault: false,
      isWarning: true,
      faultName: "",
      warningName: "High Voltage Warning",
    };
  }
  if (voltage >= VOLTAGE.WARNING_LOW && voltage < VOLTAGE.NORMAL_LOW) {
    return {
      status: "Low Voltage Warning",
      isFault: false,
      isWarning: true,
      faultName: "",
      warningName: "Low Voltage Warning",
    };
  }
  if (voltage > VOLTAGE.WARNING_HIGH) {
    return {
      status: "Over Voltage Fault",
      isFault: true,
      isWarning: false,
      faultName: "Over Voltage",
      warningName: "",
    };
  }
  // voltage < WARNING_LOW
  return {
    status: "Under Voltage Fault",
    isFault: true,
    isWarning: false,
    faultName: "Under Voltage",
    warningName: "",
  };
}

/**
 * Classify load based on loadPercentage.
 * Note: loadPercentage can be provided directly or calculated from primaryCurrent.
 */
function classifyLoad(loadPercentage: number): {
  status: string;
  isFault: boolean;
  isWarning: boolean;
  faultName: string;
  warningName: string;
} {
  if (loadPercentage <= LOAD.NORMAL) {
    return {
      status: "Normal",
      isFault: false,
      isWarning: false,
      faultName: "",
      warningName: "",
    };
  }
  if (loadPercentage > LOAD.NORMAL && loadPercentage <= LOAD.WARNING) {
    return {
      status: "Over Load Warning",
      isFault: false,
      isWarning: true,
      faultName: "",
      warningName: "Over Load Warning",
    };
  }
  // > 100%
  return {
    status: "Over Load Fault",
    isFault: true,
    isWarning: false,
    faultName: "Over Load",
    warningName: "",
  };
}

/**
 * Classify transformer loss.
 */
function classifyLoss(loss: number): {
  status: string;
  isFault: boolean;
  isWarning: boolean;
  faultName: string;
  warningName: string;
} {
  if (loss <= LOSS.NORMAL) {
    return {
      status: "Normal",
      isFault: false,
      isWarning: false,
      faultName: "",
      warningName: "",
    };
  }
  if (loss > LOSS.NORMAL && loss <= LOSS.WARNING) {
    return {
      status: "High Loss Warning",
      isFault: false,
      isWarning: true,
      faultName: "",
      warningName: "High Loss Warning",
    };
  }
  // > 300W
  return {
    status: "High Loss Fault",
    isFault: true,
    isWarning: false,
    faultName: "High Loss",
    warningName: "",
  };
}

/**
 * Classify efficiency.
 */
function classifyEfficiency(efficiency: number): {
  status: string;
  isFault: boolean;
  isWarning: boolean;
  faultName: string;
  warningName: string;
} {
  if (efficiency >= EFFICIENCY.NORMAL) {
    return {
      status: "Normal",
      isFault: false,
      isWarning: false,
      faultName: "",
      warningName: "",
    };
  }
  if (efficiency >= EFFICIENCY.WARNING && efficiency < EFFICIENCY.NORMAL) {
    return {
      status: "Low Efficiency Warning",
      isFault: false,
      isWarning: true,
      faultName: "",
      warningName: "Low Efficiency Warning",
    };
  }
  // < 80%
  return {
    status: "Low Efficiency Fault",
    isFault: true,
    isWarning: false,
    faultName: "Low Efficiency",
    warningName: "",
  };
}

// ─── AI Enhancement (Simulated) ────────────────────────────────────────────

/**
 * Simulate AI anomaly detection by checking proximity to thresholds.
 * Returns a confidence score and potential AI-detected issues.
 */
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

  // Check how close parameters are to thresholds (anomaly proximity)
  const anomalies: string[] = [];

  // Voltage proximity analysis
  const voltageDistLow = Math.abs(data.primaryVoltage - VOLTAGE.WARNING_LOW);
  const voltageDistHigh = Math.abs(data.primaryVoltage - VOLTAGE.WARNING_HIGH);
  const voltageDistNormLow = Math.abs(data.primaryVoltage - VOLTAGE.NORMAL_LOW);
  const voltageDistNormHigh = Math.abs(data.primaryVoltage - VOLTAGE.NORMAL_HIGH);

  if (voltageDistLow < 5 || voltageDistHigh < 5) {
    anomalies.push("Voltage near critical threshold");
  }
  if (
    voltageDistNormLow < 3 &&
    !classifications.voltage.isFault
  ) {
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
    // Normal case: 0.85–0.99, higher when far from thresholds
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
    // Fault/warning case: 0.80–0.95
    const severityFactor = faults.length * 0.05;
    confidence = Math.min(0.95, 0.80 + severityFactor + Math.random() * 0.10);
  }

  // Add slight randomness for simulated ML behavior
  confidence = Math.min(0.99, confidence + (Math.random() - 0.5) * 0.03);
  confidence = Math.max(hasIssues ? 0.75 : 0.80, confidence);

  return {
    prediction,
    confidence: Math.round(confidence * 100) / 100,
  };
}

// ─── Main Prediction Logic ─────────────────────────────────────────────────

function predict(sensorData: Record<string, unknown>): PredictResponse {
  // Extract and validate fields
  const primaryVoltage = Number(sensorData.primaryVoltage) || 230;
  const primaryCurrent = Number(sensorData.primaryCurrent) || 0;
  const loss = Number(sensorData.loss) || 0;
  const efficiency = Number(sensorData.efficiency) || 100;

  // Calculate load percentage if not provided or override with calculation
  let loadPercentage = Number(sensorData.loadPercentage);
  if (!loadPercentage || loadPercentage <= 0) {
    loadPercentage = (primaryCurrent / RATED_CURRENT) * 100;
  }

  // Classify each parameter
  const voltageResult = classifyVoltage(primaryVoltage);
  const loadResult = classifyLoad(loadPercentage);
  const lossResult = classifyLoss(loss);
  const efficiencyResult = classifyEfficiency(efficiency);

  // Gather faults and warnings
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

  // Determine overall status
  let status: "Normal" | "Warning" | "Fault";
  if (faults.length > 0) {
    status = "Fault";
  } else if (warnings.length > 0) {
    status = "Warning";
  } else {
    status = "Normal";
  }

  // Determine severity
  let severity: "Normal" | "Low" | "Medium" | "High";
  if (faults.length >= 2) {
    severity = "High";
  } else if (faults.length === 1) {
    severity = "Medium";
  } else if (warnings.length > 0) {
    severity = "Low";
  } else {
    severity = "Normal";
  }

  // AI prediction enhancement
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

// ─── HTTP Server ────────────────────────────────────────────────────────────

const PORT = 3003;

console.log(`[ML Service] Starting TransMonitor ML Prediction Service on port ${PORT}...`);

const server = Bun.serve({
  hostname: "0.0.0.0",
  port: PORT,

  fetch(req: Request): Response {
    const url = new URL(req.url);
    const method = req.method;
    const path = url.pathname;

    // Log request
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${method} ${path}`);

    // CORS headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    // Handle CORS preflight
    if (method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // ── Health Check ──
    if (path === "/health" && method === "GET") {
      const body: HealthResponse = {
        status: "ok",
        service: "ml-service",
        model: "RandomForestClassifier",
      };
      return new Response(JSON.stringify(body), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // ── Predict ──
    if (path === "/predict" && method === "POST") {
      return req.json().then((data: Record<string, unknown>) => {
        try {
          const result = predict(data);
          console.log(
            `[${timestamp}] Prediction: status=${result.status}, severity=${result.severity}, faults=[${result.faults.join(", ")}], confidence=${result.confidence}`
          );
          return new Response(JSON.stringify(result), {
            status: 200,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          });
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : "Unknown prediction error";
          console.error(`[${timestamp}] Prediction error: ${errorMsg}`);
          return new Response(
            JSON.stringify({ error: "Prediction failed", message: errorMsg }),
            {
              status: 500,
              headers: { "Content-Type": "application/json", ...corsHeaders },
            }
          );
        }
      }).catch((parseErr: unknown) => {
        const errorMsg = parseErr instanceof Error ? parseErr.message : "Invalid JSON body";
        console.error(`[${timestamp}] JSON parse error: ${errorMsg}`);
        return new Response(
          JSON.stringify({ error: "Invalid request body", message: errorMsg }),
          {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      });
    }

    // ── 404 Not Found ──
    return new Response(
      JSON.stringify({
        error: "Not Found",
        message: `Cannot ${method} ${path}`,
        availableEndpoints: ["/health (GET)", "/predict (POST)"],
      }),
      {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  },
});

console.log(`[ML Service] ✅ Server running at http://localhost:${PORT}`);
console.log(`[ML Service] Endpoints:`);
console.log(`[ML Service]   GET  /health  — Service health check`);
console.log(`[ML Service]   POST /predict — Transformer fault prediction`);
