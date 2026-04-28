export const APP_NAME = 'TEDX';
export const APP_SUBTITLE = 'SECURITY TERMINAL v4.2.1';
export const APP_VERSION = '4.2.1';

export const SCANNER_STATUS = {
  ACTIVE: 'ACTIVE_SURVEILLANCE',
  SCANNING: 'SCANNING...',
  PROCESSING: 'PROCESSING_SIGNAL',
  IDLE: 'STANDBY',
} as const;

export const ACCESS_TYPES = {
  VIP: 'VIP',
  VOID: 'VOID',
  GENERAL: 'GENERAL',
} as const;

export const SCAN_RESULTS = {
  VALID: 'valid',
  INVALID: 'invalid',
  ALREADY_USED: 'already-used',
} as const;

export const MOCK_TICKETS = [
  {
    id: 'TKT-00491',
    holderName: 'AGENT REYES',
    group: 2,
    accessType: ACCESS_TYPES.VIP,
    status: 'valid' as const,
  },
  {
    id: 'TKT-00327',
    holderName: 'OPERATIVE ZHENG',
    group: 1,
    accessType: ACCESS_TYPES.VOID,
    status: 'valid' as const,
  },
  {
    id: 'TKT-00118',
    holderName: 'CONTACT MAREK',
    group: 4,
    accessType: ACCESS_TYPES.GENERAL,
    status: 'already-used' as const,
    usedAt: '2026-04-28T09:32:00Z',
  },
  {
    id: 'TKT-99999',
    holderName: '',
    group: 0,
    accessType: '',
    status: 'invalid' as const,
    reason: 'TICKET SIGNATURE MISMATCH — COUNTERFEIT DETECTED',
  },
] as const;
