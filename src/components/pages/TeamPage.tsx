'use client';

import { motion } from 'framer-motion';
import { GraduationCap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const fadeVariant = {
  hidden: { opacity: 0, y: 8 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, delay: i * 0.04 },
  }),
};

const teamMembers = [
  { name: 'BHEEMARAYA', usn: '1MS22EE012', initials: 'BH' },
  { name: 'PAVANKUMAR', usn: '1MS22EE037', initials: 'PK' },
  { name: 'RUDRESH B S', usn: '1MS22EE042', initials: 'RB' },
  { name: 'B.GIRISH', usn: '1MS22EE400', initials: 'BG' },
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
          The team behind the AI-based transformer monitoring system.
        </p>
      </motion.div>

      {/* Faculty Guide Card */}
      <motion.div
        custom={0}
        variants={fadeVariant}
        initial="hidden"
        animate="visible"
      >
        <Card className="rounded-xl border-l-4 border-l-slate-500 shadow-sm">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
              <GraduationCap className="h-6 w-6 text-slate-500 dark:text-slate-400" />
            </div>
            <div className="flex flex-col gap-1">
              <Badge variant="secondary" className="w-fit text-xs font-medium">
                Faculty Guide
              </Badge>
              <p className="text-base font-medium">Dr. Chandrashekhar Badachi</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Team Member Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {teamMembers.map((member, index) => (
          <motion.div
            key={member.usn}
            custom={index + 1}
            variants={fadeVariant}
            initial="hidden"
            animate="visible"
          >
            <Card className="rounded-xl border shadow-sm transition-shadow hover:shadow">
              <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
                {/* Avatar */}
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-200 text-sm font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                  {member.initials}
                </div>

                {/* Name */}
                <p className="text-sm font-medium">{member.name}</p>

                {/* USN */}
                <p className="text-xs text-muted-foreground">{member.usn}</p>

                {/* Role Badge */}
                <Badge
                  variant="secondary"
                  className="bg-slate-100 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                >
                  Team Member
                </Badge>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
