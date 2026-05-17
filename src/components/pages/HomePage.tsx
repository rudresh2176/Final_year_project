'use client';

import { motion } from 'framer-motion';
import { UserCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function HomePage() {
  return (
    <div className="flex flex-col gap-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-medium leading-tight md:text-3xl lg:text-4xl">
            Development of AI-Based System for Transformer Monitoring and Fault Classification
          </h2>
          <p className="max-w-3xl text-sm text-muted-foreground md:text-base">
            An innovative IoT-based solution for real-time monitoring and intelligent fault
            detection in dry-type transformers using machine learning algorithms.
          </p>
        </div>
      </motion.div>

      {/* Faculty Guide Card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.05 }}
      >
        <Card className="rounded-xl border shadow-sm">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
              <UserCheck className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </div>
            <div className="flex flex-col gap-0.5">
              <Badge
                variant="secondary"
                className="w-fit text-xs font-medium"
              >
                Faculty Guide
              </Badge>
              <p className="text-sm font-medium">Dr. Chandrashekhar Badachi</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
