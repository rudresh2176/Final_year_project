'use client';

import { motion } from 'framer-motion';
import {
  Activity,
  Wifi,
  Shield,
  BarChart3,
  Cpu,
  Brain,
  Zap,
  ArrowRight,
  Building2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useAppStore } from '@/lib/store';

const fadeVariant = {
  hidden: { opacity: 0, y: 8 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, delay: i * 0.05 },
  }),
};

// Feature tags for the hero section (ML Classification icon removed)
const featureTags = [
  { icon: Activity, label: 'Live Monitoring', color: 'text-green-600 dark:text-green-400', dotColor: 'bg-green-500' },
  { icon: Wifi, label: 'IoT Enabled', color: 'text-slate-500 dark:text-slate-400', dotColor: 'bg-slate-400' },
  { icon: Shield, label: 'Real-Time Alerts', color: 'text-slate-500 dark:text-slate-400', dotColor: 'bg-slate-400' },
];

// Key features cards
const keyFeatures = [
  {
    icon: BarChart3,
    title: 'Real-Time Monitoring',
    description: 'Continuous monitoring of voltage, current, power, energy, frequency, and power factor from both primary and secondary windings.',
  },
  {
    icon: Brain,
    title: 'AI Fault Detection',
    description: 'Machine learning-powered classification of transformer faults including over voltage, under voltage, overload, and efficiency issues.',
  },
  {
    icon: Cpu,
    title: 'IoT Integration',
    description: 'PZEM sensors connected via ESP32 microcontroller transmit data wirelessly to Firebase Realtime Database.',
  },
  {
    icon: Zap,
    title: 'Predictive Analysis',
    description: 'Automated severity assessment with early warning detection to prevent catastrophic transformer failures.',
  },
  {
    icon: Shield,
    title: 'Smart Alerts',
    description: 'Intelligent notification system with fault severity classification and real-time status monitoring.',
  },
  {
    icon: Activity,
    title: 'Data Logging',
    description: 'Historical data storage with CSV export capabilities for any date range throughout the year.',
  },
];

// Quick stats
const quickStats = [
  { label: 'Parameters Monitored', value: '12+' },
  { label: 'Fault Types Detected', value: '5' },
  { label: 'Update Interval', value: '2s' },
  { label: 'System Uptime', value: '99.9%' },
];

export default function HomePage() {
  const setActivePage = useAppStore((s) => s.setActivePage);

  return (
    <div className="flex flex-col gap-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col gap-5"
      >
        {/* Pill badge */}
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm">
            <Building2 className="h-3.5 w-3.5" />
            AI-Powered Transformer Monitoring System
          </div>
        </div>

        {/* Title + Description */}
        <div className="flex flex-col gap-3">
          <h1 className="text-2xl leading-tight font-medium md:text-3xl lg:text-4xl">
            Development of AI-Based System for{' '}
            <span className="text-foreground/80">Transformer Monitoring</span> and{' '}
            <span className="text-foreground/80">Fault Classification</span>
          </h1>
          <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
            An innovative IoT-based solution for real-time monitoring and intelligent fault
            detection in dry-type transformers using machine learning algorithms.
          </p>
        </div>

        {/* Feature Tags */}
        <div className="flex flex-wrap items-center gap-2">
          {featureTags.map((tag) => (
            <div
              key={tag.label}
              className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm"
            >
              <span className={`h-1.5 w-1.5 rounded-full ${tag.dotColor}`} />
              <tag.icon className={`h-3.5 w-3.5 ${tag.color}`} />
              {tag.label}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Quick Stats Strip */}
      <motion.div
        custom={0}
        variants={fadeVariant}
        initial="hidden"
        animate="visible"
      >
        <Card className="rounded-xl border shadow-sm">
          <CardContent className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-4">
            {quickStats.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-1 text-center sm:items-start sm:text-left">
                <span className="text-lg font-medium text-foreground">{stat.value}</span>
                <span className="text-[11px] text-muted-foreground">{stat.label}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Key Features Section */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.1 }}
        className="flex flex-col gap-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-medium">Key Features</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Comprehensive transformer monitoring system capabilities
            </p>
          </div>
          <button
            onClick={() => setActivePage('about')}
            className="hidden items-center gap-1 rounded-lg border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm transition-colors hover:shadow-sm sm:inline-flex"
          >
            Learn more
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {keyFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              custom={index + 1}
              variants={fadeVariant}
              initial="hidden"
              animate="visible"
            >
              <Card className="group rounded-xl border shadow-sm transition-all hover:shadow">
                <CardContent className="p-5">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg border bg-card">
                      <feature.icon className="h-4.5 w-4.5 text-slate-600 dark:text-slate-400" />
                    </div>
                    <h3 className="text-sm font-medium">{feature.title}</h3>
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Transformer Specifications Card */}
      <motion.div
        custom={7}
        variants={fadeVariant}
        initial="hidden"
        animate="visible"
      >
        <Card className="rounded-xl border shadow-sm">
          <CardContent className="p-5">
            <h3 className="mb-3 text-sm font-medium">Transformer Under Monitoring</h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-4">
              {[
                { label: 'Type', value: 'Single-Phase Dry-Type' },
                { label: 'Rating', value: '2 KVA' },
                { label: 'Primary Voltage', value: '230V' },
                { label: 'Secondary Voltage', value: '120V' },
              ].map((spec) => (
                <div key={spec.label} className="flex flex-col gap-0.5">
                  <span className="text-[11px] text-muted-foreground">{spec.label}</span>
                  <span className="text-sm font-medium">{spec.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
