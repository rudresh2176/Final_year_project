'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '@/lib/firebase';
import { useAppStore, type DataLogType, type TransformerConfig } from '@/lib/store';
import { motion } from 'framer-motion';
import { Separator } from '@/components/ui/separator';
import { WifiOff, Building2 } from 'lucide-react';
import ConfigModal from '@/components/config/ConfigModal';

import StatusIndicator from '@/components/dashboard/StatusIndicator';
import ParameterGrid, { type Parameter } from '@/components/dashboard/ParameterGrid';
import FaultSummaryCards from '@/components/dashboard/FaultSummaryCards';
import EfficiencyCard from '@/components/dashboard/EfficiencyCard';
import LossCard from '@/components/dashboard/LossCard';
import LiveChart, { type ChartDataPoint } from '@/components/dashboard/LiveChart';
import FaultWarningPanel from '@/components/dashboard/FaultWarningPanel';
import LiveDataPreview, { type LiveDataRow } from '@/components/dashboard/LiveDataPreview';
import TransformerProfileCard from '@/components/dashboard/TransformerProfileCard';

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

// Default state before config
function NotConfiguredState({ onOpenConfig }: { onOpenConfig: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-20">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
        <Building2 className="h-8 w-8 text-slate-400 dark:text-slate-500" />
      </div>
      <div className="text-center">
        <h2 className="text-lg font-medium text-foreground mb-1">No Transformer Configured</h2>
        <p className="text-sm text-muted-foreground max-w-md">
          Please configure transformer specifications to start monitoring.
        </p>
      </div>
      <button
        onClick={onOpenConfig}
        className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        Configure Transformer
      </button>
    </div>
  );
}

