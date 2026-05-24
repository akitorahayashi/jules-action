import { describe, expect, it, vi } from 'vitest';
import { createJulesSession } from '../../src/app/create-jules-session';
import type { Session } from '../../src/jules-api/session-contract';

function buildSession(source: string, branch: string): Session {
  return {
    name: 'sessions/123',
    id: '123',
    prompt: 'Create tests',
    sourceContext: {
      source,
      githubRepoContext: {
        startingBranch: branch,
      },
    },
  };
}

describe('createJulesSession', () => {
  it('uses explicit source and branch from action input', async () => {
    const createSession = vi
      .fn()
      .mockResolvedValue(buildSession('sources/github/acme/repo', 'release'));
    const listSources = vi.fn();
    const resolveSource = vi.fn().mockResolvedValue('sources/github/acme/repo');
    const resolveBranchName = vi.fn();

    const session = await createJulesSession(
      {
        apiKey: 'key-123',
        prompt: 'Create tests',
        source: 'sources/github/acme/repo',
        startingBranch: 'release',
      },
      {
        createClient: () => ({ createSession, listSources }),
        resolveRepositoryCoordinates: () => ({ owner: 'acme', repo: 'repo' }),
        resolveBranchName,
        resolveSource,
      },
    );

    expect(resolveBranchName).not.toHaveBeenCalled();
    expect(resolveSource).toHaveBeenCalledWith(
      { createSession, listSources },
      {
        explicitSourceName: 'sources/github/acme/repo',
        fallbackRepository: { owner: 'acme', repo: 'repo' },
      },
    );
    expect(createSession).toHaveBeenCalledWith({
      prompt: 'Create tests',
      sourceContext: {
        source: 'sources/github/acme/repo',
        githubRepoContext: {
          startingBranch: 'release',
        },
      },
      title: undefined,
      requirePlanApproval: undefined,
      automationMode: undefined,
    });
    expect(session).toEqual(
      buildSession('sources/github/acme/repo', 'release'),
    );
  });

  it('resolves repository source and branch when inputs are omitted', async () => {
    const createSession = vi
      .fn()
      .mockResolvedValue(buildSession('sources/github/acme/repo', 'main'));
    const listSources = vi.fn();
    const resolveSource = vi.fn().mockResolvedValue('sources/github/acme/repo');

    await createJulesSession(
      {
        apiKey: 'key-123',
        prompt: 'Create tests',
      },
      {
        createClient: () => ({ createSession, listSources }),
        resolveRepositoryCoordinates: () => ({ owner: 'acme', repo: 'repo' }),
        resolveBranchName: () => 'main',
        resolveSource,
      },
    );

    expect(resolveSource).toHaveBeenCalledWith(
      { createSession, listSources },
      {
        explicitSourceName: undefined,
        fallbackRepository: { owner: 'acme', repo: 'repo' },
      },
    );
    expect(createSession).toHaveBeenCalledWith({
      prompt: 'Create tests',
      sourceContext: {
        source: 'sources/github/acme/repo',
        githubRepoContext: {
          startingBranch: 'main',
        },
      },
      title: undefined,
      requirePlanApproval: undefined,
      automationMode: undefined,
    });
  });
});
