import { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { scanTicket, scanTicketByQr, type TicketResult } from '@/services/api';
import { useAnalytics } from '@/hooks/useAnalytics';

type ScannerState = {
  isScanning: boolean;
  lastResult: TicketResult | null;
  error: string | null;
};

export function useScanner() {
  const router = useRouter();
  const { recordScan } = useAnalytics();
  const [state, setState] = useState<ScannerState>({
    isScanning: false,
    lastResult: null,
    error: null,
  });

  const handleResult = useCallback((result: TicketResult) => {
    setState({ isScanning: false, lastResult: result, error: null });

    switch (result.status) {
      case 'valid':
        recordScan('valid', result.ticket?.holderName, result.ticket?.id);
        router.push({
          pathname: '/(scanner)/valid',
          params: {
            holderName: result.ticket?.holderName ?? '',
            group: String(result.ticket?.group ?? 0),
            accessType: result.ticket?.accessType ?? '',
            ticketId: result.ticket?.id ?? '',
          },
        });
        break;
      case 'already-used':
        recordScan('duplicate', result.ticket?.holderName, result.ticket?.id);
        router.push({
          pathname: '/(scanner)/already-used',
          params: {
            holderName: result.ticket?.holderName ?? '',
            usedAt: result.usedAt ?? '',
            ticketId: result.ticket?.id ?? '',
          },
        });
        break;
      case 'invalid':
        recordScan('invalid', 'UNKNOWN', 'N/A');
        router.push({
          pathname: '/(scanner)/invalid',
          params: {
            reason: result.reason ?? 'UNKNOWN ERROR',
          },
        });
        break;
    }
  }, [router, recordScan]);

  // Manual scan (simulated, cycles through mock data)
  const performScan = useCallback(async () => {
    setState((prev) => ({ ...prev, isScanning: true, error: null }));
    try {
      const result = await scanTicket();
      handleResult(result);
    } catch {
      setState((prev) => ({
        ...prev,
        isScanning: false,
        error: 'SYSTEM ERROR — CONNECTION LOST',
      }));
    }
  }, [handleResult]);

  // QR code scan (looks up actual ticket by scanned data)
  const performQrScan = useCallback(async (qrData: string) => {
    setState((prev) => ({ ...prev, isScanning: true, error: null }));
    try {
      const result = await scanTicketByQr(qrData);
      handleResult(result);
    } catch {
      setState((prev) => ({
        ...prev,
        isScanning: false,
        error: 'SYSTEM ERROR — QR DECODE FAILED',
      }));
    }
  }, [handleResult]);

  return {
    ...state,
    performScan,
    performQrScan,
  };
}
