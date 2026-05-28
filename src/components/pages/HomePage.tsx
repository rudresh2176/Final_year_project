'use client';

import { motion } from 'framer-motion';
import {
  Activity,
  Shield,
  BarChart3,
  Cpu,
  Zap,
  Database,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const fadeVariant = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, delay: i * 0.06 },
  }),
};

const keyFeatures = [
  {
    icon: Activity,
    title: 'Real-Time Monitoring',
    description: 'Continuous monitoring of voltage, current, power, energy, frequency, and power factor from both primary and secondary windings.',
  },
  {
    icon: BarChart3,
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
    icon: Database,
    title: 'Data History',
    description: 'Historical data storage with Excel export capabilities for any date range throughout the year.',
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col gap-10">
      {/* Hero - Centered Title */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col items-center justify-center gap-4 py-8 text-center"
      >
        <h1 className="text-3xl leading-tight font-medium md:text-4xl lg:text-5xl">
          Development of AI-Based System for{' '}
          <span className="text-foreground/80">Transformer Monitoring</span> and{' '}
          <span className="text-foreground/80">Fault Classification</span>
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
          An innovative IoT-based solution for real-time monitoring and intelligent fault
          detection in dry-type transformers using machine learning algorithms.
        </p>
      </motion.div>

      {/* Key Features Grid */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="flex flex-col gap-5"
      >
        <h2 className="text-center text-lg font-medium text-muted-foreground">
          Key Features
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {keyFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              custom={index}
              variants={fadeVariant}
              initial="hidden"
              animate="visible"
            >
              <Card className="group h-full rounded-xl border shadow-sm transition-all hover:shadow">
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
    </div>
  );
}