export default function DashboardPage() {
  const store = useAppStore();

  // Transformer config
  const config = store.transformerConfig;

  // Local state — start as OFFLINE until Firebase proves otherwise
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(true);
  const [liveTimestamp, setLiveTimestamp] = useState('');
  const [primaryParams, setPrimaryParams] = useState<Parameter[]>(zeroParams);
  const [secondaryParams, setSecondaryParams] = useState<Parameter[]>(zeroParams);
  const [efficiency, setEfficiency] = useState(0);
  const [loss, setLoss] = useState(0);
  const [lossPercentage, setLossPercentage] = useState(0);
  const [lossStatus, setLossStatus] = useState('Normal');
  const [loadPercentage, setLoadPercentage] = useState(0);
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

  // Config modal state — only show if no config; auto-close when config hydrates
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Show config modal on mount if not configured
  useEffect(() => {
    if (!config) {
      setShowConfigModal(true);
    } else {
      setShowConfigModal(false); // Auto-close when config hydrates from localStorage
    }
  }, [config]);

  // Refs
  const sensorDataRef = useRef<any>(null);
  const prevFaultsRef = useRef<string[]>([]);
  const prevPrimaryDataRef = useRef<string>('');
  const prevSecondaryDataRef = useRef<string>('');
  const lastDataChangeTimeRef = useRef<number>(0);
  const isOfflineRef = useRef<boolean>(true);
  const configRef = useRef<TransformerConfig | null>(config);

  // Keep configRef in sync
  useEffect(() => {
    configRef.current = config;
  }, [config]);

  // --- Force offline: set system to offline mode ---
  // NOTE: We do NOT reset primaryParams/secondaryParams here because they show
  // the last known sensor readings from Firebase. Resetting them would cause a
  // bug where static Firebase data can't restore the display (prevDataRef would
  // skip identical re-reads). Only calculated/derived values are reset.
  const forceOffline = useCallback(() => {
    isOfflineRef.current = true;
    setIsOffline(true);
    setStatus('Offline');
    setSeverity('Normal');
    setFaults([]);
    setWarnings([]);
    setEfficiency(0);
    setLoss(0);
    setLossPercentage(0);
    setLossStatus('Normal');
    setLoadPercentage(0);
    // Clear data-change tracking refs so Firebase can re-trigger data restore
    prevPrimaryDataRef.current = '';
    prevSecondaryDataRef.current = '';
    // Clear live data table and charts (these are time-series, not last-known values)
    setLiveData([]);
    setVoltageChartData([]);
    setCurrentChartData([]);
    setPowerChartData([]);
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
      if (lastDataChangeTimeRef.current === 0) return;
      if (isOfflineRef.current) return; // Already offline, don't re-trigger
      const elapsed = Date.now() - lastDataChangeTimeRef.current;
      if (elapsed > 60000) {
        forceOffline();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [forceOffline]);

  // --- Firebase Realtime Database listeners ---
  useEffect(() => {
    if (!config) return; // Don't listen until transformer is configured

    // CRITICAL: Reset dedup refs when effect re-runs so the first onValue
    // trigger always passes through (even if data hasn't changed since last run).
    // Without this, a re-attach after config change would skip static secondary data.
    prevPrimaryDataRef.current = '';
    prevSecondaryDataRef.current = '';

    let primaryFired = false;
    let secondaryFired = false;

    const primaryRef = ref(database, 'primary');
    const secondaryRef = ref(database, 'secondary');

    const handlePrimaryData = (data: any) => {
      primaryFired = true;

      lastDataChangeTimeRef.current = Date.now();
      setLoading(false);
      isOfflineRef.current = false;
      setIsOffline(false);

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
    };

    const handleSecondaryData = (data: any) => {
      secondaryFired = true;

      lastDataChangeTimeRef.current = Date.now();
      setLoading(false);
      isOfflineRef.current = false;
      setIsOffline(false);

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
    };

    const unsubPrimary = onValue(
      primaryRef,
      (snapshot) => {
        const data = snapshot.val();
        if (!data) return;

        const dataStr = JSON.stringify(data);
        if (dataStr === prevPrimaryDataRef.current) return;
        prevPrimaryDataRef.current = dataStr;

        console.log('[Firebase Primary] Data received:', data);
        handlePrimaryData(data);
      },
      (error) => {
        console.error('Firebase primary listener error:', error);
      }
    );

    const unsubSecondary = onValue(
      secondaryRef,
      (snapshot) => {
        const data = snapshot.val();
        console.log('[Firebase Secondary] Raw snapshot.val():', data);
        if (!data) {
          console.log('[Firebase Secondary] No data at /secondary path');
          return;
        }

        const dataStr = JSON.stringify(data);
        if (dataStr === prevSecondaryDataRef.current) {
          console.log('[Firebase Secondary] Data unchanged, skipping dedup');
          return;
        }
        prevSecondaryDataRef.current = dataStr;

        console.log('[Firebase Secondary] Processing new data:', data);
        handleSecondaryData(data);
      },
      (error) => {
        console.error('Firebase secondary listener error:', error);
      }
    );

    // If no data from Firebase within 5s, confirm offline.
    // Also do a one-time get() fallback for any side that didn't fire.
    const timeout = setTimeout(async () => {
      if (!primaryFired && !secondaryFired) {
        forceOffline();
        setLoading(false);
      }

      // Fallback: If secondary didn't fire via onValue, do a direct read.
      // This handles edge cases where onValue skips the initial fire.
      if (!secondaryFired) {
        console.log('[Firebase Fallback] Secondary onValue never fired, doing direct get()...');
        try {
          const { get } = await import('firebase/database');
          const snapshot = await get(secondaryRef);
          const data = snapshot.val();
          console.log('[Firebase Fallback] Secondary get() result:', data);
          if (data) {
            prevSecondaryDataRef.current = JSON.stringify(data);
            handleSecondaryData(data);
          }
        } catch (err) {
          console.error('[Firebase Fallback] Secondary get() error:', err);
        }
      }
    }, 3000);

    return () => {
      unsubPrimary();
      unsubSecondary();
      clearTimeout(timeout);
    };
  }, [config, forceOffline]);

  // --- Prediction pipeline (every 2 seconds) ---
  const runPredictionPipeline = useCallback(async () => {
    const currentConfig = configRef.current;

    // GATE 1: No transformer configured
    if (!currentConfig) return;

    // GATE 2: If system is offline, do NOTHING
    if (isOfflineRef.current) {
      return;
    }

    // GATE 3: Staleness check
    if (lastDataChangeTimeRef.current > 0) {
      const elapsed = Date.now() - lastDataChangeTimeRef.current;
      if (elapsed > 60000) {
        forceOffline();
        return;
      }
    }

    const sd = sensorDataRef.current;
    if (!sd) return;

    // GATE 4: Check if all critical parameters are 0 → offline
    const allZero =
      (sd.primaryVoltage ?? 0) === 0 &&
      (sd.primaryCurrent ?? 0) === 0 &&
      (sd.secondaryVoltage ?? 0) === 0 &&
      (sd.secondaryCurrent ?? 0) === 0;

    if (allZero) {
      forceOffline();
      return;
    }

    // Transformer is online — confirm online status
    isOfflineRef.current = false;
    setIsOffline(false);

    // --- DYNAMIC CALCULATIONS based on transformer config ---
    const pf = sd.primaryPowerFactor ?? 1;
    const inputPower = sd.primaryVoltage * sd.primaryCurrent * pf; // Pin = Vp × Ip × PF
    const outputPower = sd.secondaryVoltage * sd.secondaryCurrent * (sd.secondaryPowerFactor ?? 1); // Pout = Vs × Is × PF
    const calculatedLoss = inputPower - outputPower; // Loss = Pin − Pout
    const calculatedEfficiency = inputPower > 0 ? (outputPower / inputPower) * 100 : 0; // Eff = (Pout/Pin)×100
    const calculatedLossPercentage = inputPower > 0 ? (calculatedLoss / inputPower) * 100 : 0; // Loss% = ((Pin-Pout)/Pin)×100
    const calculatedLoadPercentage = currentConfig.ratedPrimaryCurrent > 0
      ? (sd.primaryCurrent / currentConfig.ratedPrimaryCurrent) * 100 // Load% = (Iactual / Irated)×100
      : 0;

    setLoss(Math.max(0, calculatedLoss));
    setEfficiency(Math.min(100, Math.max(0, calculatedEfficiency)));
    setLossPercentage(Math.max(0, calculatedLossPercentage));
    setLoadPercentage(calculatedLoadPercentage);

    if (calculatedLossPercentage > 10) setLossStatus('Fault');
    else if (calculatedLossPercentage > 5) setLossStatus('Warning');
    else setLossStatus('Normal');

    const payload = {
      primaryVoltage: sd.primaryVoltage ?? 0,
      primaryCurrent: sd.primaryCurrent ?? 0,
      primaryPower: inputPower,
      secondaryVoltage: sd.secondaryVoltage ?? 0,
      secondaryCurrent: sd.secondaryCurrent ?? 0,
      secondaryPower: outputPower,
      loss: calculatedLoss,
      efficiency: calculatedEfficiency,
      lossPercentage: calculatedLossPercentage,
      loadPercentage: calculatedLoadPercentage,
      primaryEnergy: sd.primaryEnergy ?? 0,
      primaryFrequency: sd.primaryFrequency ?? 0,
      primaryPowerFactor: pf,
      secondaryEnergy: sd.secondaryEnergy ?? 0,
      secondaryFrequency: sd.secondaryFrequency ?? 0,
      secondaryPowerFactor: sd.secondaryPowerFactor ?? 1,
      // Pass transformer thresholds for dynamic fault detection
      thresholds: {
        kva: currentConfig.kva,
        primaryVoltage: currentConfig.primaryVoltage,
        secondaryVoltage: currentConfig.secondaryVoltage,
        ratedPrimaryCurrent: currentConfig.ratedPrimaryCurrent,
        ratedSecondaryCurrent: currentConfig.ratedSecondaryCurrent,
        primaryVoltageLower: currentConfig.primaryVoltageLower,
        primaryVoltageUpper: currentConfig.primaryVoltageUpper,
        secondaryVoltageLower: currentConfig.secondaryVoltageLower,
        secondaryVoltageUpper: currentConfig.secondaryVoltageUpper,
      },
    };

    // --- Only update UI and log data when TRANSFORMER IS ONLINE ---
    const timeStr = new Date().toLocaleTimeString();

    // Update live data preview table (last 10 rows)
    setLiveData((prev) => {
      if (isOfflineRef.current) return prev;
      const newRow: LiveDataRow = {
        timestamp: timeStr,
        status: status === 'Offline' ? 'Online' : status,
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
      if (isOfflineRef.current) return prev;
      const point: ChartDataPoint = {
        time: timeStr,
        primary: sd.primaryVoltage ?? 0,
        secondary: sd.secondaryVoltage ?? 0,
      };
      return [...prev, point].slice(-30);
    });

    setCurrentChartData((prev) => {
      if (isOfflineRef.current) return prev;
      const point: ChartDataPoint = {
        time: timeStr,
        primary: sd.primaryCurrent ?? 0,
        secondary: sd.secondaryCurrent ?? 0,
      };
      return [...prev, point].slice(-30);
    });

    setPowerChartData((prev) => {
      if (isOfflineRef.current) return prev;
      const point: ChartDataPoint = {
        time: timeStr,
        primary: inputPower,
        secondary: outputPower,
      };
      return [...prev, point].slice(-30);
    });

    // Update store sensor data
    store.setSensorData({
      primaryVoltage: sd.primaryVoltage ?? 0,
      primaryCurrent: sd.primaryCurrent ?? 0,
      primaryPower: inputPower,
      primaryEnergy: sd.primaryEnergy ?? 0,
      primaryFrequency: sd.primaryFrequency ?? 0,
      primaryPowerFactor: pf,
      secondaryVoltage: sd.secondaryVoltage ?? 0,
      secondaryCurrent: sd.secondaryCurrent ?? 0,
      secondaryPower: outputPower,
      secondaryEnergy: sd.secondaryEnergy ?? 0,
      secondaryFrequency: sd.secondaryFrequency ?? 0,
      secondaryPowerFactor: sd.secondaryPowerFactor ?? 1,
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

    // --- ML Prediction (best effort) + DB logging ---
    try {
      const response = await fetch('/api/predict', {
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

          // CRITICAL: Re-check offline state INSIDE async callback
          if (isOfflineRef.current) {
            console.log('[Pipeline] Skipping DB log — system went offline during ML prediction');
            return;
          }

          // Only persist to DB when ONLINE and ML prediction succeeded
          fetch('/api/data-logs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              transformerId: currentConfig.transformerName ? `TX${String(currentConfig.transformerName).padStart(3, '0')}` : 'TX001',
              transformerName: currentConfig.transformerName || 'Unknown',
              location: currentConfig.location || 'N/A',
              kva: currentConfig.kva || 0,
              primaryVoltage: sd.primaryVoltage ?? 0,
              primaryCurrent: sd.primaryCurrent ?? 0,
              primaryPower: inputPower,
              primaryEnergy: sd.primaryEnergy ?? 0,
              primaryFrequency: sd.primaryFrequency ?? 0,
              primaryPowerFactor: pf,
              secondaryVoltage: sd.secondaryVoltage ?? 0,
              secondaryCurrent: sd.secondaryCurrent ?? 0,
              secondaryPower: outputPower,
              secondaryEnergy: sd.secondaryEnergy ?? 0,
              secondaryFrequency: sd.secondaryFrequency ?? 0,
              secondaryPowerFactor: sd.secondaryPowerFactor ?? 1,
              loss: calculatedLoss,
              lossPercentage: calculatedLossPercentage,
              loadPercentage: calculatedLoadPercentage,
              efficiency: calculatedEfficiency,
              status: predStatus,
              severity: predSeverity,
              faultType: predFaults.length > 0 ? predFaults.join(', ') : null,
              warnings: predWarnings.length > 0 ? JSON.stringify(predWarnings) : null,
            }),
          }).catch(() => {});
        }
      }
      if (isOfflineRef.current) return;
    } catch (err) {
      console.error('Prediction pipeline error:', err);
    }
  }, [store, forceOffline, status, severity]);

  // --- Run prediction pipeline every 2 seconds ---
  useEffect(() => {
    if (!config) return; // Don't run pipeline until configured
    const interval = setInterval(runPredictionPipeline, 2000);
    return () => clearInterval(interval);
  }, [runPredictionPipeline, config]);

  // --- If no config, show NotConfigured state ---
  if (!config) {
    return (
      <div className="flex flex-col gap-6">
        <motion.div {...fadeIn}>
          <h1 className="text-2xl font-medium text-foreground">Fault & Warning Analysis</h1>
          <p className="text-sm text-muted-foreground font-medium mt-1">
            Real-time transformer monitoring with AI-powered fault detection
          </p>
        </motion.div>
        <Separator />
        <NotConfiguredState onOpenConfig={() => setShowConfigModal(true)} />
        <ConfigModal isOpen={showConfigModal} onClose={() => setShowConfigModal(false)} />
      </div>
    );
  }

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

      {/* Row 0: Transformer Profile Card */}
      <motion.div {...fadeIn} transition={{ ...fadeIn.transition, delay: 0.02 }}>
        <TransformerProfileCard
          config={config}
          isOffline={isOffline}
          onChangeTransformer={() => setShowConfigModal(true)}
        />
      </motion.div>

      {/* Row 1: Detected Faults & Warnings */}
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

      {/* Row 4: Efficiency, Loss, Load Percentage */}
      <motion.div
        className="grid grid-cols-1 gap-4 sm:grid-cols-3"
        {...fadeIn}
        transition={{ ...fadeIn.transition, delay: 0.15 }}
      >
        <EfficiencyCard efficiency={efficiency} loading={loading} />
        <LossCard loss={loss} lossPercentage={lossPercentage} status={lossStatus} loading={loading} />
        <LoadPercentageCard loadPercentage={loadPercentage} ratedCurrent={config.ratedPrimaryCurrent} loading={loading} />
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
          primaryLabel="Input Power"
          secondaryLabel="Output Power"
          yUnit="W"
          loading={loading}
        />
      </motion.div>

      {/* Row 6: Live Data Table */}
      <motion.div {...fadeIn} transition={{ ...fadeIn.transition, delay: 0.25 }}>
        <LiveDataPreview data={liveData} loading={loading} />
      </motion.div>

      {/* Config Modal (for reconfiguring) */}
      <ConfigModal isOpen={showConfigModal} onClose={() => setShowConfigModal(false)} isReconfigure />
    </div>
  );
}

// --- Load Percentage Card (new) ---

function LoadPercentageCard({
  loadPercentage,
  ratedCurrent,
  loading,
}: {
  loadPercentage: number;
  ratedCurrent: number;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="rounded-xl border bg-card py-4 px-6">
        <div className="text-xs text-muted-foreground font-medium mb-2">Load Percentage</div>
        <div className="h-10 w-24 mb-2 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  function loadColor(lp: number) {
    if (lp <= 95) return 'text-green-600 dark:text-green-400';
    if (lp <= 100) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  }

  function loadProgressColor(lp: number) {
    if (lp <= 95) return '[&>div]:bg-green-500';
    if (lp <= 100) return '[&>div]:bg-amber-500';
    return '[&>div]:bg-red-500';
  }

  function loadLabel(lp: number) {
    if (lp <= 95) return 'Normal';
    if (lp <= 100) return 'Warning';
    return 'Overload';
  }

  function loadBadgeColor(lp: number) {
    if (lp <= 95) return 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300 border-green-200 dark:border-green-800';
    if (lp <= 100) return 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800';
    return 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300 border-red-200 dark:border-red-800';
  }

  return (
    <div className="rounded-xl border bg-card py-4 px-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">Load Percentage</span>
        <span className={`text-[10px] px-1.5 py-0.5 rounded-md border ${loadBadgeColor(loadPercentage)}`}>
          {loadLabel(loadPercentage)}
        </span>
      </div>
      <div className={`text-3xl font-medium mb-2 ${loadColor(loadPercentage)}`}>
        {loadPercentage.toFixed(1)}%
      </div>
      <div className={`mb-3 ${loadProgressColor(loadPercentage)}`}>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-current transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(0, loadPercentage))}%` }}
          />
        </div>
      </div>
      <div className="text-xs text-muted-foreground font-medium">
        (Iactual / Irated) × 100 &nbsp;|&nbsp; Irated = {ratedCurrent.toFixed(2)}A
      </div>
    </div>
  );
}
