'use client';

import { motion } from 'framer-motion';
import {
  Cpu,
  Wifi,
  ArrowRight,
  Database,
  Monitor,
  Brain,
  Zap,
  Thermometer,
  Cable,
  Smartphone,
  Battery,
  Shield,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  type LucideIcon,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const fadeVariant = {
  hidden: { opacity: 0, y: 8 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, delay: i * 0.04 },
  }),
};

// --- Architecture Steps ---
const archSteps: { icon: LucideIcon; label: string; description: string }[] = [
  { icon: Thermometer, label: 'PZEM Sensors', description: 'Measure voltage, current, power, energy' },
  { icon: Cpu, label: 'ESP32', description: 'Microcontroller processes sensor data' },
  { icon: Wifi, label: 'WiFi', description: 'Wireless data transmission' },
  { icon: Database, label: 'Firebase', description: 'Cloud real-time database' },
  { icon: Monitor, label: 'Dashboard', description: 'Web visualization interface' },
  { icon: Brain, label: 'AI Model', description: 'ML fault detection engine' },
];

// --- Components Used ---
const componentsList: { icon: LucideIcon; name: string; description: string }[] = [
  { icon: Thermometer, name: 'PZEM-004T V3.0', description: 'AC power monitoring module' },
  { icon: Cpu, name: 'ESP32 DevKit', description: 'Microcontroller with WiFi & BLE' },
  { icon: Zap, name: 'Dry-Type Transformer', description: '2 KVA, 230V/120V single-phase' },
  { icon: Database, name: 'Firebase', description: 'Real-time cloud database for IoT data' },
  { icon: Battery, name: 'Power Supply', description: '5V DC for ESP32 and sensors' },
  { icon: Cable, name: 'Connecting Wires', description: 'UART and power connections' },
];

// --- Advantages with icons ---
const advantages = [
  { icon: Monitor, text: 'Real-time monitoring of transformer health parameters' },
  { icon: Brain, text: 'Predictive maintenance using machine learning algorithms' },
  { icon: AlertTriangle, text: 'Early detection of faults before catastrophic failure' },
  { icon: Wifi, text: 'Remote accessibility through web-based dashboard' },
  { icon: TrendingUp, text: 'Data-driven decisions backed by historical analytics' },
  { icon: Shield, text: 'Cost-effective solution compared to traditional methods' },
];

// --- Fault Types ---
const faultTypes = [
  { name: 'Over Voltage', condition: '> 253V', severity: 'High', color: 'border-red-300 dark:border-red-800' },
  { name: 'Under Voltage', condition: '< 207V', severity: 'High', color: 'border-red-300 dark:border-red-800' },
  { name: 'Over Load', condition: '> 100% rated', severity: 'High', color: 'border-red-300 dark:border-red-800' },
  { name: 'High Transformer Loss', condition: '> 300W', severity: 'Medium', color: 'border-amber-300 dark:border-amber-800' },
  { name: 'Low Efficiency', condition: '< 80%', severity: 'Medium', color: 'border-amber-300 dark:border-amber-800' },
];

