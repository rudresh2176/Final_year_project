'use client';

import { motion } from 'framer-motion';
import { GraduationCap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const fadeVariant = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, delay: i * 0.06 },
  }),
};

// Color palette for member cards (navy, orange, teal, purple as seen in the image)
const cardColors = [
  { header: 'bg-slate-800', avatar: 'bg-slate-700', ring: 'ring-slate-200' },
  { header: 'bg-amber-600', avatar: 'bg-amber-500', ring: 'ring-amber-200' },
  { header: 'bg-teal-600', avatar: 'bg-teal-500', ring: 'ring-teal-200' },
  { header: 'bg-violet-600', avatar: 'bg-violet-500', ring: 'ring-violet-200' },
];

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
    <div className="flex flex-col gap-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-2xl font-medium md:text-3xl">Team Members</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          The people behind the AI-based transformer monitoring system.
        </p>
      </motion.div>

      {/* Faculty Guide Section */}
      <motion.div
        custom={0}
        variants={fadeVariant}
        initial="hidden"
        animate="visible"
        className="text-center"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
            <GraduationCap className="h-8 w-8 text-slate-600 dark:text-slate-400" />
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs text-muted-foreground">Under the Guidance of</span>
            <h3 className="text-xl font-medium">Dr. Chandrashekhar Badachi</h3>
            <p className="text-sm text-muted-foreground">
              Department of Electrical Engineering
            </p>
          </div>
        </div>
      </motion.div>

      <Separator />

      {/* Sub-header */}
      <motion.div
        custom={1}
        variants={fadeVariant}
        initial="hidden"
        animate="visible"
        className="text-center"
      >
        <p className="text-sm text-muted-foreground">
          Final Year Students — Department of EEE
        </p>
      </motion.div>

      {/* Team Member Cards - 4 columns */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {teamMembers.map((member, index) => (
          <motion.div
            key={member.usn}
            custom={index + 2}
            variants={fadeVariant}
            initial="hidden"
            animate="visible"
          >
            <Card className="overflow-hidden rounded-xl border shadow-sm transition-all hover:shadow">
              <CardContent className="p-0">
                {/* Colored Header Bar */}
                <div className={`h-2 ${cardColors[index].header}`} />

                <div className="flex flex-col items-center gap-3 px-4 pb-5 pt-6">
                  {/* Avatar */}
                  <div
                    className={`flex h-16 w-16 items-center justify-center rounded-full ${cardColors[index].avatar} ring-4 ${cardColors[index].ring} dark:ring-slate-700`}
                  >
                    <span className="text-lg font-medium text-white">
                      {member.initials}
                    </span>
                  </div>

                  {/* Name */}
                  <h3 className="text-sm font-medium text-center">{member.name}</h3>

                  {/* Role */}
                  <span className="text-xs text-muted-foreground">{member.role}</span>

                  {/* USN */}
                  <span className="font-mono text-[11px] text-muted-foreground/70">
                    {member.usn}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
