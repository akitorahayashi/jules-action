import * as core from '@actions/core';

function normalizeInput(rawValue: string): string | undefined {
  const normalizedValue = rawValue.trim();
  if (normalizedValue.length === 0) {
    return undefined;
  }
  return normalizedValue;
}

export function readRequiredInput(name: string): string {
  const value = normalizeInput(core.getInput(name));
  if (!value) {
    throw new Error(`Input '${name}' is required and must not be blank.`);
  }
  return value;
}

export function readOptionalInput(name: string): string | undefined {
  return normalizeInput(core.getInput(name));
}

export function readOptionalBooleanInput(name: string): boolean | undefined {
  const value = readOptionalInput(name);
  if (!value) {
    return undefined;
  }

  const normalized = value.toLowerCase();
  if (normalized === 'true') {
    return true;
  }
  if (normalized === 'false') {
    return false;
  }

  throw new Error(`Input '${name}' must be either 'true' or 'false'.`);
}

export function readRequiredEnvironmentVariable(name: string): string {
  const value = normalizeInput(process.env[name] ?? '');
  if (!value) {
    throw new Error(`Environment variable '${name}' is required.`);
  }
  return value;
}