export default function AboutPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <h2 className="text-2xl font-medium md:text-3xl">About the Project</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Comprehensive documentation of the AI-based transformer monitoring system.
        </p>
      </motion.div>

      {/* Project Overview */}
      <motion.div custom={0} variants={fadeVariant} initial="hidden" animate="visible">
        <Card className="rounded-xl border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-xl font-medium">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg border bg-card">
                <Zap className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
              </div>
              Project Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed text-muted-foreground">
            <p>
              This project presents an AI-based system for monitoring dry-type transformers in real-time. By leveraging IoT sensors (PZEM-004T V3.0) connected to an ESP32 microcontroller, the system continuously captures electrical parameters — including voltage, current, power, energy, frequency, and power factor — from both primary and secondary windings of a <span className="font-medium text-foreground">2 KVA, 230V/120V single-phase transformer</span>.
            </p>
            <p className="mt-3">
              The collected data is transmitted wirelessly to Firebase Realtime Database, enabling remote access and real-time visualization through a responsive web dashboard. The system integrates a machine learning model trained on transformer fault signatures to automatically classify conditions and detect anomalies, enabling proactive maintenance and reducing unplanned downtime.
            </p>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {[
                { label: 'Transformer', value: '2 KVA' },
                { label: 'Primary', value: '230V' },
                { label: 'Secondary', value: '120V' },
              ].map((s) => (
                <div key={s.label} className="rounded-lg border bg-card p-3 text-center">
                  <span className="block text-sm font-medium">{s.value}</span>
                  <span className="text-[10px] text-muted-foreground">{s.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* System Architecture */}
      <motion.div custom={1} variants={fadeVariant} initial="hidden" animate="visible">
        <Card className="rounded-xl border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-xl font-medium">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg border bg-card">
                <Cpu className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
              </div>
              System Architecture
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <div className="flex flex-col gap-4">
              {/* Architecture flow */}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-1">
                {archSteps.map((step, i) => (
                  <div key={step.label} className="flex items-center gap-1">
                    <div className="flex items-center gap-2.5 rounded-lg border bg-card p-3 transition-shadow hover:shadow-sm">
                      <step.icon className="h-5 w-5 shrink-0 text-slate-500 dark:text-slate-400" />
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-foreground">{step.label}</span>
                        <span className="hidden text-[11px] text-muted-foreground sm:block">
                          {step.description}
                        </span>
                      </div>
                    </div>
                    {i < archSteps.length - 1 && (
                      <ArrowRight className="hidden h-4 w-4 shrink-0 text-slate-400 sm:block" />
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Data flows from physical sensors through the IoT pipeline to the cloud, where it is visualized and analyzed by the AI model for fault classification.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Components Used */}
      <motion.div custom={2} variants={fadeVariant} initial="hidden" animate="visible">
        <Card className="rounded-xl border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-xl font-medium">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg border bg-card">
                <Database className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
              </div>
              Components Used
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {componentsList.map((comp) => (
                <div
                  key={comp.name}
                  className="flex items-start gap-3 rounded-lg border bg-card p-3 transition-shadow hover:shadow-sm"
                >
                  <comp.icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-500 dark:text-slate-400" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-medium text-foreground">{comp.name}</span>
                    <span className="text-[11px] text-muted-foreground">{comp.description}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Fault Classification */}
      <motion.div custom={3} variants={fadeVariant} initial="hidden" animate="visible">
        <Card className="rounded-xl border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-xl font-medium">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg border bg-card">
                <AlertTriangle className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
              </div>
              AI Fault Classification
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p className="mb-4">The ML model classifies transformer conditions into 5 fault types using a hybrid rule-based + AI approach:</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {faultTypes.map((ft) => (
                <div key={ft.name} className={`rounded-lg border-l-4 ${ft.color} border bg-card p-3`}>
                  <span className="text-xs font-medium text-foreground">{ft.name}</span>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-[11px] text-muted-foreground">Condition: {ft.condition}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Advantages */}
      <motion.div custom={4} variants={fadeVariant} initial="hidden" animate="visible">
        <Card className="rounded-xl border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-xl font-medium">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg border bg-card">
                <CheckCircle2 className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
              </div>
              Advantages
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {advantages.map((item, i) => (
                <li key={i} className="flex items-start gap-3 rounded-lg border bg-card p-3">
                  <item.icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-500 dark:text-slate-400" />
                  <span className="text-xs leading-relaxed">{item.text}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </motion.div>

      {/* Importance of AI */}
      <motion.div custom={5} variants={fadeVariant} initial="hidden" animate="visible">
        <Card className="rounded-xl border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-xl font-medium">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg border bg-card">
                <Brain className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
              </div>
              Importance of AI in Transformer Monitoring
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed text-muted-foreground">
            <p>
              Artificial intelligence plays a pivotal role in modern transformer monitoring by enabling predictive maintenance strategies that move beyond reactive approaches. Traditional monitoring relies on periodic manual inspections and threshold-based alerts, which often fail to detect developing faults early enough.
            </p>
            <Separator className="my-3" />
            <p>
              AI systems can analyze vast amounts of historical and real-time sensor data to identify subtle patterns and trends that precede equipment failures. Machine learning algorithms — including Random Forest, Support Vector Machines, and Neural Networks — can be trained on labeled fault datasets to automatically classify transformer conditions with high accuracy.
            </p>
            <Separator className="my-3" />
            <p>
              Automated fault classification reduces reliance on expert judgment, enables faster response times, and supports the transition from time-based to condition-based maintenance strategies. These models continuously improve through experience, adapting to new data patterns and environmental conditions.
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* AI: A Game Changer */}
      <motion.div custom={6} variants={fadeVariant} initial="hidden" animate="visible">
        <Card className="rounded-xl border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-xl font-medium">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg border bg-card">
                <TrendingUp className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
              </div>
              AI: A Game Changer for Power Systems
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed text-muted-foreground">
            <p>
              The integration of artificial intelligence into power system monitoring represents a transformative shift in how electrical infrastructure is managed. AI-powered monitoring systems enable smart grid capabilities by providing continuous, intelligent oversight of critical assets like transformers.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[
                { label: 'Maintenance Cost Reduction', value: '25-30%' },
                { label: 'Unplanned Downtime Decrease', value: 'Up to 70%' },
              ].map((stat) => (
                <div key={stat.label} className="rounded-lg border bg-card p-3 text-center">
                  <span className="block text-lg font-medium text-foreground">{stat.value}</span>
                  <span className="text-[10px] text-muted-foreground">{stat.label}</span>
                </div>
              ))}
            </div>
            <p className="mt-4">
              As power grids become more complex with the integration of renewable energy sources and electric vehicle charging infrastructure, AI-based monitoring becomes not just advantageous but essential for maintaining grid reliability, safety, and efficiency at scale.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
