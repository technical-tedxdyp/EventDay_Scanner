import { Platform } from "react-native";
import {
  clearScannerToken,
  readScannerToken,
  saveScannerToken,
} from "@/services/scanner-auth-storage";

export type ScannerSession = {
  _id: string;
  title: string;
  day: number;
  startTime: string;
  endTime: string;
  includedSessions?: Array<string | { _id: string }>;
};

export type TicketSession = {
  id: string;
  title: string;
  day: number;
  startTime?: string;
  endTime?: string;
  alreadyCheckedIn: boolean;
  checkedInAt: string | null;
  checkedInBy: string | null;
};

export type TicketResult = {
  status: "valid" | "invalid" | "already-used";
  ticket?: {
    id: string;
    holderName: string;
    group: number;
    email?: string;
    phone?: string;
    bookingStatus?: string;
  };
  session?: TicketSession;
  entitledSessions?: TicketSession[];
  reason?: string;
  usedAt?: string;
};

export type ScannerActivity = {
  _id: string;
  activityType: "SCAN_ATTEMPT" | "ADMISSION";
  ticketId: string;
  outcome: string;
  scannedBy: string;
  scannedAt: string;
  reason?: string;
  booking?: { name?: string; ticketCount?: number };
  session?: { title?: string; day?: number };
  operator?: { username?: string; role?: string };
};

export type ScannerAnalytics = {
  scans: { total: number; verified: number; denied: number; duplicate: number };
  admissions: { total: number; uniqueBookings: number };
  bySession: Array<{
    sessionId: string;
    title: string;
    day: number | null;
    admissions: number;
    uniqueBookings: number;
  }>;
  recentActivity: ScannerActivity[];
};

type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  data?: T;
};

export class ScannerApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ScannerApiError";
    this.status = status;
  }
}

const getApiBaseUrl = (): string => {
  const configuredUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (configuredUrl) return configuredUrl.replace(/\/$/, "");
  return "";
};

export const API_BASE_URL = getApiBaseUrl();

const parseResponse = async <T>(
  response: Response,
): Promise<ApiEnvelope<T>> => {
  let payload: ApiEnvelope<T>;
  try {
    payload = (await response.json()) as ApiEnvelope<T>;
  } catch {
    throw new ScannerApiError(
      "The server returned an unreadable response.",
      response.status,
    );
  }

  if (!response.ok || !payload.success) {
    const message =
      payload.message || `Request failed with status ${response.status}.`;
    if (response.status === 401) await clearScannerToken();
    throw new ScannerApiError(message, response.status);
  }
  return payload;
};

const request = async <T>(
  path: string,
  init: RequestInit = {},
  authenticated = true,
  requireData = true,
): Promise<T> => {
  if (!API_BASE_URL) {
    throw new ScannerApiError(
      "Scanner API is not configured. Set EXPO_PUBLIC_API_URL to the staging API base URL.",
      503,
    );
  }
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.body) headers.set("Content-Type", "application/json");

  if (authenticated) {
    const token = await readScannerToken();
    if (!token)
      throw new ScannerApiError("Scanner session expired. Sign in again.", 401);
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
  const envelope = await parseResponse<T>(response);
  if (envelope.data === undefined && requireData)
    throw new ScannerApiError(
      "The server response did not include data.",
      response.status,
    );
  return envelope.data as T;
};

export async function loginWithScannerAccessCode(
  accessCode: string,
): Promise<void> {
  if (Platform.OS === "web") {
    throw new ScannerApiError(
      "Scanner login requires a native iOS or Android device with secure storage.",
      400,
    );
  }
  const response = await request<{ token: string }>(
    "/admin/scanner/access",
    {
      method: "POST",
      body: JSON.stringify({ accessCode }),
    },
    false,
  );

  if (!response.token) {
    throw new ScannerApiError(
      "The server returned incomplete scanner credentials.",
      502,
    );
  }
  await saveScannerToken(response.token);
}

