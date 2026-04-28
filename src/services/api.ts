import { MOCK_TICKETS } from '@/utils/constants';

export type TicketResult = {
  status: 'valid' | 'invalid' | 'already-used';
  ticket?: {
    id: string;
    holderName: string;
    group: number;
    accessType: string;
  };
  reason?: string;
  usedAt?: string;
};

let scanIndex = 0;
const usedTickets = new Set<string>();

/**
 * Simulates a ticket scan by cycling through mock data.
 */
export async function scanTicket(): Promise<TicketResult> {
  const delay = 800 + Math.random() * 700;
  await new Promise((resolve) => setTimeout(resolve, delay));

  const ticket = MOCK_TICKETS[scanIndex % MOCK_TICKETS.length];
  scanIndex++;

  if (ticket.status === 'valid') {
    return {
      status: 'valid',
      ticket: {
        id: ticket.id,
        holderName: ticket.holderName,
        group: ticket.group,
        accessType: ticket.accessType,
      },
    };
  }

  if (ticket.status === 'already-used') {
    return {
      status: 'already-used',
      ticket: {
        id: ticket.id,
        holderName: ticket.holderName,
        group: ticket.group,
        accessType: ticket.accessType,
      },
      usedAt: ticket.usedAt,
    };
  }

  return {
    status: 'invalid',
    reason: ticket.reason ?? 'UNKNOWN ERROR — ACCESS DENIED',
  };
}

/**
 * Ticket lookup by QR code data (ticket ID).
 * Checks the scanned value against known tickets.
 */
export async function scanTicketByQr(qrData: string): Promise<TicketResult> {
  const delay = 600 + Math.random() * 400;
  await new Promise((resolve) => setTimeout(resolve, delay));

  const trimmed = qrData.trim().toUpperCase();

  // Find matching ticket
  const ticket = MOCK_TICKETS.find((t) => t.id === trimmed);

  if (!ticket) {
    return {
      status: 'invalid',
      reason: `UNRECOGNIZED TICKET: ${trimmed} — NOT IN SYSTEM`,
    };
  }

  // Check if already used
  if (usedTickets.has(ticket.id) || ticket.status === 'already-used') {
    usedTickets.add(ticket.id);
    return {
      status: 'already-used',
      ticket: {
        id: ticket.id,
        holderName: ticket.holderName,
        group: ticket.group,
        accessType: ticket.accessType,
      },
      usedAt: ticket.status === 'already-used'
        ? ticket.usedAt
        : new Date().toISOString(),
    };
  }

  if (ticket.status === 'invalid') {
    return {
      status: 'invalid',
      reason: ticket.reason ?? 'TICKET VALIDATION FAILED',
    };
  }

  // Mark as used and return valid
  usedTickets.add(ticket.id);
  return {
    status: 'valid',
    ticket: {
      id: ticket.id,
      holderName: ticket.holderName,
      group: ticket.group,
      accessType: ticket.accessType,
    },
  };
}

/**
 * Mock login — accepts any non-empty credentials.
 */
export async function login(
  username: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  if (username.trim().length === 0 || password.trim().length === 0) {
    return { success: false, error: 'CREDENTIALS REQUIRED' };
  }

  if (password.length < 3) {
    return { success: false, error: 'AUTHENTICATION FAILED — INVALID CREDENTIALS' };
  }

  return { success: true };
}
