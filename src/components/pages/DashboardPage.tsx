'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '@/lib/firebase';
import { useAppStore, type DataLogType } from '@/lib/store';
import { motion } from 'framer-motion';
import { Separator } from '@/components/ui/separator';

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

export default function DashboardPage() {
  const store = useAppStore();

  // Local state
  const [loading, setLoading] = useState(true);
  const [liveTimestamp, setLiveTimestamp] = useState('');
  const [primaryParams, setPrimaryParams] = useState<Parameter[]>([]);
  const [secondaryParams, setSecondaryParams] = useState<Parameter[]>([]);
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

  // Refs to hold latest data for the interval callback
  const sensorDataRef = useRef<any>(null);
  const prevFaultsRef = useRef<string[]>([]);

  // --- Live clock (every second) ---
  useEffect(() => {
    const updateClock = () => {
      setLiveTimestamp(new Date().toLocaleTimeString());
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // --- Firebase Realtime Database listeners ---
  useEffect(() => {
    let connected = false;

    const primaryRef = ref(database, 'primary');
    const secondaryRef = ref(database, 'secondary');

    const unsubPrimary = onValue(
      primaryRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data && !connected) {
          connected = true;
          store.setConnectionStatus('online');
        }
        if (data) {
          sensorDataRef.current = {
            ...sensorDataRef.current,
            primaryVoltage: data.voltage ?? 0,
            primaryCurrent: data.current ?? 0,
            primaryPower: data.power ?? 0,
            primaryEnergy: data.energy ?? 0,
            primaryFrequency: data.frequency ?? 0,
            primaryPowerFactor: data.pf ?? 0,
          };
          setPrimaryParams([
            { label: 'Voltage', value: data.voltage ?? 0, unit: 'V' },
            { label: 'Current', value: data.current ?? 0, unit: 'A' },
            { label: 'Power', value: data.power ?? 0, unit: 'W' },
            { label: 'Energy', value: data.energy ?? 0, unit: 'Wh' },
            { label: 'Frequency', value: data.frequency ?? 0, unit: 'Hz' },
            { label: 'Power Factor', value: data.pf ?? 0, unit: 'PF' },
          ]);
        }
        if (connected) setLoading(false);
      },
      (error) => {
        console.error('Firebase primary listener error:', error);
      }
    );

    const unsubSecondary = onValue(
      secondaryRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data && !connected) {
          connected = true;
          store.setConnectionStatus('online');
        }
        if (data) {
          sensorDataRef.current = {
            ...sensorDataRef.current,
            secondaryVoltage: data.voltage ?? 0,
            secondaryCurrent: data.current ?? 0,
            secondaryPower: data.power ?? 0,
            secondaryEnergy: data.energy ?? 0,
            secondaryFrequency: data.frequency ?? 0,
            secondaryPowerFactor: data.pf ?? 0,
          };
          setSecondaryParams([
            { label: 'Voltage', value: data.voltage ?? 0, unit: 'V' },
            { label: 'Current', value: data.current ?? 0, unit: 'A' },
            { label: 'Power', value: data.power ?? 0, unit: 'W' },
            { label: 'Energy', value: data.energy ?? 0, unit: 'Wh' },
            { label: 'Frequency', value: data.frequency ?? 0, unit: 'Hz' },
            { label: 'Power Factor', value: data.pf ?? 0, unit: 'PF' },
          ]);
        }
        if (connected) setLoading(false);
      },
      (error) => {
        console.error('Firebase secondary listener error:', error);
      }
    );

    // If no data arrives within 5s, show offline
    const timeout = setTimeout(() => {
      if (!connected) {
        store.setConnectionStatus('offline');
        setLoading(false);
        setPrimaryParams([
          { label: 'Voltage', value: 0, unit: 'V' },
          { label: 'Current', value: 0, unit: 'A' },
          { label: 'Power', value: 0, unit: 'W' },
          { label: 'Energy', value: 0, unit: 'Wh' },
          { label: 'Frequency', value: 0, unit: 'Hz' },
          { label: 'Power Factor', value: 0, unit: 'PF' },
        ]);
        setSecondaryParams([
          { label: 'Voltage', value: 0, unit: 'V' },
          { label: 'Current', value: 0, unit: 'A' },
          { label: 'Power', value: 0, unit: 'W' },
          { label: 'Energy', value: 0, unit: 'Wh' },
          { label: 'Frequency', value: 0, unit: 'Hz' },
          { label: 'Power Factor', value: 0, unit: 'PF' },
        ]);
      }
    }, 5000);

    return () => {
      unsubPrimary();
      unsubSecondary();
      clearTimeout(timeout);
    };
  }, [store]);

  // --- Prediction pipeline (every 2 seconds) ---
  const runPredictionPipeline = useCallback(async () => {
    const sd = sensorDataRef.current;
    if (!sd) return;

    // Check if transformer is offline (all critical parameters are 0)
    const isOffline =
      (sd.primaryVoltage ?? 0) === 0 &&
      (sd.primaryCurrent ?? 0) === 0 &&
      (sd.primaryPower ?? 0) === 0 &&
      (sd.secondaryVoltage ?? 0) === 0 &&
      (sd.secondaryCurrent ?? 0) === 0 &&
      (sd.secondaryPower ?? 0) === 0;

    // If offline, don't run prediction or log data
    if (isOffline) return;

    const inputPower = sd.primaryPower ?? 0;
    const outputPower = sd.secondaryPower ?? 0;
    const calculatedLoss = inputPower - outputPower;
    const calculatedEfficiency = inputPower > 0 ? (outputPower / inputPower) * 100 : 0;

    setLoss(Math.max(0, calculatedLoss));
    setEfficiency(Math.min(100, Math.max(0, calculatedEfficiency)));

    // Determine loss status
    if (calculatedLoss > 300) setLossStatus('Fault');
    else if (calculatedLoss > 150) setLossStatus('Warning');
    else setLossStatus('Normal');

    // Build request for ML service
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

    try {
      const response = await fetch('/api/predict?XTransformPort=3003', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) return;

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

        // Update store
        store.setPredictionResult({
          status: predStatus,
          faults: predFaults,
          warnings: predWarnings,
          severity: predSeverity,
        });

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

        // Check for new faults to notify
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

        // Log to store
        const logEntry: DataLogType = {
          id: crypto.randomUUID(),
          timestamp: new Date(),
          status: predStatus,
          primaryVoltage: sd.primaryVoltage ?? 0,
          secondaryVoltage: sd.secondaryVoltage ?? 0,
          primaryCurrent: sd.primaryCurrent ?? 0,
          secondaryCurrent: sd.secondaryCurrent ?? 0,
          loss: calculatedLoss,
          efficiency: calculatedEfficiency,
          severity: predSeverity,
        };
        store.addRecentLog(logEntry);

        // Update live data table
        const timeStr = new Date().toLocaleTimeString();
        setLiveData((prev) => {
          const newRow: LiveDataRow = {
            timestamp: timeStr,
            status: predStatus,
            primaryV: sd.primaryVoltage ?? 0,
            secondaryV: sd.secondaryVoltage ?? 0,
            primaryI: sd.primaryCurrent ?? 0,
            secondaryI: sd.secondaryCurrent ?? 0,
            loss: calculatedLoss,
            efficiency: calculatedEfficiency,
          };
          return [newRow, ...prev].slice(0, 10);
        });

        // Update chart data
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

        // Persist to DB via API
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
          }),
        }).catch(() => {
          // Silently fail - don't block UI for DB logging
        });
      }
    } catch (err) {
      console.error('Prediction pipeline error:', err);
    }
  }, [store]);

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

      {/* Row 1: Connection Status & Summary */}
      <motion.div {...fadeIn} transition={{ ...fadeIn.transition, delay: 0.05 }}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-2">
          <StatusIndicator timestamp={liveTimestamp} />
        </div>
        <FaultSummaryCards
          status={status}
          faultCount={faults.length}
          warningCount={warnings.length}
          severity={severity}
          loading={loading}
        />
      </motion.div>

      {/* Row 2: Parameter Display */}
      <motion.div
        className="grid grid-cols-1 gap-4 lg:grid-cols-2"
        {...fadeIn}
        transition={{ ...fadeIn.transition, delay: 0.1 }}
      >
        <ParameterGrid title="Primary Side (Input)" parameters={primaryParams} loading={loading} />
        <ParameterGrid title="Secondary Side (Output)" parameters={secondaryParams} loading={loading} />
      </motion.div>

      {/* Row 3: Efficiency & Loss */}
      <motion.div
        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        {...fadeIn}
        transition={{ ...fadeIn.transition, delay: 0.15 }}
      >
        <EfficiencyCard efficiency={efficiency} loading={loading} />
        <LossCard loss={loss} status={lossStatus} loading={loading} />
      </motion.div>

      {/* Row 4: Live Charts */}
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

      {/* Row 5: Faults & Warnings */}
      <motion.div {...fadeIn} transition={{ ...fadeIn.transition, delay: 0.25 }}>
        <FaultWarningPanel faults={faults} warnings={warnings} loading={loading} />
      </motion.div>

      {/* Row 6: Live Data Table */}
      <motion.div {...fadeIn} transition={{ ...fadeIn.transition, delay: 0.3 }}>
        <LiveDataPreview data={liveData} loading={loading} />
      </motion.div>
    </div>
  );
}
