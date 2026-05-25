'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '@/lib/firebase';
import { useAppStore, type DataLogType } from '@/lib/store';
import { motion } from 'framer-motion';
import { Separator } from '@/components/ui/separator';
import { WifiOff } from 'lucide-react';

import StatusIndicator from '@/components/dashboard/StatusIndicator';
import ParameterGrid, { type Parameter } from '@/components/dashboard/ParameterGrid';
import FaultSummaryCards from '@/components/dashboard/FaultSummaryCards';
import EfficiencyCard from '@/components/dashboard/EfficiencyCard';
import LossCard from '@/components/dashboard/LossCard';
import LiveChart, { type ChartDataPoint } from '@/components/dashboard/LiveChart';
import FaultWarningPanel from '@/components/dashboard/FaultWarningPanel';
import LiveDataPreview, { type LiveDataRow } from '@/components/dashboard/LiveDataPreview';

// --- Fade-in animation wrapper ---
const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: 'easeOut' },
};

// Helper: all-zero params
const zeroParams: Parameter[] = [
  { label: 'Voltage', value: 0, unit: 'V' },
  { label: 'Current', value: 0, unit: 'A' },
  { label: 'Power', value: 0, unit: 'W' },
  { label: 'Energy', value: 0, unit: 'Wh' },
  { label: 'Frequency', value: 0, unit: 'Hz' },
  { label: 'Power Factor', value: 0, unit: 'PF' },
];

