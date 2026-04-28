import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

export type ScanRecord = {
  id: string;
  name: string;
  ticketId: string;
  status: 'valid' | 'invalid' | 'duplicate';
  time: Date;
};

type AnalyticsState = {
  totalScans: number;
  validCount: number;
  invalidCount: number;
  duplicateCount: number;
  activeEntries: number;
  history: ScanRecord[];
};

type AnalyticsContextType = AnalyticsState & {
  recordScan: (type: 'valid' | 'invalid' | 'duplicate', name?: string, ticketId?: string) => void;
  successRate: number;
  rejectionRate: number;
  duplicateRate: number;
  entryRate: number;
  peakWindow: string;
};

const MOCK_HISTORY: ScanRecord[] = [
  { id: 'm1', name: 'AGENT COLE', ticketId: 'TKT-00201', status: 'valid', time: new Date(Date.now() - 3600000 * 2) },
  { id: 'm2', name: 'OPERATIVE NASH', ticketId: 'TKT-00145', status: 'valid', time: new Date(Date.now() - 3600000 * 1.5) },
  { id: 'm3', name: 'CONTACT LIU', ticketId: 'TKT-00089', status: 'invalid', time: new Date(Date.now() - 3600000) },
  { id: 'm4', name: 'AGENT VOLKOV', ticketId: 'TKT-00312', status: 'valid', time: new Date(Date.now() - 2700000) },
  { id: 'm5', name: 'ASSET BRENNAN', ticketId: 'TKT-00067', status: 'duplicate', time: new Date(Date.now() - 1800000) },
  { id: 'm6', name: 'OPERATIVE DIAZ', ticketId: 'TKT-00411', status: 'valid', time: new Date(Date.now() - 1200000) },
  { id: 'm7', name: 'CONTACT YUEN', ticketId: 'TKT-00288', status: 'valid', time: new Date(Date.now() - 600000) },
];

const INITIAL_STATE: AnalyticsState = {
  totalScans: 7,
  validCount: 5,
  invalidCount: 1,
  duplicateCount: 1,
  activeEntries: 5,
  history: MOCK_HISTORY,
};

const AnalyticsContext = createContext<AnalyticsContextType | null>(null);

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AnalyticsState>(INITIAL_STATE);

  const recordScan = useCallback((type: 'valid' | 'invalid' | 'duplicate', name?: string, ticketId?: string) => {
    const record: ScanRecord = {
      id: `s-${Date.now()}`,
      name: name || 'UNKNOWN',
      ticketId: ticketId || 'TKT-XXXXX',
      status: type,
      time: new Date(),
    };

    setState((prev) => ({
      totalScans: prev.totalScans + 1,
      validCount: prev.validCount + (type === 'valid' ? 1 : 0),
      invalidCount: prev.invalidCount + (type === 'invalid' ? 1 : 0),
      duplicateCount: prev.duplicateCount + (type === 'duplicate' ? 1 : 0),
      activeEntries: prev.activeEntries + (type === 'valid' ? 1 : 0),
      history: [record, ...prev.history].slice(0, 50),
    }));
  }, []);

  const derived = useMemo(() => {
    const total = state.totalScans || 1;
    const successRate = state.validCount / total;
    const rejectionRate = state.invalidCount / total;
    const duplicateRate = state.duplicateCount / total;

    // Entry rate: entries per minute based on history time span
    let entryRate = 0;
    if (state.history.length >= 2) {
      const newest = state.history[0].time.getTime();
      const oldest = state.history[state.history.length - 1].time.getTime();
      const minutes = Math.max((newest - oldest) / 60000, 1);
      entryRate = state.totalScans / minutes;
    }

    // Peak window: find 30-min window with most scans
    let peakWindow = 'NO DATA';
    if (state.history.length > 0) {
      const buckets: Record<string, number> = {};
      for (const scan of state.history) {
        const d = scan.time;
        const halfHour = Math.floor(d.getMinutes() / 30) * 30;
        const key = `${d.getHours()}:${halfHour.toString().padStart(2, '0')}`;
        buckets[key] = (buckets[key] || 0) + 1;
      }
      let maxKey = '';
      let maxCount = 0;
      for (const [key, count] of Object.entries(buckets)) {
        if (count > maxCount) { maxCount = count; maxKey = key; }
      }
      if (maxKey) {
        const [h, m] = maxKey.split(':').map(Number);
        const endM = m + 30;
        const endH = endM >= 60 ? h + 1 : h;
        const endMin = endM >= 60 ? endM - 60 : endM;
        const fmt = (hr: number, mn: number) => {
          const suffix = hr >= 12 ? 'PM' : 'AM';
          const h12 = hr % 12 || 12;
          return `${h12}:${mn.toString().padStart(2, '0')} ${suffix}`;
        };
        peakWindow = `${fmt(h, m)} - ${fmt(endH, endMin)}`;
      }
    }

    return { successRate, rejectionRate, duplicateRate, entryRate, peakWindow };
  }, [state]);

  const value = useMemo(() => ({ ...state, ...derived, recordScan }), [state, derived, recordScan]);

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  const ctx = useContext(AnalyticsContext);
  if (!ctx) throw new Error('useAnalytics must be used within AnalyticsProvider');
  return ctx;
}
