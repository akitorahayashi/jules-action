export const julesApiVersionBaseUrl = 'https://jules.googleapis.com/v1alpha/';

export const automationModes = [
  'AUTOMATION_MODE_UNSPECIFIED',
  'AUTO_CREATE_PR',
] as const;

export const sessionStates = [
  'STATE_UNSPECIFIED',
  'QUEUED',
  'PLANNING',
  'AWAITING_PLAN_APPROVAL',
  'AWAITING_USER_FEEDBACK',
  'IN_PROGRESS',
  'PAUSED',
  'FAILED',
  'COMPLETED',
] as const;

export const sessionNamePattern = /^sessions\/[^/]+$/;
export const sourceNamePattern = /^sources\/.+$/;

export const sourcesPageSizeMaximum = 100;
export const julesApiRequestTimeoutMs = 30_000;
