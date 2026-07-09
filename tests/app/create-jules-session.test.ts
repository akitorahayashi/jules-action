import {
  githubSourceContext,
  prompt,
  type Session,
  sessionName,
  sourceName,
  startingBranch,
} from 'jls';
import { describe, expect, it, vi } from 'vitest';
import { createJulesSession } from '../../src/app/create-jules-session';

function buildSession(source: string, branch: string): Session {
  return {
    name: sessionName('sessions/123'),
    id: '123',
    prompt: prompt('Create tests'),
    sourceContext: githubSourceContext(
      sourceName(source),
      startingBranch(branch),
    ),
    outputs: [],
  };
}

describe('createJulesSession', () => {
  it('uses explicit source and branch from action input', async () => {
    const createSession = vi
      .fn()
      .mockResolvedValue(buildSession('sources/github/acme/repo', 'release'));
    const getSource = vi.fn();
    const resolveSource = vi
      .fn()
      .mockResolvedValue(sourceName('sources/github/acme/repo'));
    const resolveBranchName = vi.fn();

    const session = await createJulesSession(
      {
        apiKey: 'key-123',
        prompt: prompt('Create tests'),
        source: sourceName('sources/github/acme/repo'),
        startingBranch: startingBranch('release'),
        requirePlanApproval: true,
        automationMode: 'AUTO_CREATE_PR',
      },
      {
        createClient: () => ({ createSession, getSource }),
        resolveRepositoryCoordinates: () => ({ owner: 'acme', repo: 'repo' }),
        resolveBranchName,
        resolveSource,
      },
    );

    expect(resolveBranchName).not.toHaveBeenCalled();
    expect(resolveSource).toHaveBeenCalledWith(
      { createSession, getSource },
      {
        explicitSourceName: 'sources/github/acme/repo',
        fallbackRepository: { owner: 'acme', repo: 'repo' },
      },
    );
    expect(createSession).toHaveBeenCalledWith({
      prompt: 'Create tests',
      sourceContext: {
        source: 'sources/github/acme/repo',
        context: {
          kind: 'githubRepoContext',
          githubRepoContext: {
            startingBranch: 'release',
          },
        },
      },
      requirePlanApproval: true,
      automationMode: 'AUTO_CREATE_PR',
    });
    expect(session).toEqual(
      buildSession('sources/github/acme/repo', 'release'),
    );
  });

  it('resolves repository source and branch when inputs are omitted', async () => {
    const createSession = vi
      .fn()
      .mockResolvedValue(buildSession('sources/github/acme/repo', 'main'));
    const getSource = vi.fn();
    const resolveSource = vi
      .fn()
      .mockResolvedValue(sourceName('sources/github/acme/repo'));

    await createJulesSession(
      {
        apiKey: 'key-123',
        prompt: prompt('Create tests'),
        requirePlanApproval: true,
        automationMode: 'AUTO_CREATE_PR',
      },
      {
        createClient: () => ({ createSession, getSource }),
        resolveRepositoryCoordinates: () => ({ owner: 'acme', repo: 'repo' }),
        resolveBranchName: () => 'main',
        resolveSource,
      },
    );

    expect(resolveSource).toHaveBeenCalledWith(
      { createSession, getSource },
      {
        explicitSourceName: undefined,
        fallbackRepository: { owner: 'acme', repo: 'repo' },
      },
    );
    expect(createSession).toHaveBeenCalledWith({
      prompt: 'Create tests',
      sourceContext: {
        source: 'sources/github/acme/repo',
        context: {
          kind: 'githubRepoContext',
          githubRepoContext: {
            startingBranch: 'main',
          },
        },
      },
      requirePlanApproval: true,
      automationMode: 'AUTO_CREATE_PR',
    });
  });
});