export async function logoutScannerOperator(): Promise<void> {
  try {
    await request<null>(
      "/admin/scanner/logout",
      { method: "POST" },
      true,
      false,
    );
  } finally {
    await clearScannerToken();
  }
}

export async function fetchScannerSessions(): Promise<ScannerSession[]> {
  const sessions = await request<ScannerSession[]>("/session", {}, false);
  if (!Array.isArray(sessions))
    throw new ScannerApiError(
      "The server returned an invalid session list.",
      502,
    );
  return sessions
    .filter((session) => !session.includedSessions?.length)
    .map((session) => ({ ...session, _id: String(session._id) }));
}

export function extractTicketId(qrData: string): string {
  const trimmed = qrData.trim();
  try {
    const parsed: unknown = JSON.parse(trimmed);
    if (parsed && typeof parsed === "object") {
      const payload = parsed as {
        ticketId?: unknown;
        id?: unknown;
        bookingId?: unknown;
      };
      const identifier = payload.ticketId || payload.id || payload.bookingId;
      if (typeof identifier === "string" && identifier.trim())
        return identifier.trim();
    }
  } catch {
    return trimmed;
  }
  return trimmed;
}

export async function scanTicketByQr(
  qrData: string,
  sessionId: string,
): Promise<TicketResult> {
  const ticketId = extractTicketId(qrData);
  const response = await request<{
    valid: boolean;
    outcome?: "VERIFIED" | "DENIED" | "DUPLICATE";
    reason?: string;
    alreadyCheckedIn?: boolean;
    checkedInAt?: string | null;
    selectedSession?: TicketSession | null;
    entitledSessions?: TicketSession[];
    booking?: {
      id: string;
      ticketId: string;
      name: string;
      email?: string;
      phone?: string;
      ticketCount: number;
      bookingStatus: string;
    };
  }>("/admin/scanner/ticket/verify", {
    method: "POST",
    body: JSON.stringify({ ticketId, qrPayload: qrData, sessionId }),
  });

  const booking = response.booking;
  if (!response.valid) {
    return {
      status: "invalid",
      reason: response.reason || "Ticket verification was denied.",
      ticket: booking
        ? {
            id: booking.ticketId || booking.id || ticketId,
            holderName: booking.name || "ATTENDEE",
            group: booking.ticketCount || 1,
            email: booking.email,
            phone: booking.phone,
            bookingStatus: booking.bookingStatus,
          }
        : undefined,
      entitledSessions: response.entitledSessions,
    };
  }

  const ticket = {
    id: booking?.ticketId || booking?.id || ticketId,
    holderName: booking?.name || "ATTENDEE",
    group: booking?.ticketCount || 1,
    email: booking?.email,
    phone: booking?.phone,
    bookingStatus: booking?.bookingStatus,
  };
  const duplicate =
    response.outcome === "DUPLICATE" || response.alreadyCheckedIn === true;

  return {
    status: duplicate ? "already-used" : "valid",
    ticket,
    session: response.selectedSession || undefined,
    entitledSessions: response.entitledSessions || [],
    usedAt:
      response.selectedSession?.checkedInAt ||
      response.checkedInAt ||
      undefined,
  };
}

export async function checkInTicket(
  ticketId: string,
  sessionId: string,
): Promise<{ checkedInAt: string }> {
  const response = await request<{
    checkedInAt: string;
    booking: { ticketId: string; ticketCount: number };
    session: { id: string; title: string };
  }>("/admin/scanner/ticket/check-in", {
    method: "POST",
    body: JSON.stringify({ ticketId: extractTicketId(ticketId), sessionId }),
  });

  if (!response.checkedInAt || !response.session?.id) {
    throw new ScannerApiError("The server did not confirm the admission.", 502);
  }
  return { checkedInAt: response.checkedInAt };
}

export async function fetchScannerAnalytics(): Promise<ScannerAnalytics> {
  return request<ScannerAnalytics>("/admin/scanner/analytics/scans");
}
