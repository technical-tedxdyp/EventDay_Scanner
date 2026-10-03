import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  fetchScannerAnalytics,
  ScannerApiError,
  type ScannerAnalytics,
  type ScannerActivity,
} from "@/services/api";

export type ScanRecord = {
  id: string;
  name: string;
  ticketId: string;
  status: "valid" | "invalid" | "duplicate";
  time: Date;
};

type AnalyticsContextType = {
  analytics: ScannerAnalytics | null;
  history: ScanRecord[];
  totalScans: number;
  validCount: number;
  invalidCount: number;
  duplicateCount: number;
  activeEntries: number;
  loading: boolean;
  error: string | null;
  successRate: number;
  rejectionRate: number;
  duplicateRate: number;
  entryRate: number;
  peakWindow: string;
  refreshStats: () => Promise<void>;
};

const AnalyticsContext = createContext<AnalyticsContextType | null>(null);

const getRecordStatus = (activity: ScannerActivity): ScanRecord["status"] => {
  if (activity.outcome === "DUPLICATE") return "duplicate";
  if (activity.outcome === "DENIED") return "invalid";
  return "valid";
};

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const [analytics, setAnalytics] = useState<ScannerAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setAnalytics(await fetchScannerAnalytics());
    } catch (refreshError) {
      if (
        refreshError instanceof ScannerApiError &&
        refreshError.status === 401
      ) {
        setAnalytics(null);
        setError("Scanner session expired. Sign in again.");
      } else {
        setError(
          refreshError instanceof Error
            ? refreshError.message
            : "Unable to load live analytics.",
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshStats();
  }, [refreshStats]);

  const history = useMemo(
    () =>
      (analytics?.recentActivity || []).map((activity) => ({
        id: activity._id,
        name: (activity.booking?.name || "UNKNOWN ATTENDEE").toUpperCase(),
        ticketId: activity.ticketId,
        status: getRecordStatus(activity),
        time: new Date(activity.scannedAt),
      })),
    [analytics],
  );

  const values = useMemo(() => {
    const totalScans = analytics?.scans.total ?? 0;
    const validCount = analytics?.scans.verified ?? 0;
    const invalidCount = analytics?.scans.denied ?? 0;
    const duplicateCount = analytics?.scans.duplicate ?? 0;
    const records = analytics?.recentActivity ?? [];
    const admissionTimes = records
      .filter((activity) => activity.activityType === "ADMISSION")
      .map((activity) => new Date(activity.scannedAt).getTime())
      .filter(Number.isFinite);
    const entryRate =
      admissionTimes.length > 1
        ? admissionTimes.length /
          Math.max(
            (Math.max(...admissionTimes) - Math.min(...admissionTimes)) / 60000,
            1,
          )
        : admissionTimes.length;

    const buckets: Record<string, number> = {};
    for (const activity of records) {
      const date = new Date(activity.scannedAt);
      if (!Number.isFinite(date.getTime())) continue;
      const halfHour = Math.floor(date.getMinutes() / 30) * 30;
      const key = `${date.getHours()}:${String(halfHour).padStart(2, "0")}`;
      buckets[key] = (buckets[key] || 0) + 1;
    }
    const peakKey = Object.entries(buckets).sort(
      (left, right) => right[1] - left[1],
    )[0]?.[0];
    const peakWindow = peakKey
      ? (() => {
          const [hour, minute] = peakKey.split(":").map(Number);
          const start = new Date();
          start.setHours(hour, minute, 0, 0);
          const end = new Date(start.getTime() + 30 * 60000);
          return `${start.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} - ${end.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
        })()
      : "NO DATA";

    return {
      totalScans,
      validCount,
      invalidCount,
      duplicateCount,
      activeEntries: analytics?.admissions.uniqueBookings ?? 0,
      successRate: totalScans ? validCount / totalScans : 0,
      rejectionRate: totalScans ? invalidCount / totalScans : 0,
      duplicateRate: totalScans ? duplicateCount / totalScans : 0,
      entryRate,
      peakWindow,
    };
  }, [analytics]);

  const value = useMemo(
    () => ({ analytics, history, loading, error, refreshStats, ...values }),
    [analytics, history, loading, error, refreshStats, values],
  );

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (!context)
    throw new Error("useAnalytics must be used within AnalyticsProvider");
  return context;
}
