'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ref, set } from 'firebase/database';
import { database } from '@/lib/firebase';
import { useAppStore, type TransformerConfig } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Building2, Zap, Play, ArrowRight } from 'lucide-react';

function calculateDerivedValues(kva: number, primaryVoltage: number, secondaryVoltage: number) {
  const ratedPrimaryCurrent = (kva * 1000) / primaryVoltage;
  const ratedSecondaryCurrent = (kva * 1000) / secondaryVoltage;
  const primaryVoltageLower = primaryVoltage * 0.9;
  const primaryVoltageUpper = primaryVoltage * 1.1;
  const secondaryVoltageLower = secondaryVoltage * 0.9;
  const secondaryVoltageUpper = secondaryVoltage * 1.1;
  return {
    ratedPrimaryCurrent,
    ratedSecondaryCurrent,
    primaryVoltageLower,
    primaryVoltageUpper,
    secondaryVoltageLower,
    secondaryVoltageUpper,
  };
}

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  isReconfigure?: boolean;
}

export default function ConfigModal({ isOpen, onClose, isReconfigure = false }: ConfigModalProps) {
  const store = useAppStore();

  const [kva, setKva] = useState(store.transformerConfig?.kva?.toString() ?? '');
  const [primaryVoltage, setPrimaryVoltage] = useState(store.transformerConfig?.primaryVoltage?.toString() ?? '');
  const [secondaryVoltage, setSecondaryVoltage] = useState(store.transformerConfig?.secondaryVoltage?.toString() ?? '');
  const [transformerName, setTransformerName] = useState(store.transformerConfig?.transformerName ?? '');
  const [location, setLocation] = useState(store.transformerConfig?.location ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Real-time preview of calculated values
  const previewValues = (() => {
    const k = parseFloat(kva);
    const pv = parseFloat(primaryVoltage);
    const sv = parseFloat(secondaryVoltage);
    if (k > 0 && pv > 0 && sv > 0) {
      return calculateDerivedValues(k, pv, sv);
    }
    return null;
  })();

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    const k = parseFloat(kva);
    const pv = parseFloat(primaryVoltage);
    const sv = parseFloat(secondaryVoltage);

    if (!kva || isNaN(k) || k <= 0) {
      newErrors.kva = 'Transformer Rating (KVA) is required and must be greater than 0';
    }
    if (!primaryVoltage || isNaN(pv) || pv <= 0) {
      newErrors.primaryVoltage = 'Primary Voltage is required and must be greater than 0';
    }
    if (!secondaryVoltage || isNaN(sv) || sv <= 0) {
      newErrors.secondaryVoltage = 'Secondary Voltage is required and must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleStartMonitoring() {
    if (!validate()) return;

    setSaving(true);

    const k = parseFloat(kva);
    const pv = parseFloat(primaryVoltage);
    const sv = parseFloat(secondaryVoltage);
    const derived = calculateDerivedValues(k, pv, sv);

    const config: TransformerConfig = {
      kva: k,
      primaryVoltage: pv,
      secondaryVoltage: sv,
      transformerName: transformerName.trim() || 'Main Transformer',
      location: location.trim() || 'Not specified',
      ...derived,
    };

    // Save to Firebase
    try {
      await set(ref(database, 'Transformer_Config'), {
        kva: k,
        primary_voltage: pv,
        secondary_voltage: sv,
        transformer_name: config.transformerName,
        location: config.location,
      });
    } catch (err) {
      console.error('Failed to save config to Firebase:', err);
      // Continue locally even if Firebase fails
    }

    // Save to store
    store.setTransformerConfig(config);
    store.setShowConfigModal(false);
    setSaving(false);
    onClose();
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isReconfigure) {
              // Don't close on backdrop click for mandatory config
            }
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="w-full max-w-lg"
          >
            <Card className="rounded-xl border shadow-xl">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-1">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                    <Building2 className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-medium">
                      {isReconfigure ? 'Change Transformer' : 'Configure Transformer'}
                    </CardTitle>
                    <CardDescription className="text-xs mt-0.5">
                      {isReconfigure
                        ? 'Update transformer specifications for monitoring'
                        : 'Set up your transformer specifications to start monitoring'}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-5">
                {/* KVA Input */}
                <div className="space-y-2">
                  <Label htmlFor="kva" className="text-sm font-medium">
                    Transformer Rating (KVA) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="kva"
                    type="number"
                    step="any"
                    min="0"
                    placeholder="e.g. 2"
                    value={kva}
                    onChange={(e) => {
                      setKva(e.target.value);
                      if (errors.kva) setErrors((prev) => ({ ...prev, kva: '' }));
                    }}
                    className="h-10"
                  />
                  {errors.kva && (
                    <p className="text-xs text-red-500 font-medium">{errors.kva}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Enter 1, 2, 3, 5, 10 or any custom KVA rating (supports decimals like 0.5, 1.5)
                  </p>
                </div>

                {/* Voltage Inputs */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primaryV" className="text-sm font-medium">
                      Primary Voltage (V) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="primaryV"
                      type="number"
                      step="any"
                      min="0"
                      placeholder="e.g. 230"
                      value={primaryVoltage}
                      onChange={(e) => {
                        setPrimaryVoltage(e.target.value);
                        if (errors.primaryVoltage) setErrors((prev) => ({ ...prev, primaryVoltage: '' }));
                      }}
                      className="h-10"
                    />
                    {errors.primaryVoltage && (
                      <p className="text-xs text-red-500 font-medium">{errors.primaryVoltage}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secondaryV" className="text-sm font-medium">
                      Secondary Voltage (V) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="secondaryV"
                      type="number"
                      step="any"
                      min="0"
                      placeholder="e.g. 120"
                      value={secondaryVoltage}
                      onChange={(e) => {
                        setSecondaryVoltage(e.target.value);
                        if (errors.secondaryVoltage) setErrors((prev) => ({ ...prev, secondaryVoltage: '' }));
                      }}
                      className="h-10"
                    />
                    {errors.secondaryVoltage && (
                      <p className="text-xs text-red-500 font-medium">{errors.secondaryVoltage}</p>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Optional Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">
                      Transformer Name
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Main Transformer"
                      value={transformerName}
                      onChange={(e) => setTransformerName(e.target.value)}
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-sm font-medium">
                      Location
                    </Label>
                    <Input
                      id="location"
                      type="text"
                      placeholder="Lab 1"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="h-10"
                    />
                  </div>
                </div>

                {/* Live Preview of Calculated Values */}
                {previewValues && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="rounded-lg border bg-muted/30 p-4"
                  >
                    <p className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-1.5">
                      <Zap className="h-3.5 w-3.5" />
                      Calculated Values Preview
                    </p>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Rated Primary Current</span>
                        <span className="font-medium text-foreground">
                          {previewValues.ratedPrimaryCurrent.toFixed(2)} A
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Rated Secondary Current</span>
                        <span className="font-medium text-foreground">
                          {previewValues.ratedSecondaryCurrent.toFixed(2)} A
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Primary Voltage Range</span>
                        <span className="font-medium text-foreground">
                          {previewValues.primaryVoltageLower.toFixed(0)}V — {previewValues.primaryVoltageUpper.toFixed(0)}V
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Secondary Voltage Range</span>
                        <span className="font-medium text-foreground">
                          {previewValues.secondaryVoltageLower.toFixed(0)}V — {previewValues.secondaryVoltageUpper.toFixed(0)}V
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-1">
                  {isReconfigure && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        store.setShowConfigModal(false);
                        onClose();
                      }}
                      className="h-10"
                    >
                      Cancel
                    </Button>
                  )}
                  <Button
                    onClick={handleStartMonitoring}
                    disabled={saving || !kva || !primaryVoltage || !secondaryVoltage}
                    className="h-10 flex-1 gap-2"
                  >
                    {saving ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Saving...
                      </span>
                    ) : (
                      <>
                        <Play className="h-4 w-4" />
                        {isReconfigure ? 'Update & Restart Monitoring' : 'Start Monitoring'}
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
