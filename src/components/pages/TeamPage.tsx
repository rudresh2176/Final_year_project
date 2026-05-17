'use client';

import { motion } from 'framer-motion';
import {
  GraduationCap,
  Mail,
  BookOpen,
  Award,
  Code,
  Cpu,
  Users,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const fadeVariant = {
  hidden: { opacity: 0, y: 8 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, delay: i * 0.05 },
  }),
};

const teamMembers = [
  {
    name: 'BHEEMARAYA',
    usn: '1MS22EE012',
    initials: 'BH',
    role: 'Hardware & IoT',
    description: 'Sensor integration, ESP32 programming, and hardware prototyping',
  },
  {
    name: 'PAVANKUMAR',
    usn: '1MS22EE037',
    initials: 'PK',
    role: 'ML & Analytics',
    description: 'Machine learning model training and fault classification algorithms',
  },
  {
    name: 'RUDRESH B S',
    usn: '1MS22EE042',
    initials: 'RB',
    role: 'Full-Stack Dev',
    description: 'Web dashboard development and Firebase real-time integration',
  },
  {
    name: 'B.GIRISH',
    usn: '1MS22EE400',
    initials: 'BG',
    role: 'Testing & Docs',
    description: 'System testing, documentation, and quality assurance',
  },
];

export default function TeamPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <h2 className="text-2xl font-medium md:text-3xl">Team Members</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          The people behind the AI-based transformer monitoring system.
        </p>
      </motion.div>

      {/* Faculty Guide - Creative Section */}
      <motion.div
        custom={0}
        variants={fadeVariant}
        initial="hidden"
        animate="visible"
      >
        <Card className="overflow-hidden rounded-xl border shadow-sm">
          <CardContent className="p-0">
            {/* Top accent bar */}
            <div className="h-1 bg-slate-900 dark:bg-white" />
            <div className="p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-8">
                {/* Left: Guide info */}
                <div className="flex items-start gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border bg-slate-50 dark:bg-slate-800">
                    <GraduationCap className="h-8 w-8 text-slate-700 dark:text-slate-300" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-slate-900 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white dark:bg-white dark:text-slate-900">
                        Guide
                      </span>
                    </div>
                    <h3 className="text-lg font-medium">Dr. Chandrashekhar Badachi</h3>
                    <p className="text-sm text-muted-foreground">
                      Department of Electrical Engineering
                    </p>
                  </div>
                </div>

                <Separator orientation="vertical" className="hidden h-16 sm:block" />

                {/* Right: Guide details */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:flex-1">
                  <div className="flex items-center gap-2.5 rounded-lg border bg-card p-3">
                    <BookOpen className="h-4 w-4 shrink-0 text-slate-500 dark:text-slate-400" />
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Role</span>
                      <span className="text-xs font-medium">Faculty Guide</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 rounded-lg border bg-card p-3">
                    <Mail className="h-4 w-4 shrink-0 text-slate-500 dark:text-slate-400" />
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Dept</span>
                      <span className="text-xs font-medium">Electrical Eng.</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 rounded-lg border bg-card p-3">
                    <Award className="h-4 w-4 shrink-0 text-slate-500 dark:text-slate-400" />
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Focus</span>
                      <span className="text-xs font-medium">Power Systems</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Team Stats */}
      <motion.div
        custom={1}
        variants={fadeVariant}
        initial="hidden"
        animate="visible"
      >
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Users, label: 'Members', value: '4' },
            { icon: Cpu, label: 'Tech Stack', value: '6+' },
            { icon: Code, label: 'Modules', value: '3' },
          ].map((stat) => (
            <Card key={stat.label} className="rounded-xl border shadow-sm py-0">
              <CardContent className="flex items-center gap-3 p-4">
                <stat.icon className="h-4 w-4 shrink-0 text-slate-500 dark:text-slate-400" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{stat.value}</span>
                  <span className="text-[10px] text-muted-foreground">{stat.label}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Team Member Cards - Creative Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {teamMembers.map((member, index) => (
          <motion.div
            key={member.usn}
            custom={index + 2}
            variants={fadeVariant}
            initial="hidden"
            animate="visible"
          >
            <Card className="group overflow-hidden rounded-xl border shadow-sm transition-all hover:shadow">
              <CardContent className="p-0">
                {/* Card inner layout */}
                <div className="flex">
                  {/* Left accent stripe */}
                  <div className="w-1 shrink-0 bg-slate-200 group-hover:bg-slate-900 group-hover:dark:bg-white transition-colors" />

                  {/* Content */}
                  <div className="flex flex-1 flex-col gap-4 p-5">
                    {/* Top row: Avatar + Name */}
                    <div className="flex items-start gap-4">
                      {/* Avatar with index number */}
                      <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border-2 border-slate-200 bg-slate-50 transition-colors group-hover:border-slate-900 group-hover:dark:border-white dark:bg-slate-800">
                        <span className="text-base font-medium text-slate-700 dark:text-slate-300">
                          {member.initials}
                        </span>
                        {/* Corner index */}
                        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border bg-white text-[10px] font-medium text-muted-foreground dark:bg-slate-900 dark:text-slate-400">
                          {index + 1}
                        </span>
                      </div>

                      <div className="flex flex-col gap-1">
                        <h3 className="text-sm font-medium">{member.name}</h3>
                        <span className="font-mono text-xs text-muted-foreground">
                          {member.usn}
                        </span>
                      </div>
                    </div>

                    {/* Role badge */}
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-md border bg-card px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-400">
                        <ArrowRight className="h-3 w-3" />
                        {member.role}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {member.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
