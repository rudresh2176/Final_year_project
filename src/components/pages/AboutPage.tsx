'use client';

import { motion } from 'framer-motion';
import {
  Cpu,
  Wifi,
  Radio,
  Database,
  Monitor,
  Brain,
  Zap,
  Thermometer,
  Cable,
  Smartphone,
  Battery,
  type LucideIcon,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
  { icon: Thermometer, label: 'PZEM Sensors', description: 'Measure voltage, current, power, and energy parameters' },
  { icon: Cpu, label: 'ESP32', description: 'Microcontroller processes sensor data via UART' },
  { icon: Wifi, label: 'WiFi', description: 'Transmits data wirelessly to cloud infrastructure' },
  { icon: Database, label: 'Firebase', description: 'Cloud database stores real-time sensor data' },
  { icon: Monitor, label: 'Dashboard', description: 'Web-based interface for visualization and monitoring' },
  { icon: Brain, label: 'AI Model', description: 'ML-based fault detection and classification engine' },
];

// --- Components Used ---
const componentsList: { icon: LucideIcon; name: string; description: string }[] = [
  { icon: Thermometer, name: 'PZEM-004T V3.0', description: 'AC power monitoring module' },
  { icon: Cpu, name: 'ESP32 DevKit', description: 'Microcontroller with WiFi & Bluetooth' },
  { icon: Zap, name: 'Dry-Type Transformer', description: 'Subject under monitoring' },
  { icon: Smartphone, name: 'LCD Display', description: '16x2 character LCD for local readout' },
  { icon: Battery, name: 'Power Supply', description: 'Stable 5V DC for ESP32 and sensors' },
  { icon: Cable, name: 'Connecting Wires', description: 'UART and power connections' },
];

// --- Advantages ---
const advantages = [
  'Real-time monitoring of transformer health parameters',
  'Predictive maintenance using machine learning algorithms',
  'Early detection of faults before catastrophic failure',
  'Remote accessibility through web-based dashboard',
  'Data-driven decisions backed by historical analytics',
  'Cost-effective solution compared to traditional methods',
];

const sections = [
  {
    title: 'Project Overview',
    content: `This project presents an AI-based system for monitoring dry-type transformers in real-time. By leveraging IoT sensors (PZEM-004T V3.0) connected to an ESP32 microcontroller, the system continuously captures electrical parameters — including voltage, current, power, energy, frequency, and power factor — from both primary and secondary windings. The collected data is transmitted wirelessly to Firebase Realtime Database, enabling remote access and real-time visualization through a responsive web dashboard. The system integrates a machine learning model trained on transformer fault signatures to automatically classify conditions and detect anomalies, enabling proactive maintenance and reducing unplanned downtime.`,
  },
  {
    title: 'System Architecture',
    content: '',
    custom: 'architecture',
  },
  {
    title: 'Components Used',
    content: '',
    custom: 'components',
  },
  {
    title: 'Advantages',
    content: '',
    custom: 'advantages',
  },
  {
    title: 'Importance of AI in Transformer Monitoring',
    content: `Artificial intelligence plays a pivotal role in modern transformer monitoring by enabling predictive maintenance strategies that move beyond reactive approaches. Traditional monitoring relies on periodic manual inspections and threshold-based alerts, which often fail to detect developing faults early enough. AI systems, on the other hand, can analyze vast amounts of historical and real-time sensor data to identify subtle patterns and trends that precede equipment failures. Machine learning algorithms — including Random Forest, Support Vector Machines, and Neural Networks — can be trained on labeled fault datasets to automatically classify transformer conditions with high accuracy. These models continuously improve through experience, adapting to new data patterns and environmental conditions. Automated fault classification reduces reliance on expert judgment, enables faster response times, and supports the transition from time-based to condition-based maintenance strategies.`,
  },
  {
    title: 'AI: A Game Changer for Power Systems',
    content: `The integration of artificial intelligence into power system monitoring represents a transformative shift in how electrical infrastructure is managed. AI-powered monitoring systems enable smart grid capabilities by providing continuous, intelligent oversight of critical assets like transformers. This technology reduces unplanned outages by detecting incipient faults — such as winding deformation, insulation degradation, and overheating — long before they escalate into failures. The cost savings are substantial: predictive maintenance can reduce maintenance costs by 25-30% and decrease unplanned downtime by up to 70%. Furthermore, AI systems facilitate remote monitoring of distributed transformer assets, eliminating the need for physical inspections at each location. As power grids become more complex with the integration of renewable energy sources and electric vehicle charging infrastructure, AI-based monitoring becomes not just advantageous but essential for maintaining grid reliability, safety, and efficiency at scale.`,
  },
];

export default function AboutPage() {
  return (
    <div className="flex flex-col gap-6">
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

      {sections.map((section, index) => (
        <motion.div
          key={section.title}
          custom={index}
          variants={fadeVariant}
          initial="hidden"
          animate="visible"
        >
          <Card className="rounded-xl border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-medium">{section.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground leading-relaxed">
              {section.custom === 'architecture' && <ArchitectureSection />}
              {section.custom === 'components' && <ComponentsSection />}
              {section.custom === 'advantages' && <AdvantagesSection />}
              {!section.custom && <p>{section.content}</p>}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

function ArchitectureSection() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {archSteps.map((step, i) => (
          <div key={step.label} className="flex items-center gap-2">
            <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
              <step.icon className="h-5 w-5 shrink-0 text-slate-500 dark:text-slate-400" />
              <div className="flex flex-col">
                <span className="text-xs font-medium text-foreground">{step.label}</span>
                <span className="hidden text-[11px] text-muted-foreground sm:block">
                  {step.description}
                </span>
              </div>
            </div>
            {i < archSteps.length - 1 && (
              <Radio className="hidden h-4 w-4 shrink-0 text-slate-400 md:block" />
            )}
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Data flows from physical sensors through the IoT pipeline to the cloud, where it is visualized
        and analyzed by the AI model for fault classification.
      </p>
    </div>
  );
}

function ComponentsSection() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {componentsList.map((comp) => (
        <div
          key={comp.name}
          className="flex items-start gap-3 rounded-lg border bg-card p-3 transition-colors hover:shadow-sm"
        >
          <comp.icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-500 dark:text-slate-400" />
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-medium text-foreground">{comp.name}</span>
            <span className="text-[11px] text-muted-foreground">{comp.description}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function AdvantagesSection() {
  return (
    <ul className="space-y-2">
      {advantages.map((item, i) => (
        <li key={i} className="flex items-start gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400 dark:bg-slate-500" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