export default function DashboardPage() {
  const store = useAppStore();

  // Local state — start as OFFLINE until Firebase proves otherwise
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(true);
  const [liveTimestamp, setLiveTimestamp] = useState('');
  const [primaryParams, setPrimaryParams] = useState<Parameter[]>(zeroParams);
  const [secondaryParams, setSecondaryParams] = useState<Parameter[]>(zeroParams);
  const [efficiency, setEfficiency] = useState(0);
  const [loss, setLoss] = useState(0);
  const [lossStatus, setLossStatus] = useState('Normal');
  const [faults, setFaults] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [status, setStatus] = useState('Offline');
  const [severity, setSeverity] = useState('Normal');

  // Chart data (max 30 points)
  const [voltageChartData, setVoltageChartData] = useState<ChartDataPoint[]>([]);
  const [currentChartData, setCurrentChartData] = useState<ChartDataPoint[]>([]);
  const [powerChartData, setPowerChartData] = useState<ChartDataPoint[]>([]);

  // Live data table (max 10 rows)
  const [liveData, setLiveData] = useState<LiveDataRow[]>([]);

  // Refs
  const sensorDataRef = useRef<any>(null);
  const prevFaultsRef = useRef<string[]>([]);
  // Track Firebase data staleness: if data hasn't changed in 60s, ESP32 is offline
  const prevPrimaryDataRef = useRef<string>('');
  const prevSecondaryDataRef = useRef<string>('');
  const lastDataChangeTimeRef = useRef<number>(0);

  // --- Force offline: set all state to offline mode ---
  const forceOffline = useCallback(() => {
    setIsOffline(true);
    setStatus('Offline');
    setSeverity('Normal');
    setFaults([]);
    setWarnings([]);
    setEfficiency(0);
    setLoss(0);
    setLossStatus('Normal');
    setPrimaryParams(zeroParams);
    setSecondaryParams(zeroParams);
  }, []);

  // --- Live clock (every second) ---
  useEffect(() => {
    const updateClock = () => {
      setLiveTimestamp(new Date().toLocaleTimeString());
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // --- Staleness check: every second, if no data change in 60s → offline ---
  useEffect(() => {
    const interval = setInterval(() => {
      if (lastDataChangeTimeRef.current === 0) return; // haven't received any data yet
      const elapsed = Date.now() - lastDataChangeTimeRef.current;
      if (elapsed > 60000) {
        forceOffline();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [forceOffline]);

  // --- Firebase Realtime Database listeners ---
  useEffect(() => {
    let firebaseFired = false;

    const primaryRef = ref(database, 'primary');
    const secondaryRef = ref(database, 'seconday'); // Note: matches ESP32 Firebase path

    const unsubPrimary = onValue(
      primaryRef,
      (snapshot) => {
        const data = snapshot.val();
        if (!data) return; // Firebase has no data

        // Check if data actually changed (skip stale duplicate reads)
        const dataStr = JSON.stringify(data);
        if (dataStr === prevPrimaryDataRef.current) return;
        prevPrimaryDataRef.current = dataStr;

        // Data changed — mark as live
        lastDataChangeTimeRef.current = Date.now();
        firebaseFired = true;
        setLoading(false);

        sensorDataRef.current = {
          ...sensorDataRef.current,
          primaryVoltage: data.voltage ?? 0,
          primaryCurrent: data.current ?? 0,
          primaryPower: data.power ?? 0,
          primaryEnergy: data.energy ?? 0,
          primaryFrequency: data.frequency ?? 0,
          primaryPowerFactor: data.pf ?? data.powerFactor ?? 0,
        };
        setPrimaryParams([
          { label: 'Voltage', value: data.voltage ?? 0, unit: 'V' },
          { label: 'Current', value: data.current ?? 0, unit: 'A' },
          { label: 'Power', value: data.power ?? 0, unit: 'W' },
          { label: 'Energy', value: data.energy ?? 0, unit: 'Wh' },
          { label: 'Frequency', value: data.frequency ?? 0, unit: 'Hz' },
          { label: 'Power Factor', value: data.pf ?? data.powerFactor ?? 0, unit: 'PF' },
        ]);
      },
      (error) => {
        console.error('Firebase primary listener error:', error);
      }
    );

    const unsubSecondary = onValue(
      secondaryRef,
      (snapshot) => {
        const data = snapshot.val();
        if (!data) return;

        const dataStr = JSON.stringify(data);
        if (dataStr === prevSecondaryDataRef.current) return;
        prevSecondaryDataRef.current = dataStr;

        lastDataChangeTimeRef.current = Date.now();
        firebaseFired = true;
        setLoading(false);

        sensorDataRef.current = {
          ...sensorDataRef.current,
          secondaryVoltage: data.voltage ?? 0,
          secondaryCurrent: data.current ?? 0,
          secondaryPower: data.power ?? 0,
          secondaryEnergy: data.energy ?? 0,
          secondaryFrequency: data.frequency ?? 0,
          secondaryPowerFactor: data.pf ?? data.powerFactor ?? 0,
        };
        setSecondaryParams([
          { label: 'Voltage', value: data.voltage ?? 0, unit: 'V' },
          { label: 'Current', value: data.current ?? 0, unit: 'A' },
          { label: 'Power', value: data.power ?? 0, unit: 'W' },
          { label: 'Energy', value: data.energy ?? 0, unit: 'Wh' },
          { label: 'Frequency', value: data.frequency ?? 0, unit: 'Hz' },
          { label: 'Power Factor', value: data.pf ?? data.powerFactor ?? 0, unit: 'PF' },
        ]);
      },
      (error) => {
        console.error('Firebase secondary listener error:', error);
      }
    );

    // If no data at all from Firebase within 5s, confirm offline
    const timeout = setTimeout(() => {
      if (!firebaseFired) {
        forceOffline();
        setLoading(false);
      }
    }, 5000);

    return () => {
      unsubPrimary();
      unsubSecondary();
      clearTimeout(timeout);
    };
  }, [forceOffline]);

  // --- Prediction pipeline (every 2 seconds) ---
  const runPredictionPipeline = useCallback(async () => {
    // If stale (no data change in 60s), skip
    if (lastDataChangeTimeRef.current > 0) {
      const elapsed = Date.now() - lastDataChangeTimeRef.current;
      if (elapsed > 60000) {
        forceOffline();
        return;
      }
    }

    const sd = sensorDataRef.current;
    if (!sd) return;

    // Check if all critical parameters are 0 → offline
    const allZero =
      (sd.primaryVoltage ?? 0) === 0 &&
      (sd.primaryCurrent ?? 0) === 0 &&
      (sd.primaryPower ?? 0) === 0 &&
      (sd.secondaryVoltage ?? 0) === 0 &&
      (sd.secondaryCurrent ?? 0) === 0 &&
      (sd.secondaryPower ?? 0) === 0;

    if (allZero) {
      forceOffline();
      return;
    }

    // Transformer is online — set online status
    setIsOffline(false);

    const inputPower = sd.primaryPower ?? 0;
    const outputPower = sd.secondaryPower ?? 0;
    const calculatedLoss = inputPower - outputPower;
    const calculatedEfficiency = inputPower > 0 ? (outputPower / inputPower) * 100 : 0;

    setLoss(Math.max(0, calculatedLoss));
    setEfficiency(Math.min(100, Math.max(0, calculatedEfficiency)));

    if (calculatedLoss > 300) setLossStatus('Fault');
    else if (calculatedLoss > 150) setLossStatus('Warning');
    else setLossStatus('Normal');

    const payload = {
      primaryVoltage: sd.primaryVoltage ?? 0,
      primaryCurrent: sd.primaryCurrent ?? 0,
      primaryPower: sd.primaryPower ?? 0,
      secondaryVoltage: sd.secondaryVoltage ?? 0,
      secondaryCurrent: sd.secondaryCurrent ?? 0,
      secondaryPower: sd.secondaryPower ?? 0,
      loss: calculatedLoss,
      efficiency: calculatedEfficiency,
    };

    // --- Only update UI and log data when TRANSFORMER IS ONLINE ---
    const timeStr = new Date().toLocaleTimeString();

    // Update live data preview table (last 10 rows)
    setLiveData((prev) => {
      const newRow: LiveDataRow = {
        timestamp: timeStr,
        status: status,
        primaryV: sd.primaryVoltage ?? 0,
        secondaryV: sd.secondaryVoltage ?? 0,
        primaryI: sd.primaryCurrent ?? 0,
        secondaryI: sd.secondaryCurrent ?? 0,
        loss: calculatedLoss,
        efficiency: calculatedEfficiency,
      };
      return [newRow, ...prev].slice(0, 10);
    });

    // Update charts (last 30 points)
    setVoltageChartData((prev) => {
      const point: ChartDataPoint = {
        time: timeStr,
        primary: sd.primaryVoltage ?? 0,
        secondary: sd.secondaryVoltage ?? 0,
      };
      return [...prev, point].slice(-30);
    });

    setCurrentChartData((prev) => {
      const point: ChartDataPoint = {
        time: timeStr,
        primary: sd.primaryCurrent ?? 0,
        secondary: sd.secondaryCurrent ?? 0,
      };
      return [...prev, point].slice(-30);
    });

    setPowerChartData((prev) => {
      const point: ChartDataPoint = {
        time: timeStr,
        primary: sd.primaryPower ?? 0,
        secondary: sd.secondaryPower ?? 0,
      };
      return [...prev, point].slice(-30);
    });

    // Update store sensor data
    store.setSensorData({
      primaryVoltage: sd.primaryVoltage ?? 0,
      primaryCurrent: sd.primaryCurrent ?? 0,
      primaryPower: sd.primaryPower ?? 0,
      primaryEnergy: sd.primaryEnergy ?? 0,
      primaryFrequency: sd.primaryFrequency ?? 0,
      primaryPowerFactor: sd.primaryPowerFactor ?? 0,
      secondaryVoltage: sd.secondaryVoltage ?? 0,
      secondaryCurrent: sd.secondaryCurrent ?? 0,
      secondaryPower: sd.secondaryPower ?? 0,
      secondaryEnergy: sd.secondaryEnergy ?? 0,
      secondaryFrequency: sd.secondaryFrequency ?? 0,
      secondaryPowerFactor: sd.secondaryPowerFactor ?? 0,
      timestamp: new Date().toISOString(),
    });

    // Add to recent logs in store
    const logEntry: DataLogType = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      status: status,
      primaryVoltage: sd.primaryVoltage ?? 0,
      secondaryVoltage: sd.secondaryVoltage ?? 0,
      primaryCurrent: sd.primaryCurrent ?? 0,
      secondaryCurrent: sd.secondaryCurrent ?? 0,
      loss: calculatedLoss,
      efficiency: calculatedEfficiency,
      severity: severity,
    };
    store.addRecentLog(logEntry);

    // --- ML Prediction (best effort) + DB logging with fault type ---
    // Note: We only reach here if transformer is online (checks above returned early)
    // DB logging ONLY happens when ML prediction succeeds — offline NEVER logs
    try {
      const response = await fetch('/api/predict?XTransformPort=3003', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();

        if (result.success && result.data) {
          const pred = result.data;
          const predStatus = pred.status ?? 'Normal';
          const predFaults = pred.faults ?? [];
          const predWarnings = pred.warnings ?? [];
          const predSeverity = pred.severity ?? 'Normal';

          setStatus(predStatus);
          setFaults(predFaults);
          setWarnings(predWarnings);
          setSeverity(predSeverity);

          store.setPredictionResult({
            status: predStatus,
            faults: predFaults,
            warnings: predWarnings,
            severity: predSeverity,
          });

          const prevFaults = prevFaultsRef.current;
          const newFaults = predFaults.filter((f: string) => !prevFaults.includes(f));
          if (newFaults.length > 0) {
            store.addNotification({
              id: crypto.randomUUID(),
              type: 'fault',
              title: `Fault Detected: ${newFaults[0]}`,
              message: `${newFaults.length} new fault(s) detected by AI prediction`,
              severity: predSeverity as 'Low' | 'Medium' | 'High' | 'Normal',
              isRead: false,
              faults: predFaults,
              warnings: predWarnings,
              timestamp: new Date(),
            });
          }
          prevFaultsRef.current = predFaults;

          // Only persist to DB when ONLINE and ML prediction succeeded
          fetch('/api/data-logs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              primaryVoltage: sd.primaryVoltage ?? 0,
              primaryCurrent: sd.primaryCurrent ?? 0,
              primaryPower: sd.primaryPower ?? 0,
              primaryEnergy: sd.primaryEnergy ?? 0,
              primaryFrequency: sd.primaryFrequency ?? 0,
              primaryPowerFactor: sd.primaryPowerFactor ?? 0,
              secondaryVoltage: sd.secondaryVoltage ?? 0,
              secondaryCurrent: sd.secondaryCurrent ?? 0,
              secondaryPower: sd.secondaryPower ?? 0,
              secondaryEnergy: sd.secondaryEnergy ?? 0,
              secondaryFrequency: sd.secondaryFrequency ?? 0,
              secondaryPowerFactor: sd.secondaryPowerFactor ?? 0,
              loss: calculatedLoss,
              efficiency: calculatedEfficiency,
              status: predStatus,
              severity: predSeverity,
              faultType: predFaults.length > 0 ? predFaults.join(', ') : null,
              warnings: predWarnings.length > 0 ? JSON.stringify(predWarnings) : null,
            }),
          }).catch(() => {});
        }
      }
      // ML failed or no result — do NOT log to DB
    } catch (err) {
      console.error('Prediction pipeline error:', err);
      // do NOT log to DB on error
    }
  }, [store, forceOffline, status, severity]);

  // --- Run prediction pipeline every 2 seconds ---
  useEffect(() => {
    const interval = setInterval(runPredictionPipeline, 2000);
    return () => clearInterval(interval);
  }, [runPredictionPipeline]);

  return (
    <div className="flex flex-col gap-6">
      {/* Title Section */}
      <motion.div {...fadeIn}>
        <h1 className="text-2xl font-medium text-foreground">Fault & Warning Analysis</h1>
        <p className="text-sm text-muted-foreground font-medium mt-1">
          Real-time transformer monitoring with AI-powered fault detection
        </p>
      </motion.div>

      <Separator />

      {/* Offline Banner */}
      {isOffline && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/30"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50">
            <WifiOff className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-red-700 dark:text-red-300">
              Transformer Offline
            </span>
            <span className="text-xs text-red-600/80 dark:text-red-400/80">
              No live data received from Firebase. All parameters are set to 0. Data logging is paused.
            </span>
          </div>
        </motion.div>
      )}

      {/* Row 1: Detected Faults & Warnings — TOP */}
      <motion.div {...fadeIn} transition={{ ...fadeIn.transition, delay: 0.05 }}>
        <FaultWarningPanel faults={faults} warnings={warnings} loading={loading} />
      </motion.div>

      {/* Row 2: Connection Status & Summary */}
      <motion.div {...fadeIn} transition={{ ...fadeIn.transition, delay: 0.08 }}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-2">
          <StatusIndicator timestamp={liveTimestamp} isOffline={isOffline} />
        </div>
        <FaultSummaryCards
          status={status}
          faultCount={faults.length}
          warningCount={warnings.length}
          severity={severity}
          loading={loading}
        />
      </motion.div>

      {/* Row 3: Parameter Display */}
      <motion.div
        className="grid grid-cols-1 gap-4 lg:grid-cols-2"
        {...fadeIn}
        transition={{ ...fadeIn.transition, delay: 0.1 }}
      >
        <ParameterGrid title="Primary Side (Input)" parameters={primaryParams} loading={loading} />
        <ParameterGrid title="Secondary Side (Output)" parameters={secondaryParams} loading={loading} />
      </motion.div>

      {/* Row 4: Efficiency & Loss */}
      <motion.div
        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        {...fadeIn}
        transition={{ ...fadeIn.transition, delay: 0.15 }}
      >
        <EfficiencyCard efficiency={efficiency} loading={loading} />
        <LossCard loss={loss} status={lossStatus} loading={loading} />
      </motion.div>

      {/* Row 5: Live Charts */}
      <motion.div
        className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3"
        {...fadeIn}
        transition={{ ...fadeIn.transition, delay: 0.2 }}
      >
        <LiveChart
          title="Voltage Trend"
          data={voltageChartData}
          primaryLabel="Primary Voltage"
          secondaryLabel="Secondary Voltage"
          yUnit="V"
          loading={loading}
        />
        <LiveChart
          title="Current Trend"
          data={currentChartData}
          primaryLabel="Primary Current"
          secondaryLabel="Secondary Current"
          yUnit="A"
          loading={loading}
        />
        <LiveChart
          title="Power Trend"
          data={powerChartData}
          primaryLabel="Primary Power"
          secondaryLabel="Secondary Power"
          yUnit="W"
          loading={loading}
        />
      </motion.div>

      {/* Row 6: Live Data Table */}
      <motion.div {...fadeIn} transition={{ ...fadeIn.transition, delay: 0.25 }}>
        <LiveDataPreview data={liveData} loading={loading} />
      </motion.div>
    </div>
  );
}
