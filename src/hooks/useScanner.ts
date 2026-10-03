import { useCallback, useState } from "react";
import { useRouter } from "expo-router";
import {
  scanTicketByQr,
  ScannerApiError,
  type TicketResult,
} from "@/services/api";
import { useAnalytics } from "@/hooks/useAnalytics";

type ScannerState = {
  isScanning: boolean;
  lastResult: TicketResult | null;
  error: string | null;
};

export function useScanner() {
  const router = useRouter();
  const { refreshStats } = useAnalytics();
  const [state, setState] = useState<ScannerState>({
    isScanning: false,
    lastResult: null,
    error: null,
  });

  const handleResult = useCallback(
    (result: TicketResult, sessionId: string) => {
      setState({ isScanning: false, lastResult: result, error: null });

      if (result.status === "valid" && result.ticket) {
        router.push({
          pathname: "/(scanner)/valid",
          params: {
            holderName: result.ticket.holderName,
            group: String(result.ticket.group),
            ticketId: result.ticket.id,
            sessionId,
            sessionTitle: result.session?.title ?? "",
          },
        });
        return;
      }

      if (result.status === "already-used") {
        router.push({
          pathname: "/(scanner)/already-used",
          params: {
            holderName: result.ticket?.holderName ?? "ATTENDEE",
            usedAt: result.usedAt ?? "",
            ticketId: result.ticket?.id ?? "",
            sessionTitle: result.session?.title ?? "",
          },
        });
        return;
      }

      router.push({
        pathname: "/(scanner)/invalid",
        params: {
          reason: result.reason ?? "TICKET VERIFICATION DENIED",
          ticketId: result.ticket?.id ?? "",
        },
      });
    },
    [router],
  );

  const performQrScan = useCallback(
    async (qrData: string, sessionId: string) => {
      if (!sessionId) {
        setState((previous) => ({
          ...previous,
          error: "Select a session before scanning.",
        }));
        return;
      }
      setState((previous) => ({ ...previous, isScanning: true, error: null }));
      try {
        const result = await scanTicketByQr(qrData, sessionId);
        void refreshStats();
        handleResult(result, sessionId);
      } catch (error) {
        if (error instanceof ScannerApiError && error.status === 401) {
          router.replace("/(auth)/login");
          return;
        }
        const message =
          error instanceof Error ? error.message : "Unable to verify ticket.";
        setState((previous) => ({
          ...previous,
          isScanning: false,
          error: `NOT VERIFIED: ${message}`,
        }));
      }
    },
    [handleResult, refreshStats, router],
  );

  return {
    ...state,
    performQrScan,
  };
}
