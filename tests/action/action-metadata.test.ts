import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import yaml from 'js-yaml';
import { describe, expect, it } from 'vitest';

interface ActionFile {
  runs: {
    using: string;
    main: string;
  };
  inputs: Record<string, { required?: boolean; default?: string }>;
  outputs: Record<string, unknown>;
}

function loadActionFile(path: string): ActionFile {
  const source = readFileSync(resolve(process.cwd(), path), 'utf8');
  const parsed = yaml.load(source);
  return parsed as ActionFile;
}

describe('action metadata contracts', () => {
  it('declares node24, create-session inputs, and session outputs', () => {
    const action = loadActionFile('action.yml');
    expect(action.runs.using).toBe('node24');
    expect(action.runs.main).toBe('dist/index.js');
    expect(action.inputs['api-key']).toBeUndefined();
    expect(action.inputs.prompt.required).toBe(true);
    expect(action.inputs.source.required).toBe(false);
    expect(action.inputs['starting-branch'].required).toBe(false);
    expect(action.inputs['require-plan-approval'].required).toBe(false);
    expect(action.inputs['require-plan-approval'].default).toBe('true');
    expect(action.inputs['automation-mode'].required).toBe(false);
    expect(action.inputs['automation-mode'].default).toBe('AUTO_CREATE_PR');
    expect(Object.keys(action.outputs)).toContain('session-name');
    expect(Object.keys(action.outputs)).toContain('session-id');
    expect(Object.keys(action.outputs)).toContain('resolved-source');
  });
});
