export const APP_NAME = 'TEDxDYP';

export const SCANNER_STATUS = {
  ACTIVE: 'ACTIVE_SURVEILLANCE',
  SCANNING: 'SCANNING...',
  PROCESSING: 'PROCESSING_SIGNAL',
  IDLE: 'STANDBY',
} as const;

export const SCAN_RESULTS = {
  VALID: 'valid',
  INVALID: 'invalid',
  ALREADY_USED: 'already-used',
} as const;
