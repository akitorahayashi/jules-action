import * as core from '@actions/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { resolveCreateSessionActionRequest } from '../../src/action/create-session-request';

vi.mock('@actions/core', () => ({
  getInput: vi.fn(),
}));

const mockedGetInput = vi.mocked(core.getInput);
const originalEnvironment = { ...process.env };

describe('resolveCreateSessionActionRequest', () => {
  afterEach(() => {
    mockedGetInput.mockReset();
    process.env = { ...originalEnvironment };
  });

  it('fails when JULES_API_KEY is missing', () => {
    process.env.JULES_API_KEY = '';
    mockedGetInput.mockImplementation((name: string) =>
      name === 'prompt' ? 'create tests' : '',
    );

    expect(() => resolveCreateSessionActionRequest()).toThrow(
      "Environment variable 'JULES_API_KEY' is required.",
    );
  });

  it('normalizes and validates all supported inputs', () => {
    process.env.JULES_API_KEY = '  key-123 ';
    mockedGetInput.mockImplementation((name: string) => {
      switch (name) {
        case 'prompt':
          return ' add CI checks ';
        case 'source':
          return ' sources/github/acme/repo ';
        case 'starting-branch':
          return ' main ';
        case 'title':
          return ' Improve CI ';
        case 'require-plan-approval':
          return ' TRUE ';
        case 'automation-mode':
          return 'AUTO_CREATE_PR';
        default:
          return '';
      }
    });

    expect(resolveCreateSessionActionRequest()).toEqual({
      apiKey: 'key-123',
      prompt: 'add CI checks',
      source: 'sources/github/acme/repo',
      startingBranch: 'main',
      title: 'Improve CI',
      requirePlanApproval: true,
      automationMode: 'AUTO_CREATE_PR',
    });
  });

  it('applies explicit defaults when optional settings are omitted', () => {
    process.env.JULES_API_KEY = 'key-123';
    mockedGetInput.mockImplementation((name: string) => {
      if (name === 'prompt') {
        return 'add tests';
      }
      return '';
    });

    expect(resolveCreateSessionActionRequest()).toEqual({
      apiKey: 'key-123',
      prompt: 'add tests',
      source: undefined,
      startingBranch: undefined,
      title: undefined,
      requirePlanApproval: true,
      automationMode: 'AUTO_CREATE_PR',
    });
  });

  it('fails when require-plan-approval is not a boolean', () => {
    process.env.JULES_API_KEY = 'key-123';
    mockedGetInput.mockImplementation((name: string) => {
      if (name === 'prompt') {
        return 'add tests';
      }
      if (name === 'require-plan-approval') {
        return 'sometimes';
      }
      return '';
    });

    expect(() => resolveCreateSessionActionRequest()).toThrow(
      "Input 'require-plan-approval' must be either 'true' or 'false'.",
    );
  });

  it('fails when source format is invalid', () => {
    process.env.JULES_API_KEY = 'key-123';
    mockedGetInput.mockImplementation((name: string) => {
      if (name === 'prompt') {
        return 'add tests';
      }
      if (name === 'source') {
        return 'sources/';
      }
      return '';
    });

    expect(() => resolveCreateSessionActionRequest()).toThrow(
      "Input 'source' is invalid: source name cannot be empty.",
    );
  });

  it('fails when automation-mode is not a known mode', () => {
    process.env.JULES_API_KEY = 'key-123';
    mockedGetInput.mockImplementation((name: string) => {
      if (name === 'prompt') {
        return 'add tests';
      }
      if (name === 'automation-mode') {
        return 'ALWAYS';
      }
      return '';
    });

    expect(() => resolveCreateSessionActionRequest()).toThrow(
      "Input 'automation-mode' must be one of: AUTOMATION_MODE_UNSPECIFIED, AUTO_CREATE_PR.",
    );
  });
});
